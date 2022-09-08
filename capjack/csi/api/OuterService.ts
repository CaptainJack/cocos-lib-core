import {Context} from './Context'
import {InnerSubscriptionHolder} from './InnerSubscriptionHolder'
import {IllegalStateException} from '../../tool/lang/exceptions/IllegalStateException'
import {BiserWriter} from '../../tool/biser/BiserWriter'
import {useObjectPool} from '../../tool/utils/pool/ObjectPool'
import {ApiMessageType} from './ApiMessageType'
import {InputByteBuffer} from '../../tool/io/InputByteBuffer'
import {ServiceInstance} from './ServiceInstance'
import {OuterServiceInstance} from './OuterServiceInstance'
import {LogBuilder} from './LogBuilder'
import {BiserReader} from '../../tool/biser/BiserReader'
import {InnerSubscription} from './InnerSubscription'

export abstract class OuterService {
	
	private _closed = false
	private readonly _subscriptions = new InnerSubscriptionHolder()
	
	protected constructor(
		protected readonly _context: Context,
		private readonly _instance: Boolean,
		private readonly _id: number,
		readonly _name: String
	) {}
	
	_close() {
		if (!this._closed) {
			this._closed = true
			
			this._subscriptions.cancelAll()
			
			this._context.logger.debug(`-> ${(this._name)} [close]`)
			
			useObjectPool(this._context.messagePool.writers, (message) => {
				message.writer.writeByte(ApiMessageType.INSTANCE_CLOSE)
				message.writer.writeInt(this._id)
				this._context.connection.send(message.buffer)
			})
		}
	}
	
	_removeSubscription(id: number) {
		this._context.innerSubscriptions.remove(id)
		this._subscriptions.remove(id)
	}
	
	_registerSubscription(subscription: InnerSubscription) {
		this._context.innerSubscriptions.add(subscription)
		this._subscriptions.add(subscription)
		if (this._closed) {
			subscription.cancel()
		}
	}
	
	protected _registerCallback(callback: (r: BiserReader, c: number) => void): number {
		return this._context.callbacks.put(callback)
	}
	
	protected _checkClosed() {
		if (this._closed) throw new IllegalStateException('Service is closed')
	}
	
	protected _createServiceInstance<S extends OuterService>(service: S): ServiceInstance<S> {
		return new OuterServiceInstance(service)
	}
	
	protected _callMethod(methodId: number, data: (w: BiserWriter) => void) {
		useObjectPool(this._context.messagePool.writers, (message) => {
			const writer = message.writer
			this._prepareMethodCallMessage(methodId, writer)
			data(writer)
			this._sendMessage(message.buffer)
		})
	}
	
	protected _callMethodWithCallback(methodId: number, callback: number, data: (w: BiserWriter) => void) {
		this._callMethod(methodId, (w) => {
			w.writeInt(callback)
			data(w)
		})
	}
	
	protected _prepareMethodCallMessage(methodId: number, message: BiserWriter) {
		message.writeByte(this._instance ? ApiMessageType.INSTANCE_METHOD_CALL : ApiMessageType.METHOD_CALL)
		message.writeInt(this._id)
		message.writeInt(methodId)
	}
	
	protected _sendMessage(message: InputByteBuffer) {
		this._context.connection.send(message)
	}
	
	protected _prepareLogCallback(method: string, callback: number): string {
		return `<~ [${callback}] ${this._name}.${method}`
	}
	
	protected _logMethodResponse(method: string, callback: number, data: (lb: LogBuilder) => void) {
		if (this._context.logger.debugEnabled) {
			this._context.logger.debug(`${this._prepareLogCallback(method, callback)}: ${LogBuilder.apply(data)}`)
		}
	}
	
	protected _logMethodCall(method: string, data: (lb: LogBuilder) => void) {
		if (this._context.logger.debugEnabled) {
			this._context.logger.debug(`-> ${this._name}.${method}(${LogBuilder.apply(data)})`)
		}
	}
	
	protected _logMethodCallWithCallback(method: string, callback: number, data: (lb: LogBuilder) => void) {
		if (this._context.logger.debugEnabled) {
			this._context.logger.debug(`-> [${callback}] ${this._name}.${method}(${LogBuilder.apply(data)})`)
		}
	}
	
	protected _logInstanceOpen(method: string, callback: number, serviceId: number) {
		if (this._context.logger.debugEnabled) {
			this._context.logger.debug(`${this._prepareLogCallback(method, callback)}: +${serviceId}`)
		}
	}
	
	protected _logInstanceSubscriptionOpen(method: string, callback: number, serviceId: number, subscriptionId: number) {
		if (this._context.logger.debugEnabled) {
			this._context.logger.debug(`${this._prepareLogCallback(method, callback)}: +${serviceId}~${subscriptionId}`)
		}
	}
	
	protected _logSubscriptionBegin(method: string, callback: number, subscriptionId: number) {
		if (this._context.logger.debugEnabled) {
			this._context.logger.debug(`${this._prepareLogCallback(method, callback)}: ~${subscriptionId}`)
		}
	}
}