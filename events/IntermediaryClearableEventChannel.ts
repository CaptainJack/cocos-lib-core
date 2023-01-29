import {ClearableEventChannel} from './ClearableEventChannel'
import {Cancelable} from '../capjack/tool/utils/Cancelable'
import {EventChannel} from './EventChannel'
import {Class} from '../capjack/tool/lang/_types'

export class IntermediaryClearableEventChannel<E> implements ClearableEventChannel<E> {
	
	private list = new Set<Cancelable>()
	
	constructor(
		private readonly target: EventChannel<E>
	) {}
	
	public emit(event: E) {
		this.target.emit(event)
	}
	
	public on<T extends E>(type: Class<T>, receiver: (event: T) => void, target?: any): Cancelable
	public on<T extends E>(type: T, receiver: (event: T) => void, target?: any): Cancelable
	public on(type, receiver, target?: any): Cancelable {
		return new ProxyCancelable(this.list, this.target.on(type, receiver, target))
	}
	
	public once<T extends E>(type: Class<T>, receiver: (event: T) => void, target?: any): Cancelable
	public once<T extends E>(type: T, receiver: (event: T) => void, target?: any): Cancelable
	public once(type, receiver, target?: any): Cancelable {
		return new ProxyCancelable(this.list, this.target.once(type, receiver, target))
	}
	
	public clear() {
		const a = Array.from(this.list)
		this.list.clear()
		for (const e of a) {
			e.cancel()
		}
	}
}

class ProxyCancelable implements Cancelable {
	constructor(
		private list: Set<Cancelable>,
		private target: Cancelable
	) {
		this.list.add(this)
	}
	
	public cancel(): void {
		if (this.list) {
			this.target.cancel()
			this.list.delete(this)
			this.target = null
			this.list = null
		}
	}
}