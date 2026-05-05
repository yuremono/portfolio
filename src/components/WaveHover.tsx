/* eslint-disable react-refresh/only-export-components -- コンポーネントと `useWaveHover` を同ファイルで提供 */
import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { gsap } from "gsap";
import {
	Mesh,
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

export interface WaveHoverProps {
	children: ReactNode;
	className?: string;
}

export interface UseWaveHoverOptions {
	strength?: number;
}

/** 各リンクと、その中のプレビュー用画像・読み込んだテクスチャをひとまとめにした項目 */
interface WaveItem {
	element: HTMLAnchorElement;
	img: HTMLImageElement | null;
	index: number;
	texture?: Texture | null;
}

/** `.WaveHover` 内 `a[href]` → キャンバスはラッパー直下の末尾へ追加（SCSS `>.WaveHoverCanvas`） */
class WaveHoverEffect {
	private readonly container: HTMLElement;
	private readonly strength: number;
	private renderer: WebGLRenderer;
	private scene: Scene;
	private camera: PerspectiveCamera;
	private mouse = new Vector2();
	private position = new Vector3(0, 0, 0);
	private geometry = new PlaneGeometry(1, 1, 32, 32);
	/** シェーダへ渡す状態（画像・波形オフセット・フェード） */
	private uniforms = {
		uTexture: { value: null as Texture | null },
		uOffset: { value: new Vector2(0, 0) },
		uAlpha: { value: 0 },
	};
	private material: ShaderMaterial;
	private plane: Mesh<PlaneGeometry, ShaderMaterial>;
	private items: WaveItem[] = [];
	private currentItem: WaveItem | null = null;
	private isLoaded = false;
	private isMouseOver = false;
	private tempItemIndex: number | null = null;
	private cleanupHandlers: (() => void)[] = [];

	constructor(container: HTMLElement, strength = 0.25) {
		this.container = container;
		/** マウス追従時の「歪みの強さ」（プレーン目標位置との差に掛ける係数） */
		this.strength = strength;
		this.scene = new Scene();
		this.camera = new PerspectiveCamera(40, this.viewport.aspectRatio, 0.1, 100);
		this.camera.position.set(0, 0, 3);
		this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.viewport.width, this.viewport.height);
		this.renderer.domElement.className = "WaveHoverCanvas";
		this.container.appendChild(this.renderer.domElement);

		// 頂点シェーダで sin ベースの波形、フラグメントでテクスチャ × uAlpha
		this.material = new ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: `
				uniform vec2 uOffset;
				varying vec2 vUv;

				vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
					float M_PI = 3.1415926535897932384626433832795;
					position.x = position.x + (sin(uv.y * M_PI) * offset.x);
					position.y = position.y + (sin(uv.x * M_PI) * offset.y);
					return position;
				}

				void main() {
					vUv = uv;
					vec3 newPosition = deformationCurve(position, uv, uOffset);
					gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
				}
			`,
			fragmentShader: `
				uniform sampler2D uTexture;
				uniform float uAlpha;
				varying vec2 vUv;

				void main() {
					vec4 color = texture2D(uTexture, vUv);
					gl_FragColor = vec4(color.rgb, color.a * uAlpha);
				}
			`,
			transparent: true,
		});
		this.plane = new Mesh(this.geometry, this.material);
		this.scene.add(this.plane);
		this.renderer.setAnimationLoop(this.render);
		this.createEventsListeners();
		void this.initTextures();
	}

	/** ホバー対象: コンテナ内の `a[href]`（WebGL キャンバス DOM は除外） */
	private getLinkElements(): HTMLAnchorElement[] {
		return [...this.container.querySelectorAll<HTMLAnchorElement>("a[href]")].filter(
			(a) => !this.renderer.domElement.contains(a),
		);
	}

	/** カメラ・アスペクト・レンダラー解像度に使うコンテナサイズ（CSS とキャンバス実寸は基本的に一致させる） */
	private get viewport() {
		const width = this.container.clientWidth || window.innerWidth;
		const height = this.container.clientHeight || window.innerHeight;
		return { width, height, aspectRatio: width / height };
	}

	/** カメラ前方（z=0 付近）におけるワールド空間の見える幅・高さ（マウス NDC をここへマップする） */
	private get viewSize() {
		const distance = this.camera.position.z;
		const vFov = (this.camera.fov * Math.PI) / 180;
		const height = 2 * Math.tan(vFov / 2) * distance;
		return { width: height * this.viewport.aspectRatio, height };
	}

	private render = () => {
		this.renderer.render(this.scene, this.camera);
	};

	private mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
		return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
	}

	/** 各リンク内の img を TextureLoader で読み込み、ホバー時に差し替え可能にする */
	private async initTextures() {
		this.items = this.getLinkElements().map((element, index) => ({
			element,
			img: element.querySelector("img"),
			index,
		}));
		const loader = new TextureLoader();
		loader.setCrossOrigin("anonymous");
		const loaded = await Promise.all(
			this.items.map(
				(item) =>
					new Promise<Texture | null>((resolve) => {
						if (!item.img?.src) {
							resolve(null);
							return;
						}
						loader.load(
							item.img.src,
							(texture) => resolve(texture),
							undefined,
							() => resolve(null),
						);
					}),
			),
		);
		loaded.forEach((texture, index) => {
			this.items[index].texture = texture;
		});
		this.isLoaded = true;
		if (this.isMouseOver && this.tempItemIndex !== null) {
			this.onMouseOver(this.tempItemIndex);
		}
		this.tempItemIndex = null;
	}

	private createEventsListeners() {
		const onResize = () => this.onWindowResize();
		window.addEventListener("resize", onResize, false);
		this.cleanupHandlers.push(() => window.removeEventListener("resize", onResize, false));

		const onMouseMove = (event: MouseEvent) => {
			// キャンバスはラッパー内 absolute でコンテナと同じ矩形になる想定。rect で NDC に変換する。
			const rect = this.renderer.domElement.getBoundingClientRect();
			const w = rect.width || 1;
			const h = rect.height || 1;
			const mx = event.clientX - rect.left;
			const my = event.clientY - rect.top;
			this.mouse.x = (mx / w) * 2 - 1;
			this.mouse.y = -(my / h) * 2 + 1;
			this.syncPlaneToMouse();
		};
		this.container.addEventListener("mousemove", onMouseMove, false);
		this.cleanupHandlers.push(() => this.container.removeEventListener("mousemove", onMouseMove, false));

		const onMouseLeave = () => {
			this.isMouseOver = false;
			gsap.to(this.uniforms.uAlpha, { value: 0, duration: 0.5, ease: "power4.out" });
		};
		this.container.addEventListener("mouseleave", onMouseLeave, false);
		this.cleanupHandlers.push(() => this.container.removeEventListener("mouseleave", onMouseLeave, false));

		this.getLinkElements().forEach((item, index) => {
			const onMouseOver = () => {
				this.tempItemIndex = index;
				this.onMouseOver(index);
			};
			item.addEventListener("mouseover", onMouseOver, false);
			this.cleanupHandlers.push(() => item.removeEventListener("mouseover", onMouseOver, false));
		});
	}

	/**
	 * NDC のマウス位置をワールド座標へ写し、プレーンの中心（PlaneGeometry は原点中心）をカーソル位置に合わせて GSAP で追従させる。
	 */
	private syncPlaneToMouse() {
		const x = this.mapRange(this.mouse.x, -1, 1, -this.viewSize.width / 2, this.viewSize.width / 2);
		const y = this.mapRange(this.mouse.y, -1, 1, -this.viewSize.height / 2, this.viewSize.height / 2);
		this.position = new Vector3(x, y, 0);
		gsap.to(this.plane.position, {
			x,
			y,
			duration: 1,
			ease: "power4.out",
			onUpdate: () => this.onPositionUpdate(),
		});
	}

	/** プレーンが目標位置に追いつこうとする過程で生じる差分から波形用 uOffset を決める */
	private onPositionUpdate() {
		const offset = this.plane.position.clone().sub(this.position).multiplyScalar(-this.strength);
		this.uniforms.uOffset.value.set(offset.x, offset.y);
	}

	private onMouseOver(index: number) {
		if (!this.isLoaded) return;
		this.onMouseEnter();
		if (this.currentItem?.index === index) return;
		this.onTargetChange(index);
	}

	/** コンテナに入って初めて表示するときだけフェードイン（連続ホバーでは二重に掛けない） */
	private onMouseEnter() {
		if (this.currentItem && this.isMouseOver) return;
		this.isMouseOver = true;
		gsap.to(this.uniforms.uAlpha, { value: 1, duration: 0.5, ease: "power4.out" });
	}

	/** ホバー対象リンクが変わったらテクスチャ差し替えと、vw 基準に近い固定幅でプレーンスケールを決める */
	private onTargetChange(index: number) {
		const item = this.items[index];
		if (!item?.texture) return;
		this.currentItem = item;
		const textureImage = item.texture.image as HTMLImageElement | ImageBitmap;
		const imageWidth =
			"naturalWidth" in textureImage ? textureImage.naturalWidth : textureImage.width;
		const imageHeight =
			"naturalHeight" in textureImage ? textureImage.naturalHeight : textureImage.height;
		const widthPx = 16.927 * (window.innerWidth / 100);
		const heightPx = widthPx * (imageHeight / imageWidth);
		const worldWidth = (widthPx / window.innerWidth) * this.viewSize.width;
		const worldHeight = (heightPx / window.innerWidth) * this.viewSize.width;
		this.plane.scale.set(worldWidth, worldHeight, 1);
		this.uniforms.uTexture.value = item.texture;
	}

	/** コンテナサイズ変更に合わせてカメラとレンダラー解像度を更新 */
	private onWindowResize() {
		const viewport = this.viewport;
		this.camera.aspect = viewport.aspectRatio;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(viewport.width, viewport.height);
	}

	/** メディアクエリ解除時やアンマウント時にリスナー・GSAP・GPU リソースを解放 */
	destroy() {
		this.cleanupHandlers.forEach((cleanup) => cleanup());
		gsap.killTweensOf(this.uniforms.uAlpha);
		gsap.killTweensOf(this.plane.position);
		this.renderer.setAnimationLoop(null);
		this.scene.remove(this.plane);
		this.geometry.dispose();
		this.material.dispose();
		this.items.forEach((item) => item.texture?.dispose());
		this.renderer.dispose();
		this.renderer.domElement.remove();
	}
}

/**
 * `.WaveHover` ラッパー（通常は `div`）へ ref を渡して効果を付与する。`<WaveHover>` を使わず自作マークアップする場合に利用。
 * md 以上でのみ WebGL を初期化する。
 */
export function useWaveHover(containerRef: RefObject<HTMLElement | null>, options?: UseWaveHoverOptions): void {
	const strength = options?.strength ?? 0.25;

	useEffect(() => {
		const root = containerRef.current;
		if (!root) return;
		// Tailwind `md`（768px）以上のみ Three.js を生成（タッチ端末・狭幅では DOM のみ）
		const media = window.matchMedia("(min-width: 768px)");
		let effect: WaveHoverEffect | null = null;
		const sync = () => {
			if (media.matches) {
				if (!effect) effect = new WaveHoverEffect(root, strength);
			} else {
				effect?.destroy();
				effect = null;
			}
		};
		sync();
		media.addEventListener("change", sync);
		return () => {
			media.removeEventListener("change", sync);
			effect?.destroy();
		};
	}, [containerRef, strength]);
}

/**
 * `.WaveHover` 付きラッパー。子は任意。キャンバスはフック内でラッパー末尾に追加される。
 */
export function WaveHover({ children, className }: WaveHoverProps) {
	const rootRef = useRef<HTMLDivElement>(null);
	useWaveHover(rootRef);
	const merged = ["WaveHover", className].filter(Boolean).join(" ");
	return (
		<div ref={rootRef} className={merged}>
			{children}
		</div>
	);
}
