export const INT_MAX_VALUE = 0x7fffffff

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
	
	export function isInt(value: number) {
		return (value | 0) === value
	}
	
	export function isDouble(value: number) {
		return !isInt(value)
	}
	
	export function sequence(start: number, stop: number, step: number = 1): Array<number> {
		return Array.from(
			{length: (stop - start) / step + 1},
			(value, index) => start + index * step
		)
	}
}