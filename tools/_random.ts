import {IllegalArgumentException} from '../capjack/tool/lang/exceptions/IllegalArgumentException'
import {_array} from '../capjack/tool/lang/_arrays'

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

export class WeightRandomizer {
	private readonly _totalWeight: number
	
	constructor(
		private _weights: Array<number>
	) {
		this._totalWeight = _array.sum(this._weights)
	}
	
	nextIndex(): number {
		const r = _random.int(this._totalWeight)
		let a = 0
		let i = 0
		
		while (true) {
			a += this._weights[i]
			if (a > r) {
				return i
			}
			++i
		}
	}
}


export class ValuesWeightRandomizer<T> extends WeightRandomizer {
	constructor(
		private _values: Array<T>,
		weights: Array<number>
	) {
		super(weights)
	}
	
	public nextValue(): T {
		return this._values[this.nextIndex()]
	}
}