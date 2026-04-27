import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
	ContactShadows,
	Environment,
	PresentationControls,
} from "@react-three/drei";
import type { Group, Mesh } from "three";

/**
 * 真鍮製の製図用コンパス（ディバイダー）を再現した 3D プレビュー。
 * 参考画像：public/images/common/aozora/ChatGPT Image 2026年4月24日 19_52_31.webp
 * 構成部品は全て three.js の基本ジオメトリのみで構築し、外部モデルに依存させない。
 */

interface BrassCompassProps {
	/** ラッパーに付与するクラス。サイズや位置は親から制御する。 */
	className?: string;
	/** true の場合、ユーザーがドラッグで向きを変えられるようにする。 */
	interactive?: boolean;
	/** true の場合、オブジェクトが緩やかにゆらぎ続ける。 */
	autoSpin?: boolean;
	/** HDRI 環境反射のプリセット。未指定時は studio。 */
	environmentPreset?:
		| "studio"
		| "warehouse"
		| "city"
		| "apartment"
		| "sunset"
		| "dawn"
		| "forest"
		| "lobby"
		| "night"
		| "park";
	/** カメラの画角（度数）。 */
	fov?: number;
}

/** 画像の色相に合わせた真鍮カラーパレット。 */
const BRASS_COLORS = {
	/** ハイライト寄りの明るい金。 */
	highlight: "#f4dc9a",
	/** 中間色。真鍮のメインカラー。 */
	base: "#d8b462",
	/** 陰影のあるメタル。 */
	shadow: "#9c7a2f",
	/** 針先・鉛筆芯など暗色のディテール。 */
	tip: "#1f1a13",
	/** リベットなど微かに明るいアクセント。 */
	rivet: "#b88838",
} as const;

function BrassCompass({
	className = "",
	interactive = true,
	autoSpin = true,
	environmentPreset = "studio",
	fov = 32,
}: BrassCompassProps) {
	return (
		<div
			className={`relative isolate ${className}`}
			role="img"
			aria-label="真鍮製の製図コンパスの 3D オブジェクト"
		>
			<Canvas
				className="h-full w-full"
				camera={{ position: [0, 0, 12], fov }}
				dpr={[1, 2]}
				gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
			>
				{/* 影は ContactShadows に任せ、Canvas の shadow map は無効化する（deprecation 回避）。 */}
				<ambientLight intensity={0.55} />
				<directionalLight position={[4, 6, 5]} intensity={1.7} />
				<directionalLight position={[-4, 3, 2]} intensity={0.6} color="#fff2c4" />
				<directionalLight position={[0, 1, 8]} intensity={0.9} color="#ffe6b8" />
				<pointLight position={[0, -4, 4]} intensity={0.35} color="#ffd98a" />

				<Suspense fallback={null}>
					<Environment preset={environmentPreset} />
					{interactive ? (
						<PresentationControls
							global
							polar={[-Math.PI / 6, Math.PI / 6]}
							azimuth={[-Math.PI / 3, Math.PI / 3]}
							damping={0.15}
							snap
						>
							<CompassRig autoSpin={autoSpin} />
						</PresentationControls>
					) : (
						<CompassRig autoSpin={autoSpin} />
					)}
					<ContactShadows
						position={[0, -4, 0]}
						opacity={0.35}
						scale={9}
						blur={2.4}
						far={3}
						color="#2b1f07"
					/>
				</Suspense>
			</Canvas>
		</div>
	);
}

/** コンパス本体と浮遊アニメーションを扱う内部コンポーネント。 */
function CompassRig({ autoSpin }: { autoSpin: boolean }) {
	const rigRef = useRef<Group>(null);

	useFrame(({ clock }) => {
		if (!rigRef.current || !autoSpin) return;
		const time = clock.elapsedTime;
		rigRef.current.rotation.y = Math.sin(time * 0.35) * 0.25;
		rigRef.current.position.y = Math.sin(time * 0.6) * 0.08;
	});

	return (
		<group ref={rigRef} position={[0, 0, 0]}>
			<CompassModel />
		</group>
	);
}

/** コンパスのジオメトリを束ねたメッシュ集合。 */
function CompassModel() {
	const rootRef = useRef<Group>(null);

	// マテリアル設定は同じものを複数メッシュで使うため useMemo で安定化する。
	// metalness を 1 未満に抑えて拡散成分を残し、暗い環境でも真鍮の色が出るようにする。
	const material = useMemo(
		() => ({
			/** 金属光沢の強い真鍮。ハイライトが出やすいよう粗さは低め。 */
			brass: {
				color: BRASS_COLORS.base,
				metalness: 0.85,
				roughness: 0.28,
				envMapIntensity: 1,
			},
			/** 磨きのかかった真鍮（ノブなど）。 */
			brassPolished: {
				color: BRASS_COLORS.highlight,
				metalness: 0.9,
				roughness: 0.18,
				envMapIntensity: 1.1,
			},
			/** 鈍い真鍮（下地・裏面用）。 */
			brassMatte: {
				color: BRASS_COLORS.shadow,
				metalness: 0.75,
				roughness: 0.5,
				envMapIntensity: 0.7,
			},
			/** 針先や鉛筆芯などの暗色パーツ。 */
			darkTip: {
				color: BRASS_COLORS.tip,
				metalness: 0.3,
				roughness: 0.55,
			},
			/** リベットなど小物の強い光沢。 */
			rivet: {
				color: BRASS_COLORS.rivet,
				metalness: 0.9,
				roughness: 0.22,
				envMapIntensity: 1.2,
			},
		}),
		[],
	);

	// 画像と同じく軸はほぼ真正面、僅かにカメラ側へ倒して立体感を出す。
	// モデル全体の Y中心を画面中心に近づけつつ、視野に収まるよう scale で圧縮。
	return (
		<group ref={rootRef} position={[0, 0.1, 0]} rotation={[0.05, 0, 0]} scale={0.78}>
			<GripAssembly materialBrass={material.brass} materialPolished={material.brassPolished} />
			<HeadAssembly
				materialBrass={material.brass}
				materialMatte={material.brassMatte}
				materialRivet={material.rivet}
			/>
			<Leg
				side="left"
				materialBrass={material.brass}
				materialMatte={material.brassMatte}
				materialTip={material.darkTip}
				materialRivet={material.rivet}
				tipKind="needle"
			/>
			<Leg
				side="right"
				materialBrass={material.brass}
				materialMatte={material.brassMatte}
				materialTip={material.darkTip}
				materialRivet={material.rivet}
				tipKind="pencil"
			/>
			<CrossBar
				materialBrass={material.brass}
				materialPolished={material.brassPolished}
			/>
		</group>
	);
}

type MaterialProps = Parameters<typeof MeshStandard>[0];

// ヘルパー：meshStandardMaterial を宣言的に束ねる。
function MeshStandard(props: {
	color: string;
	metalness?: number;
	roughness?: number;
	envMapIntensity?: number;
}) {
	return (
		<meshStandardMaterial
			color={props.color}
			metalness={props.metalness ?? 1}
			roughness={props.roughness ?? 0.2}
			envMapIntensity={props.envMapIntensity ?? 1}
		/>
	);
}

/** 上部グリップ（手で持つ円筒）。 */
function GripAssembly({
	materialBrass,
	materialPolished,
}: {
	materialBrass: MaterialProps;
	materialPolished: MaterialProps;
}) {
	// 原画の構成に合わせ、ヘッド上端（y=2.15）に直接接続する縦の塔として定義する。
	return (
		<group position={[0, 2.2, 0]}>
			{/* グリップ最上部の広がったフランジ。 */}
			<mesh position={[0, 1.35, 0]}>
				<cylinderGeometry args={[0.46, 0.38, 0.18, 48]} />
				<MeshStandard {...materialPolished} />
			</mesh>
			{/* フランジ下の細い溝リング。 */}
			<mesh position={[0, 1.22, 0]}>
				<cylinderGeometry args={[0.3, 0.3, 0.06, 32]} />
				<MeshStandard {...materialBrass} />
			</mesh>
			{/* グリップ本体（下に向かって少し細くなる緩やかなテーパー）。 */}
			<mesh position={[0, 0.6, 0]}>
				<cylinderGeometry args={[0.34, 0.3, 1.15, 48]} />
				<MeshStandard {...materialBrass} />
			</mesh>
			{/* グリップ下端のリング装飾。 */}
			<mesh position={[0, -0.05, 0]}>
				<cylinderGeometry args={[0.34, 0.34, 0.12, 48]} />
				<MeshStandard {...materialPolished} />
			</mesh>
		</group>
	);
}

/** ヘッド（脚を留める楕円プレートとリベット）。 */
function HeadAssembly({
	materialBrass,
	materialMatte,
	materialRivet,
}: {
	materialBrass: MaterialProps;
	materialMatte: MaterialProps;
	materialRivet: MaterialProps;
}) {
	// 楕円プレートは cylinder を X軸で寝かせ、Z 方向を厚み、XY 方向を面として使う。
	// scale=[幅, 縦長さ, 奥行き] として再解釈し、縦長楕円に変形する。
	return (
		<group position={[0, 1.3, 0]}>
			{/* 正面の大きな楕円プレート。 */}
			<mesh
				position={[0, 0, 0.12]}
				rotation={[Math.PI / 2, 0, 0]}
				scale={[0.85, 1, 1.55]}
			>
				<cylinderGeometry args={[0.55, 0.55, 0.14, 48]} />
				<MeshStandard {...materialBrass} />
			</mesh>
			{/* 背面プレート（少し暗めで立体感を出す）。 */}
			<mesh
				position={[0, 0, -0.06]}
				rotation={[Math.PI / 2, 0, 0]}
				scale={[0.82, 1, 1.5]}
			>
				<cylinderGeometry args={[0.55, 0.55, 0.12, 48]} />
				<MeshStandard {...materialMatte} />
			</mesh>
			{/* ヘッド上部のリベット。 */}
			<mesh position={[0, 0.52, 0.22]}>
				<cylinderGeometry args={[0.07, 0.07, 0.06, 24]} />
				<MeshStandard {...materialRivet} />
			</mesh>
			{/* ヘッド中央下のリベット。 */}
			<mesh position={[0, -0.2, 0.22]}>
				<cylinderGeometry args={[0.055, 0.055, 0.06, 24]} />
				<MeshStandard {...materialRivet} />
			</mesh>
		</group>
	);
}

/** 2 本の脚（左右共通）。先端のヒンジ・ポインタも扱う。 */
function Leg({
	side,
	materialBrass,
	materialMatte,
	materialTip,
	materialRivet,
	tipKind,
}: {
	side: "left" | "right";
	materialBrass: MaterialProps;
	materialMatte: MaterialProps;
	materialTip: MaterialProps;
	materialRivet: MaterialProps;
	tipKind: "needle" | "pencil";
}) {
	const sign = side === "left" ? -1 : 1;
	// V字に開く角度。画像より控えめの 9 度を採用。
	const angle = (sign * Math.PI) / 20;

	const legRef = useRef<Mesh>(null);

	// 脚はヘッド下端 (y=0.45 付近) を起点とし、下方向に延ばす。
	return (
		<group position={[0, 0.45, 0.04]} rotation={[0, 0, angle]}>
			{/* 脚とヘッドを繋ぐ小さなピボットリング。 */}
			<mesh position={[0, -0.03, 0.02]}>
				<cylinderGeometry args={[0.14, 0.14, 0.1, 24]} />
				<MeshStandard {...materialBrass} />
			</mesh>
			{/* 脚本体：薄い板状の金属。中心 y=-1.75、上端 y=0、下端 y=-3.5。 */}
			<mesh ref={legRef} position={[0, -1.75, 0]}>
				<boxGeometry args={[0.22, 3.5, 0.11]} />
				<MeshStandard {...materialBrass} />
			</mesh>

			{/* 裏面ハイライト用のストライプ（薄く、奥行きを強調）。 */}
			<mesh position={[0, -1.75, -0.07]}>
				<boxGeometry args={[0.16, 3.4, 0.02]} />
				<MeshStandard {...materialMatte} />
			</mesh>

			{/* 脚下端のヒンジ（ピボット）。画像の丸い金具。 */}
			<mesh position={[0, -3.55, 0.05]}>
				<cylinderGeometry args={[0.18, 0.18, 0.16, 28]} />
				<MeshStandard {...materialBrass} />
			</mesh>
			{/* ヒンジ中央のリベット。 */}
			<mesh position={[0, -3.55, 0.14]}>
				<cylinderGeometry args={[0.06, 0.06, 0.05, 20]} />
				<MeshStandard {...materialRivet} />
			</mesh>

			{/* ヒンジから先端へ伸びる短い継ぎ。 */}
			<mesh position={[0, -3.82, 0]}>
				<cylinderGeometry args={[0.1, 0.12, 0.3, 20]} />
				<MeshStandard {...materialBrass} />
			</mesh>

			{/* 先端：片方は鋭い針、もう片方は鉛筆風の尖り。 */}
			{tipKind === "needle" ? (
				<>
					{/* 針受け（真鍮スリーブ）。 */}
					<mesh position={[0, -4.05, 0]}>
						<coneGeometry args={[0.11, 0.22, 20]} />
						<MeshStandard {...materialBrass} />
					</mesh>
					{/* 針本体（暗色・細長い）。 */}
					<mesh position={[0, -4.32, 0]}>
						<coneGeometry args={[0.022, 0.34, 16]} />
						<MeshStandard {...materialTip} />
					</mesh>
				</>
			) : (
				<>
					{/* 鉛筆保持部。 */}
					<mesh position={[0, -4.05, 0]}>
						<coneGeometry args={[0.13, 0.24, 20]} />
						<MeshStandard {...materialBrass} />
					</mesh>
					{/* 鉛筆の尖り。わずかに太めで暗色。 */}
					<mesh position={[0, -4.3, 0]}>
						<coneGeometry args={[0.045, 0.28, 16]} />
						<MeshStandard {...materialTip} />
					</mesh>
				</>
			)}
		</group>
	);
}

/** クロスバー（脚の開きを固定するネジ機構）。 */
function CrossBar({
	materialBrass,
	materialPolished,
}: {
	materialBrass: MaterialProps;
	materialPolished: MaterialProps;
}) {
	return (
		<group position={[0, -0.95, 0.1]}>
			{/* 水平のネジ棒。 */}
			<mesh rotation={[0, 0, Math.PI / 2]}>
				<cylinderGeometry args={[0.05, 0.05, 2.4, 20]} />
				<MeshStandard {...materialBrass} />
			</mesh>

			{/* ネジ山を示すため細いリングを並べる（中央の隙間を避けて左右に分割）。 */}
			{Array.from({ length: 12 }).map((_, index) => {
				const offset = -0.82 + index * 0.14;
				// 中央ノブ（±0.17）付近はスキップしてスジが埋もれないようにする。
				if (Math.abs(offset) < 0.18) return null;
				return (
					<mesh key={index} position={[offset, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
						<torusGeometry args={[0.065, 0.012, 6, 20]} />
						<MeshStandard {...materialBrass} />
					</mesh>
				);
			})}

			{/* 左右のノブ（ローレット風のネジ頭）。 */}
			<Knob position={[-1.12, 0, 0]} material={materialPolished} large />
			<Knob position={[1.12, 0, 0]} material={materialPolished} large />

			{/* 中央の調整ノブ（脚幅を決める）。 */}
			<Knob position={[0, 0, 0]} material={materialPolished} large={false} />
		</group>
	);
}

/** ローレット加工風のノブ。小刻みな縦スリットを円周に並べて表現。 */
function Knob({
	position,
	material,
	large,
}: {
	position: [number, number, number];
	material: MaterialProps;
	large: boolean;
}) {
	const radius = large ? 0.2 : 0.16;
	const height = large ? 0.28 : 0.22;
	const segments = large ? 28 : 22;

	// スリットを描画するための小さな立方体を円周に配置する。
	const slits = useMemo(() => {
		const entries: { angle: number }[] = [];
		const count = large ? 18 : 14;
		for (let i = 0; i < count; i += 1) {
			entries.push({ angle: (i / count) * Math.PI * 2 });
		}
		return entries;
	}, [large]);

	return (
		<group position={position} rotation={[0, 0, Math.PI / 2]}>
			{/* ノブ本体。 */}
			<mesh>
				<cylinderGeometry args={[radius, radius, height, segments]} />
				<MeshStandard {...material} />
			</mesh>

			{/* 上下の縁リング。 */}
			<mesh position={[0, height / 2 + 0.02, 0]}>
				<cylinderGeometry args={[radius * 1.04, radius * 1.04, 0.04, segments]} />
				<MeshStandard {...material} />
			</mesh>
			<mesh position={[0, -(height / 2) - 0.02, 0]}>
				<cylinderGeometry args={[radius * 1.04, radius * 1.04, 0.04, segments]} />
				<MeshStandard {...material} />
			</mesh>

			{/* 円周上のスリット（ローレット表現）。 */}
			{slits.map((slit, index) => (
				<mesh
					key={index}
					position={[
						Math.cos(slit.angle) * (radius + 0.005),
						0,
						Math.sin(slit.angle) * (radius + 0.005),
					]}
					rotation={[0, -slit.angle, 0]}
				>
					<boxGeometry args={[0.012, height * 0.85, 0.02]} />
					<MeshStandard
						color="#8a6621"
						metalness={0.8}
						roughness={0.45}
						envMapIntensity={0.6}
					/>
				</mesh>
			))}
		</group>
	);
}

export default BrassCompass;
