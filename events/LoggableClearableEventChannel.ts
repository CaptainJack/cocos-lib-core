import {Logger} from '../capjack/tool/logging/Logger'
import {Level} from '../capjack/tool/logging/Level'
import {Class} from '../capjack/tool/lang/_types'
import {Cancelable} from '../capjack/tool/utils/Cancelable'
import {ClearableEventChannel} from './ClearableEventChannel'

export class LoggableClearableEventChannel<E> implements ClearableEventChannel<E> {
	constructor(
		private readonly target: ClearableEventChannel<E>,
		private readonly logger: Logger,
		private readonly level: Level,
		private readonly prefix: string = ''
	) {}
	
	public emit(event: E) {
		if (this.logger.isEnabled(this.level)) {
			this.logger.log(this.level, this.prefix + event.toString())
		}
		this.target.emit(event)
	}
	
	public on<T extends E>(type: Class<T>, receiver: (event: T) => void, target?: any): Cancelable
	public on<T extends E>(type: T, receiver: (event: T) => void, target?: any): Cancelable
	public on(type, receiver, target?: any): Cancelable {
		return this.target.on(type, receiver, target)
	}
	
	public once<T extends E>(type: Class<T>, receiver: (event: T) => void, target?: any): Cancelable
	public once<T extends E>(type: T, receiver: (event: T) => void, target?: any): Cancelable
	public once(type, receiver, target?: any): Cancelable {
		return this.target.once(type, receiver, target)
	}
	
	public clear() {
		this.target.clear()
	}
}

