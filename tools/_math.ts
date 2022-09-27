export namespace _math {
	
	export function median(array: Array<number>): number {
		const half = array.length / 2
		const sorted = [].concat(array).sort((a, b) => a - b)
		
		return array.length % 2 === 0
			? (sorted[half] + sorted[half + 1]) / 2
			: sorted[~~(half)]
	}
}