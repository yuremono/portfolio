#!/usr/bin/env node
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

async function main() {
  const { configPath, urlOverride } = parseArgs(process.argv.slice(2));

  if (!configPath) {
    console.error("Usage: node scroll-capture.mjs [--config path/to/config.json] URL");
    process.exit(1);
  }
  if (!urlOverride) {
    console.error("URL is required. Example: ./scroll-capture https://example.com");
    process.exit(1);
  }

  if (typeof WebSocket === "undefined") {
    console.error("This script requires a Node.js runtime with global WebSocket support.");
    process.exit(1);
  }

  const config = JSON.parse(await readFile(configPath, "utf8"));
  config.url = urlOverride;
  const normalized = await normalizeConfig(config);

  const userDataDir = await mkdtemp(path.join(tmpdir(), "scroll-capture-chrome-"));
  const chrome = launchChrome(normalized, userDataDir);

  try {
    await runCdpCapture(normalized);
  } finally {
    await terminateChrome(chrome);
    await removeDirWithRetry(userDataDir);
  }
}

async function runCdpCapture(config) {
  await waitForChrome(config.chrome.remoteDebuggingPort);
  const browserWsUrl = await getBrowserWebSocketUrl(config.chrome.remoteDebuggingPort);
  const cdp = await CdpClient.connect(browserWsUrl);
  const { targetId, sessionId } = await createPageSession(cdp);

  try {
    await preparePage(cdp, sessionId, config);
    const shots = await captureScrollSequence(cdp, sessionId, config);

    await writeFile(path.join(config.output.dir, "meta.json"), JSON.stringify({
      url: config.url,
      capturedAt: new Date().toISOString(),
      viewport: config.viewport,
      scroll: config.scroll,
      capture: config.capture,
      finalScrollHeight: shots.finalScrollHeight,
      shots: shots.items
    }, null, 2));
  } finally {
    await cdp.send("Target.closeTarget", { targetId });
    cdp.close();
  }
}

async function normalizeConfig(input) {
  const url = String(input.url || "");
  if (!url) throw new Error("config.url is required");

  const viewport = {
    width: Number(input.viewport?.width ?? 1440),
    height: Number(input.viewport?.height ?? 1000),
    deviceScaleFactor: 1
  };

  const scroll = {
    startY: Number(input.scroll?.startY ?? 0),
    endY: input.scroll?.endY == null || input.scroll.endY === "auto" ? "auto" : Number(input.scroll.endY),
    step: Number(input.scroll?.step ?? 100),
    wheelIntervalMs: Number(input.scroll?.wheelIntervalMs ?? 40),
    initialWaitMs: Number(input.scroll?.initialWaitMs ?? input.scroll?.waitMs ?? 300),
    waitMs: Number(input.scroll?.waitMs ?? 300),
    maxShots: Number(input.scroll?.maxShots ?? 300)
  };

  const capture = {
    format: input.capture?.format === "jpeg" ? "jpeg" : "png",
    quality: Number(input.capture?.quality ?? 90)
  };

  const chrome = {
    headless: true,
    remoteDebuggingPort: Number(input.chrome?.remoteDebuggingPort ?? 9223),
    extraArgs: []
  };

  const output = {
    dir: await resolveOutputDir(String(input.output?.dir || "tmp/scroll-captures/{site}"), url),
    writeMeta: true
  };

  const preCapture = {
    dismissCookieBanner: Boolean(input.preCapture?.dismissCookieBanner ?? input.dismissCookieBanner ?? false)
  };

  if (viewport.width < 1 || viewport.height < 1) throw new Error("viewport width and height must be positive");
  if (scroll.startY < 0) throw new Error("scroll.startY must be zero or positive");
  if (scroll.endY !== "auto" && scroll.endY < scroll.startY) throw new Error("scroll.endY must be greater than or equal to scroll.startY");
  if (scroll.step < 1) throw new Error("scroll.step must be positive");
  if (scroll.wheelIntervalMs < 0) throw new Error("scroll.wheelIntervalMs must be zero or positive");
  if (scroll.initialWaitMs < 0) throw new Error("scroll.initialWaitMs must be zero or positive");
  if (scroll.maxShots < 1) throw new Error("scroll.maxShots must be positive");

  return {
    url,
    viewport,
    scroll,
    capture,
    chrome,
    output,
    preCapture
  };
}

function parseArgs(args) {
  const defaultConfigPath = path.resolve(import.meta.dirname, "../config.json");

  if (args.length === 0) {
    return { configPath: null, urlOverride: null };
  }

  if (args[0] === "--config" || args[0] === "-c") {
    return {
      configPath: args[1] || null,
      urlOverride: args[2] || null
    };
  }

  if (args[0].endsWith(".json")) {
    return {
      configPath: args[0],
      urlOverride: args[1] || null
    };
  }

  return {
    configPath: defaultConfigPath,
    urlOverride: args[0]
  };
}

async function resolveOutputDir(template, url) {
  const siteDir = template.replaceAll("{site}", siteNameFromUrl(url));
  await mkdir(siteDir, { recursive: true });

  for (let index = 1; index < 10000; index += 1) {
    const runDir = path.join(siteDir, `r${String(index).padStart(3, "0")}`);
    try {
      await mkdir(runDir);
      return runDir;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
  }

  throw new Error(`Could not create run directory under ${siteDir}`);
}

function siteNameFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").replace(/[^a-zA-Z0-9.-]+/g, "-");
  } catch {
    return "site";
  }
}

function launchChrome(config, userDataDir) {
  const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const args = [
    `--remote-debugging-port=${config.chrome.remoteDebuggingPort}`,
    `--user-data-dir=${userDataDir}`,
    `--window-size=${config.viewport.width},${config.viewport.height}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--disable-sync",
    "--new-window",
    "about:blank",
    ...config.chrome.extraArgs
  ];

  if (config.chrome.headless) {
    args.unshift("--headless=new");
  }

  const child = spawn(chromePath, args, {
    stdio: ["ignore", "ignore", "pipe"]
  });

  child.stderr.on("data", (data) => {
    const text = String(data);
    if (text.includes("DevTools listening")) return;
    if (process.env.SCROLL_CAPTURE_DEBUG) process.stderr.write(text);
  });

  child.on("error", (error) => {
    console.error(`Failed to launch Chrome: ${error.message}`);
  });

  return child;
}

async function createPageSession(cdp) {
  const { targetId } = await cdp.send("Target.createTarget", {
    url: "about:blank"
  });
  const { sessionId } = await cdp.send("Target.attachToTarget", {
    targetId,
    flatten: true
  });

  return { targetId, sessionId };
}

async function preparePage(cdp, sessionId, config) {
  await cdp.send("Page.enable", {}, sessionId);
  await cdp.send("Runtime.enable", {}, sessionId);
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: config.viewport.width,
    height: config.viewport.height,
    deviceScaleFactor: config.viewport.deviceScaleFactor,
    mobile: false
  }, sessionId);

  await navigate(cdp, sessionId, config.url);
  await settle(cdp, sessionId, config.scroll.initialWaitMs);

  if (config.preCapture.dismissCookieBanner) {
    await dismissCookieBanner(cdp, sessionId);
    await settle(cdp, sessionId, config.scroll.waitMs);
  }
}

async function captureScrollSequence(cdp, sessionId, config) {
  const items = [];
  let scrollHeight = await getScrollHeight(cdp, sessionId);
  const endY = config.scroll.endY === "auto"
    ? Math.max(0, scrollHeight - config.viewport.height)
    : config.scroll.endY;

  await moveWheelPointer(cdp, sessionId, config.viewport);
  let actualY = await getScrollY(cdp, sessionId);
  if (config.scroll.startY > 0) {
    actualY = await wheelUntil(cdp, sessionId, config, actualY, config.scroll.startY);
  }

  for (let index = 0; index < config.scroll.maxShots; index += 1) {
    await settle(cdp, sessionId, config.scroll.waitMs);
    actualY = await getScrollY(cdp, sessionId);
    scrollHeight = await getScrollHeight(cdp, sessionId);

    const file = await captureViewport(cdp, sessionId, config, index, actualY);
    items.push({ index, actualY, file });
    console.log(`captured ${file}`);

    if (actualY > 0 && actualY >= endY) break;
    actualY = await wheelStep(cdp, sessionId, config);
  }

  return { finalScrollHeight: scrollHeight, items };
}

async function captureViewport(cdp, sessionId, config, index, actualY) {
  const extension = config.capture.format === "jpeg" ? "jpg" : "png";
  const fileName = `${String(index).padStart(4, "0")}-${String(Math.round(actualY)).padStart(6, "0")}.${extension}`;
  const filePath = path.join(config.output.dir, fileName);
  const screenshot = await cdp.send("Page.captureScreenshot", {
    format: config.capture.format,
    quality: config.capture.format === "jpeg" ? config.capture.quality : undefined,
    omitBackground: false,
    fromSurface: true,
    captureBeyondViewport: false
  }, sessionId);

  await writeFile(filePath, Buffer.from(screenshot.data, "base64"));
  return fileName;
}

async function dismissCookieBanner(cdp, sessionId) {
  await evaluate(cdp, sessionId, `
(() => {
  const labels = ['Reject all', 'Accept all', '拒否', '同意しない', 'すべて拒否', 'すべて許可'];
  const nodes = [...document.querySelectorAll('button, [role="button"], a')];
  const target = nodes.find((node) => {
    const text = (node.innerText || node.textContent || '').trim();
    return labels.some((label) => text.includes(label));
  });
  if (target) target.click();
})()
`);
}

async function waitForChrome(port) {
  const started = Date.now();
  while (Date.now() - started < 10000) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {
      await delay(150);
    }
  }
  throw new Error(`Chrome did not start on remote debugging port ${port}`);
}

async function getBrowserWebSocketUrl(port) {
  const response = await fetch(`http://127.0.0.1:${port}/json/version`);
  const json = await response.json();
  return json.webSocketDebuggerUrl;
}

async function navigate(cdp, sessionId, url) {
  const loaded = new Promise((resolve) => {
    cdp.once("Page.loadEventFired", resolve, sessionId);
  });
  await cdp.send("Page.navigate", { url }, sessionId);
  await Promise.race([loaded, delay(15000)]);
}

async function settle(cdp, sessionId, waitMs) {
  await evaluate(cdp, sessionId, "new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve))))", true);
  await delay(waitMs);
}

async function moveWheelPointer(cdp, sessionId, viewport) {
  await cdp.send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: Math.round(viewport.width / 2),
    y: Math.round(viewport.height / 2)
  }, sessionId);
}

async function wheelUntil(cdp, sessionId, config, fromY, targetY) {
  let previousY = fromY;
  let stuckFrames = 0;
  const maxWheelEvents = 8;

  for (let i = 0; i < maxWheelEvents; i += 1) {
    await cdp.send("Input.dispatchMouseEvent", {
      type: "mouseWheel",
      x: Math.round(config.viewport.width / 2),
      y: Math.round(config.viewport.height / 2),
      deltaX: 0,
      deltaY: config.scroll.step
    }, sessionId);

    await delay(config.scroll.wheelIntervalMs);
    const currentY = await getScrollY(cdp, sessionId);
    if (currentY >= targetY) return currentY;

    if (currentY === previousY) {
      stuckFrames += 1;
      if (stuckFrames >= 12) return currentY;
    } else {
      stuckFrames = 0;
    }
    previousY = currentY;
  }

  return getScrollY(cdp, sessionId);
}

async function wheelStep(cdp, sessionId, config) {
  await cdp.send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: Math.round(config.viewport.width / 2),
    y: Math.round(config.viewport.height / 2),
    deltaX: 0,
    deltaY: config.scroll.step
  }, sessionId);
  await delay(config.scroll.wheelIntervalMs);

  return getScrollY(cdp, sessionId);
}

async function getScrollY(cdp, sessionId) {
  return Number(await evaluate(cdp, sessionId, "window.scrollY"));
}

async function getScrollHeight(cdp, sessionId) {
  return Number(await evaluate(cdp, sessionId, "Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)"));
}

async function evaluate(cdp, sessionId, expression, awaitPromise = false) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise,
    returnByValue: true
  }, sessionId);

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime.evaluate failed");
  }

  return result.result?.value;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function terminateChrome(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;

  const exited = new Promise((resolve) => {
    child.once("exit", resolve);
  });

  child.kill("SIGTERM");
  await Promise.race([exited, delay(2000)]);

  if (child.exitCode === null && child.signalCode === null) {
    child.kill("SIGKILL");
    await Promise.race([exited, delay(1000)]);
  }
}

async function removeDirWithRetry(dir) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await rm(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      return;
    } catch (error) {
      if (attempt === 4) throw error;
      await delay(250);
    }
  }
}

class CdpClient {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Map();
  }

  static connect(url) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      const client = new CdpClient(ws);

      ws.addEventListener("open", () => resolve(client), { once: true });
      ws.addEventListener("error", reject, { once: true });
      ws.addEventListener("message", (event) => client.handleMessage(event));
    });
  }

  send(method, params = {}, sessionId) {
    const id = ++this.id;
    const message = { id, method, params };
    if (sessionId) message.sessionId = sessionId;

    this.ws.send(JSON.stringify(message));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  once(method, callback, sessionId) {
    const key = this.listenerKey(method, sessionId);
    const list = this.listeners.get(key) || [];
    list.push({ callback, once: true });
    this.listeners.set(key, list);
  }

  handleMessage(event) {
    const message = JSON.parse(event.data);

    if (message.id) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) {
        pending.reject(new Error(message.error.message || "CDP command failed"));
      } else {
        pending.resolve(message.result || {});
      }
      return;
    }

    if (!message.method) return;
    const key = this.listenerKey(message.method, message.sessionId);
    const list = this.listeners.get(key);
    if (!list) return;

    for (const listener of list) {
      listener.callback(message.params || {});
    }
    this.listeners.set(key, list.filter((listener) => !listener.once));
  }

  listenerKey(method, sessionId) {
    return `${sessionId || ""}:${method}`;
  }

  close() {
    this.ws.close();
  }
}

await main();
