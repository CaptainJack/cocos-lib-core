import {Cancelable} from '../../tool/utils/Cancelable'
import {Context} from './Context'
import {InnerServiceDelegate} from './InnerServiceDelegate'
import {BiserWriter} from '../../tool/biser/BiserWriter'
import {ApiMessageType} from './ApiMessageType'
import {useObjectPool} from '../../tool/utils/pool/ObjectPool'
import {LogBuilder} from './LogBuilder'

export class OuterSubscription {
	
	private _id = 0
	private _cancelable: Cancelable = Cancelable.DUMMY
	
	constructor(
		protected readonly _context: Context,
		private readonly _service: InnerServiceDelegate<any>,
		private readonly _name: string
	) {}
	
	setup(id: number, cancelable: Cancelable) {
		this._id = id
		this._cancelable = cancelable
	}
	
	cancel() {
		this._context.logger.debug(`<~ ${this._service.name}.c <cancel>`)
		this._cancelable.cancel()
		this._cancelable = Cancelable.DUMMY
	}
	
	
	protected call(methodId: number, data: (w: BiserWriter) => void) {
		useObjectPool(this._context.messagePool.writers, (message) => {
			this.prepareCallMessage(methodId, message.writer)
			data(message.writer)
			this._context.connection.send(message.buffer)
		})
	}
	
	protected logCall(method: string, data: (lb: LogBuilder) => string) {
		if (this._context.logger.debugEnabled) {
			this._context.logger.debug(`-> ${this._service.name}.${this._name}[~${(this._id)}](${LogBuilder.apply(data)})`)
		}
	}
	
	protected prepareCallMessage(methodId: number, message: BiserWriter) {
		message.writeByte(ApiMessageType.SUBSCRIPTION_CALL)
		message.writeInt(this._id)
		message.writeInt(methodId)
	}
}