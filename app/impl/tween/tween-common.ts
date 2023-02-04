export namespace tween_common {
	
	export interface Cloneable {
		clone(): any
	}
	
	export function cloneArray<T extends Cloneable>(array: Array<T>): Array<T> {
		const result = new Array<T>(array.length)
		for (let i = 0; i < array.length; i++) {
			result[i] = array[i].clone()
		}
		return result
	}
	
}