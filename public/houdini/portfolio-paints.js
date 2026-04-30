const toNumber = (properties, name, fallback) => {
	const value = parseFloat(properties.get(name).toString());
	return Number.isFinite(value) ? value : fallback;
};

const toText = (properties, name, fallback) => {
	const value = properties.get(name).toString().trim();
	return value || fallback;
};

const toList = (properties, name, fallback) => {
	const value = toText(properties, name, fallback.join(","));
	return value.split(",").map((item) => item.trim()).filter(Boolean);
};

const rand = (seed) => {
	let value = seed;
	return () => {
		value |= 0;
		value = (value + 0x6d2b79f5) | 0;
		let next = Math.imul(value ^ (value >>> 15), 1 | value);
		next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
		return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
	};
};

const lerp = (start, end, amount) => start + (end - start) * amount;

class SnowField {
	static get inputProperties() {
		return ["--paint-density", "--paint-min", "--paint-max", "--paint-seed"];
	}

	paint(ctx, size, properties) {
		const density = toNumber(properties, "--paint-density", 220);
		const min = toNumber(properties, "--paint-min", 1.5);
		const max = toNumber(properties, "--paint-max", 6);
		const random = rand(toNumber(properties, "--paint-seed", density));

		for (let i = 0; i < density; i += 1) {
			const radius = lerp(min, max, random());
			ctx.beginPath();
			ctx.fillStyle = `rgba(255,255,255,${lerp(0.28, 0.92, random())})`;
			ctx.arc(random() * size.width, random() * size.height, radius, 0, Math.PI * 2);
			ctx.fill();
		}
	}
}

class ConfettiField {
	static get inputProperties() {
		return ["--paint-density", "--paint-colors", "--paint-seed"];
	}

	paint(ctx, size, properties) {
		const density = toNumber(properties, "--paint-density", 90);
		const colors = toList(properties, "--paint-colors", ["#f25f4c", "#ff8906", "#e53170", "#3da9fc"]);
		const random = rand(toNumber(properties, "--paint-seed", density));

		for (let i = 0; i < density; i += 1) {
			const x = random() * size.width;
			const y = random() * size.height;
			const length = lerp(8, 28, random());
			const angle = random() * Math.PI;
			ctx.beginPath();
			ctx.lineWidth = lerp(2, 6, random());
			ctx.strokeStyle = colors[Math.floor(random() * colors.length)];
			ctx.moveTo(x, y);
			ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
			ctx.stroke();
		}
	}
}

class StarDust {
	static get inputProperties() {
		return ["--paint-density", "--paint-color", "--paint-seed"];
	}

	paint(ctx, size, properties) {
		const density = toNumber(properties, "--paint-density", 120);
		const color = toText(properties, "--paint-color", "#ffffff");
		const random = rand(toNumber(properties, "--paint-seed", density));

		for (let i = 0; i < density; i += 1) {
			const x = random() * size.width;
			const y = random() * size.height;
			const ray = lerp(2, 9, random());
			ctx.strokeStyle = color;
			ctx.globalAlpha = lerp(0.16, 0.82, random());
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(x - ray, y);
			ctx.lineTo(x + ray, y);
			ctx.moveTo(x, y - ray);
			ctx.lineTo(x, y + ray);
			ctx.stroke();
		}
		ctx.globalAlpha = 1;
	}
}

class BubbleCluster {
	static get inputProperties() {
		return ["--paint-density", "--paint-colors", "--paint-min", "--paint-max", "--paint-seed"];
	}

	paint(ctx, size, properties) {
		const density = toNumber(properties, "--paint-density", 34);
		const colors = toList(properties, "--paint-colors", ["#3da9fc", "#90b4ce", "#fffffe"]);
		const min = toNumber(properties, "--paint-min", 16);
		const max = toNumber(properties, "--paint-max", 84);
		const random = rand(toNumber(properties, "--paint-seed", density));

		for (let i = 0; i < density; i += 1) {
			const radius = lerp(min, max, random());
			const x = random() * size.width;
			const y = random() * size.height;
			const gradient = ctx.createRadialGradient(x - radius * 0.28, y - radius * 0.28, 0, x, y, radius);
			gradient.addColorStop(0, "rgba(255,255,255,0.88)");
			gradient.addColorStop(0.35, "rgba(255,255,255,0.12)");
			gradient.addColorStop(1, colors[Math.floor(random() * colors.length)]);
			ctx.beginPath();
			ctx.fillStyle = gradient;
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fill();
		}
	}
}

class IsometricGrid {
	static get inputProperties() {
		return ["--paint-color", "--paint-accent", "--paint-gap"];
	}

	paint(ctx, size, properties) {
		const color = toText(properties, "--paint-color", "rgba(255,255,255,0.24)");
		const accent = toText(properties, "--paint-accent", "rgba(255,255,255,0.7)");
		const gap = toNumber(properties, "--paint-gap", 34);
		const diagonal = size.width + size.height;

		ctx.lineWidth = 1;
		for (let x = -diagonal; x < diagonal; x += gap) {
			ctx.strokeStyle = color;
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x + diagonal, diagonal);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(x + diagonal, 0);
			ctx.lineTo(x, diagonal);
			ctx.stroke();
		}

		ctx.strokeStyle = accent;
		ctx.lineWidth = 2;
		ctx.strokeRect(gap, gap, size.width - gap * 2, size.height - gap * 2);
	}
}

class PolkaDotFade {
	static get inputProperties() {
		return ["--dot-spacing", "--dot-fade-offset", "--dot-color"];
	}

	paint(ctx, size, properties) {
		const spacing = toNumber(properties, "--dot-spacing", 20);
		const fadeOffset = toNumber(properties, "--dot-fade-offset", 0);
		const color = toText(properties, "--dot-color", "#fc466b");

		ctx.fillStyle = color;
		for (let y = 0; y < size.height + spacing; y += spacing) {
			for (let x = 0; x < size.width + spacing; x += spacing * 2) {
				const staggerX = x + ((y / spacing) % 2 === 1 ? spacing : 0);
				const fadeRelativeX = staggerX - (size.width * fadeOffset) / 100;
				const radius = spacing * Math.max(Math.min(1 - fadeRelativeX / size.width, 1), 0);

				ctx.beginPath();
				ctx.arc(staggerX, y, radius, 0, Math.PI * 2);
				ctx.fill();
			}
		}
	}
}

class CircuitTrace {
	static get inputProperties() {
		return ["--paint-color", "--paint-accent", "--paint-gap"];
	}

	paint(ctx, size, properties) {
		const color = toText(properties, "--paint-color", "rgba(255,255,255,0.42)");
		const accent = toText(properties, "--paint-accent", "#ff8906");
		const gap = toNumber(properties, "--paint-gap", 42);

		ctx.lineWidth = 2;
		ctx.strokeStyle = color;
		ctx.fillStyle = accent;

		for (let y = gap; y < size.height; y += gap) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			for (let x = gap; x < size.width; x += gap) {
				ctx.lineTo(x, y);
				if ((x / gap + y / gap) % 3 === 0) {
					ctx.lineTo(x, y + gap * 0.45);
				}
			}
			ctx.stroke();
		}

		for (let x = gap; x < size.width; x += gap * 2) {
			for (let y = gap; y < size.height; y += gap * 2) {
				ctx.beginPath();
				ctx.arc(x, y, 4, 0, Math.PI * 2);
				ctx.fill();
			}
		}
	}
}

class OrbitalRings {
	static get inputProperties() {
		return ["--paint-color", "--paint-accent", "--paint-density"];
	}

	paint(ctx, size, properties) {
		const color = toText(properties, "--paint-color", "rgba(255,255,255,0.28)");
		const accent = toText(properties, "--paint-accent", "#e53170");
		const density = toNumber(properties, "--paint-density", 10);
		const cx = size.width / 2;
		const cy = size.height / 2;
		const max = Math.hypot(cx, cy);

		for (let i = 1; i <= density; i += 1) {
			ctx.beginPath();
			ctx.strokeStyle = i % 3 === 0 ? accent : color;
			ctx.lineWidth = i % 3 === 0 ? 2 : 1;
			ctx.ellipse(cx, cy, (max / density) * i, (max / density) * i * 0.48, Math.PI * (i / density), 0, Math.PI * 2);
			ctx.stroke();
		}
	}
}

class PolygonMesh {
	static get inputProperties() {
		return ["--paint-colors", "--paint-density", "--paint-seed"];
	}

	paint(ctx, size, properties) {
		const colors = toList(properties, "--paint-colors", ["#f25f4c", "#e53170", "#3da9fc"]);
		const density = toNumber(properties, "--paint-density", 22);
		const random = rand(toNumber(properties, "--paint-seed", density));

		for (let i = 0; i < density; i += 1) {
			const x = random() * size.width;
			const y = random() * size.height;
			const radius = lerp(24, 92, random());
			const sides = Math.floor(lerp(3, 7, random()));
			ctx.beginPath();
			for (let point = 0; point <= sides; point += 1) {
				const angle = (Math.PI * 2 * point) / sides;
				const px = x + Math.cos(angle) * radius;
				const py = y + Math.sin(angle) * radius;
				if (point === 0) ctx.moveTo(px, py);
				else ctx.lineTo(px, py);
			}
			ctx.closePath();
			ctx.fillStyle = colors[Math.floor(random() * colors.length)];
			ctx.globalAlpha = lerp(0.12, 0.36, random());
			ctx.fill();
			ctx.globalAlpha = 0.8;
			ctx.strokeStyle = "rgba(255,255,255,0.34)";
			ctx.stroke();
		}
		ctx.globalAlpha = 1;
	}
}

registerPaint("portfolio-snow", SnowField);
registerPaint("portfolio-confetti", ConfettiField);
registerPaint("portfolio-stars", StarDust);
registerPaint("portfolio-bubbles", BubbleCluster);
registerPaint("portfolio-isometric", IsometricGrid);
registerPaint("portfolio-polka-dot-fade", PolkaDotFade);
registerPaint("portfolio-circuit", CircuitTrace);
registerPaint("portfolio-rings", OrbitalRings);
registerPaint("portfolio-polygons", PolygonMesh);
