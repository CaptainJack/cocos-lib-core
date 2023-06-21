import {isNullable} from './_utils'

export namespace _map {
	export function putAll<K, V>(target: Map<K, V>, source: Map<K, V>) {
		for (const [k, v] of source) {
			target.set(k, v)
		}
	}
	
	export function getOrDefault<K, V>(map: Map<K, V>, key: K, def: V): V {
		const v = map.get(key)
		return isNullable(v) ? def : v
	}
	
	export function joinToString(map: Map<any, any>, entitySeparator: string = ', ', valueSeparator: string = ': '): string {
		let r = []
		for (const [k, v] of map) {
			r.push(k + valueSeparator + v)
		}
		return r.join(entitySeparator)
	}
}