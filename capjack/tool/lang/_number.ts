export const INT_MAX_VALUE = 0x7fffffff;

export namespace _number {
	export function coerceIn(value: number, min: number, max: number): number {
		if (value < min) return min
		if (value > max) return max
		return value
	}
	
	export function coerceAtLeast(value: number, min: number): number {
		return value < min ? min : value
	}
	
	export function coerceAtMost(value: number, max: number): number {
		return value > max ? max : value
	}
}