import {IllegalArgumentException} from '../capjack/tool/lang/exceptions/IllegalArgumentException'

export namespace _random {
	export function int(bound: number): number {
		if (bound <= 0) {
			throw new IllegalArgumentException(`Illegal bound ${bound}`)
		}
		return Math.floor(Math.random() * bound)
	}
	
	export function intOfRange(from: number, to: number): number {
		if (from > to) {
			throw new IllegalArgumentException(`Illegal range ${from}..${to}`)
		}
		return from == to ? from : (int(to - from + 1) + from)
	}
	
	export function gamble(chance: number): Boolean {
		if (chance == 0.0) return false
		if (chance == 1.0) return true
		
		return Math.random() < chance
	}
	
	export function element<T>(collection: ArrayLike<T>): T | null {
		let l = collection.length
		if (l == 0) return null
		if (l == 1) return collection[0]
		return collection[int(l)]
	}
}