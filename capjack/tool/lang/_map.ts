export namespace _map {
	export function putAll<K, V>(target: Map<K, V>, source: Map<K, V>) {
		for (const [k, v] of source) {
			target.set(k, v)
		}
	}
	
	export function joinToString(map: Map<any, any>): string {
		let r = []
		for (const [k, v] of map) {
			r.push(`${k}: ${v}`)
		}
		return `{${r.join(', ')}}`
	}
}