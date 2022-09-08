import {ClearableEventChannel} from './ClearableEventChannel'
import {EventReceivers} from './EventReceivers'
import {Class} from '../capjack/tool/lang/_types'
import {isString, requireNotNullable} from '../capjack/tool/lang/_utils'
import {Cancelable} from '../capjack/tool/utils/Cancelable'

export class DirectEventChannel<E> implements ClearableEventChannel<E> {
	private _receiversMap = new Map<Class<E> | E, EventReceivers>()
	
	clear() {
		this._receiversMap.forEach((receivers) => receivers.clear())
	}
	
	emit(event: E) {
		requireNotNullable(event)
		
		this._receiversMap.forEach((receivers, t) => {
			if (event === t || (t instanceof Function && event instanceof t)) {
				receivers.dispatch(event)
			}
		})
	}
	
	on<T extends E>(type: Class<T>, receiver: (event: T) => void, target?: any): Cancelable
	on<T extends E>(type: T, receiver: (event: T) => void, target?: any): Cancelable
	on(type, receiver, target?: any): Cancelable {
		requireNotNullable(type)
		
		if (target) {
			receiver = receiver.bind(target)
		}
		
		let receivers = this._receiversMap.get(type)
		if (!receivers) {
			receivers = new EventReceivers()
			this._receiversMap.set(type, receivers)
		}
		return receivers.add(receiver)
	}
	
	once<T extends E>(type: Class<T>, receiver: (event: T) => void, target?: any): Cancelable
	once<T extends E>(type: T, receiver: (event: T) => void, target?: any): Cancelable
	once(type, receiver, target?: any): Cancelable {
		requireNotNullable(type)
		
		if (target) {
			receiver = receiver.bind(target)
		}
		
		const cancelable = this.on(type, (e) => {
			cancelable.cancel()
			receiver(e)
		})
		return cancelable
	}
}