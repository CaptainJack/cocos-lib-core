export namespace _collection {
	export function addAll<T>(target: Set<T>, source: Iterable<T>) {
		for (const e of source) {
			target.add(e)
		}
	}
	
	export function joinToString(collection: Set<unknown>, separator: string = ', ') {
		return Array.from(collection).join(separator)
	}
}