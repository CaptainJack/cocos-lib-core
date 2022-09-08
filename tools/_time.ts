export namespace _time {
	export function nowSeconds(): number {
		return performance.now() / 1000 | 0
	}
}