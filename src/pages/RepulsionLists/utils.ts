export const deterministicNoise = (seed: number, salt = 0) => {
	const value = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
	return value - Math.floor(value);
};

export const hashString = (value: string) => {
	let hash = 0;
	for (let index = 0; index < value.length; index += 1) {
		hash = (hash << 5) - hash + value.charCodeAt(index);
		hash &= hash;
	}
	return Math.abs(hash);
};

export const px = (value: number) => `${value.toFixed(2)}px`;
export const sec = (value: number) => `${value.toFixed(2)}s`;
export const fixed = (value: number) => value.toFixed(2);
