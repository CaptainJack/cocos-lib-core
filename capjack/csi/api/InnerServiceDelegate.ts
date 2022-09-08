import {BiserReader} from '../../tool/biser/BiserReader'
import {Context} from './Context'
import {OuterSubscription} from './OuterSubscription'
import {Cancelable} from '../../tool/utils/Cancelable'
import {BiserWriter} from '../../tool/biser/BiserWriter'
import {useObjectPool} from '../../tool/utils/pool/ObjectPool'
import {ApiMessageType} from './ApiMessageType'
import {ByteBuffer} from '../../tool/io/ByteBuffer'
import {ServiceInstance} from './ServiceInstance'
import {InnerServiceHolderItem} from './InnerServiceHolderItem'
import {LogBuilder} from './LogBuilder'

// noinspection JSMethodCanBeStatic
export abstract class InnerServiceDelegate<S> {
	
	protected constructor(
		protected context: Context,
		protected service: S,
		public name: string
	) {}
	
	setup(id: number) {
		this.name += `[+${id}]`
	}
	
	close() {
		this.context.logger.debug(`<~ ${this.name} [close]`)
	}
	
	abstract callMethod(methodId: number, reader: BiserReader): boolean
	
	protected registerInstanceService<S>(instance: ServiceInstance<S>, delegate: InnerServiceDelegate<S>): number {
		return this.context.innerInstanceServices.add(new InnerServiceHolderItem(instance, delegate))
	}
	
	protected registerSubscription(subscription: OuterSubscription, cancelable: Cancelable): number {
		return this.context.outerSubscriptions.add(subscription, cancelable)
	}
	
	protected sendMethodResponse(callback: number, data: (w: BiserWriter) => void) {
		useObjectPool(this.context.messagePool.writers, (message) => {
			const writer = message.writer
			this.prepareMethodResponseMessage(callback, writer)
			data(writer)
			this.sendResponseMessage(message.buffer)
		})
	}
	
	protected sendInstanceServiceResponse(callback: number, serviceId: number) {
		this.sendMethodResponse(callback, w => w.writeInt(serviceId))
	}
	
	protected sendInstanceServiceSubscriptionResponse(callback: number, serviceId: number, subscriptionId: number) {
		this.sendMethodResponse(callback, w => {
			w.writeInt(serviceId)
			w.writeInt(subscriptionId)
		})
	}
	
	protected sendSubscriptionResponse(callback: number, subscriptionId: number) {
		this.sendMethodResponse(callback, w => w.writeInt(subscriptionId))
	}
	
	protected logInstanceServiceResponse(method: string, callback: number, serviceId: number) {
		if (this.context.logger.debugEnabled) {
			this.logMethodResponse(method, callback, lb => lb.log(`+${serviceId}`))
		}
	}
	
	protected logInstanceServiceSubscriptionResponse(method: string, callback: number, serviceId: number, subscriptionId: number) {
		if (this.context.logger.debugEnabled) {
			this.logMethodResponse(method, callback, lb => lb.log(`+${serviceId}~${subscriptionId}`))
		}
	}
	
	
	protected logSubscriptionResponse(method: string, callback: number, subscriptionId: number) {
		if (this.context.logger.debugEnabled) {
			this.logMethodResponse(method, callback, lb => lb.log(`~${subscriptionId}`))
		}
	}
	
	protected logMethodCall(method: string, data: (lb: LogBuilder) => void) {
		if (this.context.logger.debugEnabled) {
			this.context.logger.debug(`<- ${this.name}.${method}(${LogBuilder.apply(data)})`)
		}
	}
	
	protected logMethodCallWithCallback(method: string, callback: number, data: (lb: LogBuilder) => void) {
		if (this.context.logger.debugEnabled) {
			this.context.logger.debug(`<- [${callback}] ${this.name}.${method}(${LogBuilder.apply(data)})`)
		}
	}
	
	protected logMethodResponse(method: String, callback: number, data: (lb: LogBuilder) => void) {
		if (this.context.logger.debugEnabled) {
			this.context.logger.debug(`~> [${callback}] ${this.name}.${method}: ${LogBuilder.apply(data)}`)
		}
	}
	
	private prepareMethodResponseMessage(callback: number, message: BiserWriter) {
		message.writeByte(ApiMessageType.METHOD_RESPONSE)
		message.writeInt(callback)
	}
	
	private sendResponseMessage(message: ByteBuffer) {
		this.context.connection.send(message)
	}
}