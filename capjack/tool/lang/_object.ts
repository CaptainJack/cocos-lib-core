export namespace _object {
	export function merge<T, U>(target: T, source: U): T & U {
		target = target || {} as T
		for (const key of Object.keys(source)) {
			if (target[key] === undefined) {
				target[key] = source[key]
			}
		}
		return target as T & U
	}
}