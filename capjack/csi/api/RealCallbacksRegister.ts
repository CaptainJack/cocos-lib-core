import {CallbacksRegister} from './CallbacksRegister'
import {BiserReader} from '../../tool/biser/BiserReader'
import {IllegalStateException} from '../../tool/lang/exceptions/IllegalStateException'

export class RealCallbacksRegister implements CallbacksRegister {
	private nextId = 0
	private readonly map = new Map<number, (r: BiserReader, c: number) => void>()
	
	put(callback: (r: BiserReader, c: number) => void): number {
		let id = this.nextId++
		if (this.map.has(id)) {
			throw new IllegalStateException(`Unprocessed callback ${id}`)
		}
		this.map.set(id, callback)
		return id
	}
	
	take(id: number): ((r: BiserReader, c: number) => void) | null {
		let callback = this.map.get(id)
		if (this.map.delete(id)) {
			return callback
		}
		return null
	}
}