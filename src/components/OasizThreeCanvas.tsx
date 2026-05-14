import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
	BufferGeometry,
	Color,
	Float32BufferAttribute,
	LinearFilter,
	Mesh,
	OrthographicCamera,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	Texture,
	TextureLoader,
	Vector2,
	Vector3,
	WebGLRenderer,
} from "three";
import { getAssetPath } from "../lib/assetPath";

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
const lerp = (from: number, to: number, progress: number) => (1 - progress) * from + to * progress;

const sourceNoise = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec2 v) {
	const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
	vec2 i = floor(v + dot(v, C.yy));
	vec2 x0 = v - i + dot(i, C.xx);
	vec2 i1;
	i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
	vec4 x12 = x0.xyxy + C.xxzz;
	x12.xy -= i1;
	i = mod289(vec3(i, 0.0)).xy;
	vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
	vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
	m = m * m;
	m = m * m;
	vec3 x = 2.0 * fract(p * C.www) - 1.0;
	vec3 h = abs(x) - 0.5;
	vec3 ox = floor(x + 0.5);
	vec3 a0 = x - ox;
	m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
	vec3 g;
	g.x = a0.x * x0.x + h.x * x0.y;
	g.yz = a0.yz * x12.xz + h.yz * x12.yw;
	return 130.0 * dot(m, g);
}

float snoise(vec3 v) {
	const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
	const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
	vec3 i = floor(v + dot(v, C.yyy));
	vec3 x0 = v - i + dot(i, C.xxx);
	vec3 g = step(x0.yzx, x0.xyz);
	vec3 l = 1.0 - g;
	vec3 i1 = min(g.xyz, l.zxy);
	vec3 i2 = max(g.xyz, l.zxy);
	vec3 x1 = x0 - i1 + C.xxx;
	vec3 x2 = x0 - i2 + C.yyy;
	vec3 x3 = x0 - D.yyy;
	i = mod289(i);
	vec4 p = permute(permute(permute(
		i.z + vec4(0.0, i1.z, i2.z, 1.0))
		+ i.y + vec4(0.0, i1.y, i2.y, 1.0))
		+ i.x + vec4(0.0, i1.x, i2.x, 1.0));
	float n_ = 0.142857142857;
	vec3 ns = n_ * D.wyz - D.xzx;
	vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
	vec4 x_ = floor(j * ns.z);
	vec4 y_ = floor(j - 7.0 * x_);
	vec4 x = x_ * ns.x + ns.yyyy;
	vec4 y = y_ * ns.x + ns.yyyy;
	vec4 h = 1.0 - abs(x) - abs(y);
	vec4 b0 = vec4(x.xy, y.xy);
	vec4 b1 = vec4(x.zw, y.zw);
	vec4 s0 = floor(b0) * 2.0 + 1.0;
	vec4 s1 = floor(b1) * 2.0 + 1.0;
	vec4 sh = -step(h, vec4(0.0));
	vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
	vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
	vec3 p0 = vec3(a0.xy, h.x);
	vec3 p1 = vec3(a0.zw, h.y);
	vec3 p2 = vec3(a1.xy, h.z);
	vec3 p3 = vec3(a1.zw, h.w);
	vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
	p0 *= norm.x;
	p1 *= norm.y;
	p2 *= norm.z;
	p3 *= norm.w;
	vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
	m = m * m;
	return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

const lineVertexShader = `
precision highp float;

uniform float uTime;
uniform float uWidth;
uniform float uInitRate;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uStart;
uniform float scrollRate;
uniform float uEnd;
uniform float uDistort;

attribute vec3 aPrev;
attribute vec3 aNext;
attribute float aSide;
attribute float aProgress;

varying float vProgress;
varying float vSide;
varying float vShow;
varying vec2 vUv;
varying vec3 vPosition;

${sourceNoise}

mat3 rotateY(float angle) {
	float s = sin(angle);
	float c = cos(angle);
	return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
}

mat3 rotateX(float angle) {
	float s = sin(angle);
	float c = cos(angle);
	return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
}

vec3 convertPositions(vec3 pos) {
	vec3 holePos = vec3(-0.3, 0.2, 0.0) * uInitRate;
	float diff1 = abs(uEnd - 1.0) * 3.0;
	float diff2 = abs(uStart) * 2.0;
	float diff = diff1 + diff2;
	float len0 = length(pos);
	float noise = snoise(vec2(uTime * 0.2 + aProgress * (8.2 + (1.0 - uInitRate)), uTime * 0.2 + aProgress * (8.2 + (1.0 - uInitRate))));
	vec3 fromCenterNormal = normalize(pos);
	float oku = 1.5 * smoothstep(-1.2, 1.5, pos.x);
	pos.xyz += len0 * fromCenterNormal * (scrollRate + (1.0 - uInitRate) * 3.0 + 1.3 * (1.0 - uEnd) + 0.2 * uStart) * uDistort * oku * sin((diff * 0.1) * noise);
	return pos;
}

void main() {
	float show = 0.0;
	if (aProgress >= uStart && aProgress < uEnd && aProgress > 0.0) {
		show = 1.0;
	}

	vec3 pos = convertPositions(position);
	vec3 prev = aPrev;
	vec3 next = aNext;

	pos = rotateY(uMouse.x) * pos;
	pos = rotateX(uMouse.y) * pos;
	prev = rotateY(uMouse.x) * prev;
	prev = rotateX(uMouse.y) * prev;
	next = rotateY(uMouse.x) * next;
	next = rotateX(uMouse.y) * next;

	vec4 currMV = modelViewMatrix * vec4(pos, 1.0);
	vec4 prevMV = modelViewMatrix * vec4(prev, 1.0);
	vec4 nextMV = modelViewMatrix * vec4(next, 1.0);
	vec4 clipCurr = projectionMatrix * currMV;
	vec4 clipPrev = projectionMatrix * prevMV;
	vec4 clipNext = projectionMatrix * nextMV;
	vec2 ndcPrev = clipPrev.xy / clipPrev.w;
	vec2 ndcNext = clipNext.xy / clipNext.w;
	vec2 dir = normalize(ndcNext - ndcPrev);
	if (length(ndcNext - ndcPrev) < 0.0001) {
		dir = vec2(1.0, 0.0);
	}

	vec2 normal = vec2(-dir.y, dir.x);
	vec2 ndcPerPixel = 2.0 / uResolution;
	vec2 offset = normal * aSide * uWidth * show * ndcPerPixel;
	vec4 finalPos = clipCurr;
	finalPos.xy += offset * clipCurr.w;

	gl_Position = finalPos;
	vProgress = aProgress;
	vSide = aSide;
	vShow = show;
	vPosition = pos;
	vUv = vec2(aProgress, aSide);
}
`;

const lineFragmentShader = `
precision highp float;

uniform vec3 uColor;
uniform float uStart;
uniform float uTime;
uniform float uInitRate;

varying float vProgress;
varying float vSide;
varying float vShow;
varying vec3 vPosition;
varying vec2 vUv;

${sourceNoise}

vec3 hsl2rgb(vec3 hsl) {
	float h = hsl.x;
	float s = hsl.y;
	float l = hsl.z;
	float c = (1.0 - abs(2.0 * l - 1.0)) * s;
	float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
	float m = l - c * 0.5;
	vec3 rgb;
	if (h < 1.0 / 6.0) {
		rgb = vec3(c, x, 0.0);
	} else if (h < 2.0 / 6.0) {
		rgb = vec3(x, c, 0.0);
	} else if (h < 3.0 / 6.0) {
		rgb = vec3(0.0, c, x);
	} else if (h < 4.0 / 6.0) {
		rgb = vec3(0.0, x, c);
	} else if (h < 5.0 / 6.0) {
		rgb = vec3(x, 0.0, c);
	} else {
		rgb = vec3(c, 0.0, x);
	}
	return rgb + vec3(m);
}

float rand(vec2 co) {
	return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 genColorRgb(float random) {
	vec2 currentUv = vec2(vProgress, vSide);
	vec3 holePos = vec3(-0.3, 0.2, 0.0) * uInitRate;
	float dist = distance(vPosition, holePos);
	vec3 holePos2 = vec3(1.0, 0.0, 0.0);
	float dist2 = distance(vPosition, holePos2);
	float PI = 3.14159;
	float angleFromHole = atan(vPosition.x - holePos.x, vPosition.y - holePos.y);
	float noise = snoise(vec2(vProgress * 20.0, 3.0));
	float uTotalLength = 10.0;
	float border = 0.7;
	float posDist = distance(vPosition, holePos);
	float noiseTime = snoise(vec2(1.0, uTotalLength * -posDist + uTime * 0.3 + vProgress)) * smoothstep(border, border - 1.0, vPosition.x - vPosition.z);
	float noise3 = snoise(vec2(vProgress * 100.0, 10.0));
	float noise4 = rand(vec2(currentUv.x * 10.0, currentUv.y * 10.0 + uTime * 0.5));
	noise4 = (noise4 - 0.5);
	float holeShadow = smoothstep(1.0, 0.0, dist) * 0.3;
	float holeShadow2 = smoothstep(1.0, 0.0, dist2) * smoothstep(-PI, PI, abs(angleFromHole));
	float diffX = abs(vPosition.x - holePos2.x);
	float holeShadow3 = smoothstep(0.8, 0.0, diffX) * 0.2 * abs(max(0.0, -vPosition.y));
	float lightVal2 = (vPosition.y) * 0.2 * (noise3 * 0.5 + 0.5) - (vPosition.x) * 0.04 + 0.35 - max(0.0, holeShadow) - max(0.0, holeShadow2) - max(0.0, holeShadow3);
	float colorVal = mix(0.24 - vPosition.y * 0.12 + vPosition.x * 0.05, 0.58 - vPosition.y * (vPosition.y < 0.0 ? -0.1 : -0.2), (noiseTime * 0.5 + 0.5));
	vec3 yellow = vec3(0.17 + noise4 * 0.0, 1.0, 0.8);
	vec3 hsl = vec3(colorVal + noise4 * 0.0, 1.0 - colorVal * 0.2, clamp(lightVal2 + smoothstep(0.3, 0.7, colorVal) * 0.5, 0.09, 0.99));
	return hsl2rgb(mix(hsl, yellow, smoothstep(0.3, 0.1, colorVal)));
}

void main() {
	if (vShow < 0.01) {
		discard;
	}
	float alpha = 1.0;
	alpha *= step(uStart, vProgress);
	vec3 color = genColorRgb(snoise(vec3(vProgress, vPosition.x, vPosition.y)));
	gl_FragColor = vec4(color, alpha);
}
`;

const textFragmentShader = `
uniform sampler2D uTexture;
uniform float uProgress;
uniform bool uIsDark;
varying vec2 vUv;

vec4 sampleTextureRect(sampler2D currentTexture, vec2 uv, float left, float top, float width, float height) {
	vec2 normalizedUV = vec2((uv.x - left) / width, (uv.y - top) / height);
	return texture2D(currentTexture, normalizedUV);
}

void main() {
	vec2 uv = vUv;
	uv.y += 1.1 - uProgress * 1.1;
	float bottom = 0.0;
	float left = 0.0;
	float width = 1.0;
	float height = 1.0;
	if (uv.y < bottom || uv.y > (bottom + height) || uv.x < left || uv.x > (left + width)) {
		discard;
	}
	vec4 color = sampleTextureRect(uTexture, uv, left, bottom, width, height);
	vec3 col = uIsDark ? vec3(1.0) - color.rgb : color.rgb;
	gl_FragColor = vec4(col, color.a);
}
`;

const copyFragmentShader = `
uniform sampler2D uTexture;
uniform float uProgress;
uniform bool uIsDark;
varying vec2 vUv;

vec4 sampleTextureRect(sampler2D currentTexture, vec2 uv, float left, float top, float width, float height) {
	vec2 normalizedUV = vec2((uv.x - left) / width, (uv.y - top) / height);
	return texture2D(currentTexture, normalizedUV);
}

void main() {
	vec2 uv = vUv;
	float progByX = min(1.0, 2.0 * uProgress - uv.x);
	progByX = sin(progByX * 1.57079632679);
	uv.y += 1.1 - progByX * 1.1;
	float bottom = 0.0;
	float left = 0.0;
	float width = 1.0;
	float height = 1.0;
	if (uv.y < bottom || uv.y > (bottom + height) || uv.x < left || uv.x > (left + width)) {
		discard;
	}
	vec4 color = sampleTextureRect(uTexture, uv, left, bottom, width, height);
	vec3 col = uIsDark ? vec3(1.0) - color.rgb : color.rgb;
	gl_FragColor = vec4(col, color.a);
}
`;

const textVertexShader = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

interface LineParam {
	offsetInit: number;
	meshId: number;
}

interface Runtime {
	renderer: WebGLRenderer;
	scene: Scene;
	txtScene: Scene;
	camera: PerspectiveCamera;
	txtCamera: OrthographicCamera;
	meshes: Mesh<BufferGeometry, ShaderMaterial>[];
	trailMaterials: ShaderMaterial[];
	linesParam: LineParam[];
	textures: Texture[];
	frameId: number;
	intervalId: number | null;
	mouse: Vector2;
	mouseLerp: Vector2;
	initRate: { value: number };
	clockStart: number;
	onResize: () => void;
	onMouseMove: (event: MouseEvent) => void;
}

function trimSourcePath(points: Vector3[]) {
	for (let index = points.length - 1; index >= 0; index--) {
		if (points[index].y > -1) {
			return points.slice(0, index + 1);
		}
	}
	return points;
}

function createSourcePath(a = 10, b = 28, c = 8 / 3, retry = 0): Vector3[] {
	const points: Vector3[] = [];
	const randomSeed = () => (Math.random() - 0.5) * 40;
	let x = randomSeed() - 3;
	let y = randomSeed() + 5;
	let z = randomSeed() + 35;
	const step = 0.005;
	const total = 3000;

	for (let index = 0; index < total; index++) {
		const k1x = a * (y - x);
		const k1y = x * (b - z) - y;
		const k1z = x * y - c * z;
		const mx = x + (k1x * step) / 2;
		const my = y + (k1y * step) / 2;
		const mz = z + (k1z * step) / 2;
		const k2x = a * (my - mx);
		const k2y = mx * (b - mz) - my;
		const k2z = mx * my - c * mz;
		const nx = x + (k2x * step) / 2;
		const ny = y + (k2y * step) / 2;
		const nz = z + (k2z * step) / 2;
		const k3x = a * (ny - nx);
		const k3y = nx * (b - nz) - ny;
		const k3z = nx * ny - c * nz;
		const ox = x + k3x * step;
		const oy = y + k3y * step;
		const oz = z + k3z * step;
		const k4x = a * (oy - ox);
		const k4y = ox * (b - oz) - oy;
		const k4z = ox * oy - c * oz;
		x += ((k1x + 2 * k2x + 2 * k3x + k4x) * step) / 6;
		y += ((k1y + 2 * k2y + 2 * k3y + k4y) * step) / 6;
		z += ((k1z + 2 * k2z + 2 * k3z + k4z) * step) / 6;

		const scale = 0.067;
		const point = new Vector3(y * scale - 0.5, x * -scale + -0.1, -z * scale + 1.9);
		point.applyAxisAngle(new Vector3(1, 0, 0), Math.PI / 2);
		point.applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 1.16);
		points.push(point);
	}

	const intersectsHole = points.filter((point) => {
		const length = point.length();
		const hole = new Vector3(-0.34, -0.05, 0.5);
		const distance = point.distanceTo(hole);
		return (length > 1.6 && point.x < 0) || distance < 0.2;
	}).length > 0;

	if (intersectsHole && retry < 12) {
		return createSourcePath(a, b, c, retry + 1);
	}

	return trimSourcePath(points).filter((_, index) => index > 50);
}

function createMeshLineGeometry(points: Vector3[]) {
	const positions: number[] = [];
	const prev: number[] = [];
	const next: number[] = [];
	const sides: number[] = [];
	const progresses: number[] = [];
	const indices: number[] = [];
	const total = points.length;

	for (let index = 0; index < total; index++) {
		const point = points[index];
		const prevPoint = index > 0 ? points[index - 1] : point;
		const nextPoint = index < total - 1 ? points[index + 1] : point;
		const progress = index / (total - 1);

		for (let side = 0; side < 2; side++) {
			positions.push(point.x, point.y, point.z);
			prev.push(prevPoint.x, prevPoint.y, prevPoint.z);
			next.push(nextPoint.x, nextPoint.y, nextPoint.z);
			sides.push(side === 0 ? 1 : -1);
			progresses.push(progress);
		}

		if (index < total - 1) {
			const base = index * 2;
			indices.push(base, base + 1, base + 2);
			indices.push(base + 2, base + 1, base + 3);
		}
	}

	const geometry = new BufferGeometry();
	geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
	geometry.setAttribute("aPrev", new Float32BufferAttribute(prev, 3));
	geometry.setAttribute("aNext", new Float32BufferAttribute(next, 3));
	geometry.setAttribute("aSide", new Float32BufferAttribute(sides, 1));
	geometry.setAttribute("aProgress", new Float32BufferAttribute(progresses, 1));
	geometry.setIndex(indices);
	return geometry;
}

function getCanvasSize(wrapper: HTMLDivElement) {
	const rect = wrapper.getBoundingClientRect();
	const width = rect.width || window.innerWidth;
	const height = rect.height || window.innerHeight;
	return { width, height, aspect: width / height };
}

function getFvLogoSize(isMobile: boolean) {
	const width = isMobile ? 1.88 : 1.2;
	return { width, height: width * 0.247374 };
}

function getFvCopySize(isMobile: boolean) {
	const width = isMobile ? 0.67 : 0.3;
	return { width, height: width * 0.15 };
}

function getFvLogoInitPos(aspect: number, isMobile: boolean) {
	const { width, height } = getFvLogoSize(isMobile);
	return new Vector3(-1 + width / 2, 1 / aspect - height / 2 + height * (isMobile ? 0 : 0.01), 0);
}

function getFvCopyInitPos(aspect: number, isMobile: boolean) {
	const { width, height } = getFvCopySize(isMobile);
	return new Vector3(-1 + width / 2 + (isMobile ? 1.2 : 1.26), 1 / aspect - height / 2 - (isMobile ? 0.55 : 0.16), 0);
}

function disposeMesh(mesh: Mesh<BufferGeometry, ShaderMaterial>) {
	mesh.geometry.dispose();
	mesh.material.dispose();
}

export interface OasizThreeCanvasProps {
	className?: string;
	/** FV ロゴ・コピー画像のオーバーレイ。false のときはライン描画のみ（テクスチャは読み込まない） */
	showImages?: boolean;
}

interface OverlayHandles {
	textures: Texture[];
	logoMesh: Mesh<BufferGeometry, ShaderMaterial>;
	copyMesh: Mesh<BufferGeometry, ShaderMaterial>;
	logoMaterial: ShaderMaterial;
	copyMaterial: ShaderMaterial;
}

export function OasizThreeCanvas({ className, showImages = false }: OasizThreeCanvasProps) {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const wrapper = wrapperRef.current;
		const canvas = canvasRef.current;

		if (!wrapper || !canvas) {
			return undefined;
		}

		const { width, height, aspect } = getCanvasSize(wrapper);
		// MSAA オフで GPU 負荷を抑える（ラインはややギザつきやすい）
		const renderer = new WebGLRenderer({ antialias: false, alpha: false, canvas });
		renderer.autoClear = false;
		renderer.setClearColor(0xf4f4f4);
		renderer.setSize(width, height);
		// 実ピクセル比の上限を抑えてフラグメント負荷を削減（Retina でも超シャープにはしない）
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));

		const scene = new Scene();
		const txtScene = new Scene();
		const camera = new PerspectiveCamera(75, aspect, 0.1, 100);
		camera.rotateX(-Math.PI / 10);
		camera.position.set(-1.8, 0, 1.8);
		camera.up.set(3.2, 0.2, 0);

		const txtCamera = new OrthographicCamera(-1, 1, 1 / aspect, -1 / aspect, 0.1, 1000);
		txtCamera.position.z = 5;

		const isMobile = width <= 768;
		// 同時表示ライン数（モバイル／PC で別定数のまま調整可能）
		const maxConcurrentLinesMobile = 50;
		const maxConcurrentLinesDesktop = 50;
		const maxConcurrentLines = isMobile ? maxConcurrentLinesMobile : maxConcurrentLinesDesktop;

		// リサイズ時のみ更新するレイアウト（スクロールは window.scrollY を直接使用／オリジナルサイト準拠）
		const layoutCache = {
			width,
			height,
			aspect,
		};

		// ⑤ lookAt 先・カメラ補間用 Vector3 を使い回す
		const lookAtTarget = new Vector3();
		const baseCameraPos = new Vector3(-1.8, 0, 1.8);
		const cameraZe = new Vector3();
		const cameraZoomLerpTarget = new Vector3();

		let overlay: OverlayHandles | null = null;
		if (showImages) {
			const loader = new TextureLoader();
			const textures = [
				loader.load(getAssetPath("/images/oasiz/fv_logo.png")),
				loader.load(getAssetPath("/images/oasiz/fv_copy.png")),
			];
			textures.forEach((texture) => {
				texture.minFilter = LinearFilter;
			});

			const logoSize = getFvLogoSize(isMobile);
			const logoMaterial = new ShaderMaterial({
				uniforms: {
					uTexture: { value: textures[0] },
					uProgress: { value: 0 },
					uIsDark: { value: false },
				},
				vertexShader: textVertexShader,
				fragmentShader: textFragmentShader,
				transparent: true,
			});
			const logoMesh = new Mesh(new PlaneGeometry(logoSize.width, logoSize.height), logoMaterial);
			txtScene.add(logoMesh);

			const copySize = getFvCopySize(isMobile);
			const copyMaterial = new ShaderMaterial({
				uniforms: {
					uTexture: { value: textures[1] },
					uProgress: { value: 0 },
					uIsDark: { value: false },
				},
				vertexShader: textVertexShader,
				fragmentShader: copyFragmentShader,
				transparent: true,
			});
			const copyMesh = new Mesh(new PlaneGeometry(copySize.width, copySize.height), copyMaterial);
			txtScene.add(copyMesh);

			overlay = { textures, logoMesh, copyMesh, logoMaterial, copyMaterial };
		}

		const runtime: Runtime = {
			renderer,
			scene,
			txtScene,
			camera,
			txtCamera,
			meshes: [],
			trailMaterials: [],
			linesParam: [],
			textures: overlay?.textures ?? [],
			frameId: 0,
			intervalId: null,
			mouse: new Vector2(0, 0),
			mouseLerp: new Vector2(0, 0),
			initRate: { value: 0 },
			clockStart: performance.now(),
			onResize: () => undefined,
			onMouseMove: () => undefined,
		};

		const createMeshLine = (lineIndex: number) => {
			const geometry = createMeshLineGeometry(createSourcePath(7, 28, 2.6666666666666665, lineIndex));
			const material = new ShaderMaterial({
				uniforms: {
					uTime: { value: 0 },
					uWidth: { value: 0.3 + Math.random() * 0.6 },
					uResolution: { value: new Vector2(width, height) },
					uColor: { value: new Color(0x00ffff) },
					uStart: { value: 0 },
					scrollRate: { value: 0 },
					uEnd: { value: 1 },
					uInitRate: { value: 0 },
					uDistort: { value: lineIndex === 0 ? 1 : 0.1 },
					uMouse: { value: new Vector2(0, 0) },
				},
				vertexShader: lineVertexShader,
				fragmentShader: lineFragmentShader,
				transparent: true,
				depthWrite: true,
				depthTest: true,
			});
			const mesh = new Mesh(geometry, material);
			runtime.linesParam.push({ offsetInit: 2, meshId: mesh.id });
			runtime.trailMaterials.push(material);
			runtime.meshes.push(mesh);
			scene.add(mesh);
			gsap.to(runtime.linesParam[runtime.linesParam.length - 1], {
				offsetInit: 1,
				duration: lineIndex === 0 ? 20 : 5,
				ease: lineIndex === 0 ? "linear" : "power1.inOut",
			});
		};

		const removeLine = () => {
			const index = runtime.linesParam.findIndex((line) => line.offsetInit >= 1);
			if (index < 0) {
				return;
			}
			const mesh = runtime.meshes[index];
			gsap.to(runtime.linesParam[index], {
				offsetInit: 0,
				duration: 15,
				ease: "linear",
				onComplete: () => {
					const meshIndex = runtime.meshes.findIndex((item) => item.id === mesh.id);
					if (meshIndex < 0) {
						return;
					}
					scene.remove(mesh);
					disposeMesh(mesh);
					runtime.linesParam.splice(meshIndex, 1);
					runtime.trailMaterials.splice(meshIndex, 1);
					runtime.meshes.splice(meshIndex, 1);
				},
			});
		};

		for (let index = 0; index < maxConcurrentLines; index++) {
			createMeshLine(index);
		}

		gsap.to(runtime.initRate, { value: 1, duration: 5, ease: "power1.out" });
		if (overlay) {
			gsap.to(overlay.logoMaterial.uniforms.uProgress, { value: 1, duration: 2, ease: "power4.inOut" });
			gsap.to(overlay.copyMaterial.uniforms.uProgress, { value: 1, duration: 2.5, delay: 1, ease: "power4.out" });
		}

		runtime.intervalId = window.setInterval(() => {
			createMeshLine(runtime.meshes.length);
			if (runtime.linesParam.length > maxConcurrentLines) {
				removeLine();
			}
		}, 500);

		runtime.onMouseMove = (event: MouseEvent) => {
			runtime.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			runtime.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		};

		runtime.onResize = () => {
			const size = getCanvasSize(wrapper);
			layoutCache.width = size.width;
			layoutCache.height = size.height;
			layoutCache.aspect = size.aspect;
			renderer.setSize(size.width, size.height);
			camera.aspect = size.aspect;
			camera.updateProjectionMatrix();
			txtCamera.top = 1 / size.aspect;
			txtCamera.bottom = -1 / size.aspect;
			txtCamera.updateProjectionMatrix();
			runtime.trailMaterials.forEach((material) => {
				material.uniforms.uResolution.value.set(size.width, size.height);
			});
		};

		const render = (time: number) => {
			runtime.frameId = window.requestAnimationFrame(render);
			const elapsed = (time - runtime.clockStart) / 1000;
			const viewportH = window.innerHeight;
			const viewportW = window.innerWidth;
			const scrollPx = Math.min(window.scrollY, viewportH * 2);
			/* oasiz.org 本番（main.js Lb.render）: Re = scroll / (2*vh)。スクロールでカメラがターゲットへ寄り細線が画面サイズへ «ズームイン» */
			const scrollRe = scrollPx / Math.max(viewportH * 2, 1);

			if (overlay) {
				const logoPos = getFvLogoInitPos(layoutCache.aspect, layoutCache.width <= 768);
				const copyPos = getFvCopyInitPos(layoutCache.aspect, layoutCache.width <= 768);
				const copyYOffset = scrollPx * (2 / Math.max(viewportW, 1));
				overlay.logoMesh.position.set(logoPos.x, logoPos.y, logoPos.z);
				overlay.copyMesh.position.set(copyPos.x, copyPos.y + copyYOffset, copyPos.z);
			}

			runtime.mouseLerp.x = lerp(runtime.mouseLerp.x, runtime.mouse.x, 0.05);
			runtime.mouseLerp.y = lerp(runtime.mouseLerp.y, runtime.mouse.y, 0.05);
			const distance = Math.sqrt(runtime.mouseLerp.x * runtime.mouseLerp.x + runtime.mouseLerp.y * runtime.mouseLerp.y);
			cameraZe.set(
				0.2 + Math.sin(time * 0.0005) * 0.1 + runtime.mouseLerp.y * 0.1,
				Math.cos(time * 0.001) * 0.15 + runtime.mouseLerp.x * 0.1,
				Math.cos(time * 0.0003) * 0.1 + 0.1 + distance * 0.1,
			);
			camera.position.set(
				baseCameraPos.x + cameraZe.x,
				baseCameraPos.y + cameraZe.y,
				baseCameraPos.z + cameraZe.z,
			);
			cameraZoomLerpTarget.set(baseCameraPos.x + 0.5 + cameraZe.x, cameraZe.y, 1 + cameraZe.z);
			camera.position.lerpVectors(camera.position, cameraZoomLerpTarget, scrollRe);
			const radialFactor = layoutCache.width <= 768 ? 1.3 : 1;
			const distanceFromOrigin = camera.position.length();
			camera.position.normalize().multiplyScalar(distanceFromOrigin * radialFactor);
			lookAtTarget.set(layoutCache.width <= 768 ? 0.4 : 0, 0, 0);
			camera.lookAt(lookAtTarget);
			camera.updateMatrix();

			runtime.trailMaterials.forEach((material, index) => {
				const line = runtime.linesParam[index];
				const offsetInit = line?.offsetInit ?? 2;
				const widthByScroll = runtime.initRate.value * -scrollRe * offsetInit + offsetInit;
				material.uniforms.uTime.value = elapsed;
				material.uniforms.uStart.value = Math.max(0, 1 - widthByScroll);
				material.uniforms.uEnd.value = clamp01(2 - widthByScroll);
				material.uniforms.scrollRate.value = scrollRe;
				material.uniforms.uInitRate.value = runtime.initRate.value;
				material.uniforms.uMouse.value.set(runtime.mouseLerp.x * 0.5, runtime.mouseLerp.y * 0.5);
			});

			renderer.clear();
			if (overlay) {
				renderer.render(txtScene, txtCamera);
			}
			renderer.clearDepth();
			renderer.render(scene, camera);
		};

		const scheduleRender = () => {
			runtime.frameId = window.requestAnimationFrame(render);
		};

		// ④ タブ非表示・バックグラウンドでは rAF を停止（Intersection Observer は使わない）
		const onVisibilityChange = () => {
			if (document.hidden) {
				window.cancelAnimationFrame(runtime.frameId);
				runtime.frameId = 0;
			} else {
				scheduleRender();
			}
		};

		window.addEventListener("mousemove", runtime.onMouseMove);
		window.addEventListener("resize", runtime.onResize);
		document.addEventListener("visibilitychange", onVisibilityChange);
		if (!document.hidden) {
			scheduleRender();
		}

		return () => {
			window.removeEventListener("mousemove", runtime.onMouseMove);
			window.removeEventListener("resize", runtime.onResize);
			document.removeEventListener("visibilitychange", onVisibilityChange);
			window.cancelAnimationFrame(runtime.frameId);
			if (runtime.intervalId !== null) {
				window.clearInterval(runtime.intervalId);
			}
			gsap.killTweensOf(runtime.initRate);
			if (overlay) {
				gsap.killTweensOf(overlay.logoMaterial.uniforms.uProgress);
				gsap.killTweensOf(overlay.copyMaterial.uniforms.uProgress);
				overlay.logoMesh.geometry.dispose();
				overlay.copyMesh.geometry.dispose();
				overlay.logoMaterial.dispose();
				overlay.copyMaterial.dispose();
			}
			runtime.linesParam.forEach((line) => gsap.killTweensOf(line));
			runtime.meshes.forEach((mesh) => {
				scene.remove(mesh);
				disposeMesh(mesh);
			});
			runtime.textures.forEach((texture) => texture.dispose());
			renderer.dispose();
		};
	}, [showImages]);

	return (
                <div ref={wrapperRef} className={`${className}   `}>
                        <canvas ref={canvasRef} className="w-full h-[100lvh] fixed top-0 " data-engine="three.js r180"/>
                </div>
	);
}
