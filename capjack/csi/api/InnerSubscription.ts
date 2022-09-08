import {BiserReader} from '../../tool/biser/BiserReader'
import {Context} from './Context'
import {OuterService} from './OuterService'
import {useObjectPool} from '../../tool/utils/pool/ObjectPool'
import {ApiMessageType} from './ApiMessageType'
import {LogBuilder} from './LogBuilder'

export abstract class InnerSubscription {
	
	private canceled = false
	
	protected constructor(
		protected readonly context: Context,
		protected readonly service: OuterService,
		protected readonly name: string,
		readonly id: number
	) {}
	
	abstract call(argumentId: number, message: BiserReader): boolean
	
	cancel() {
		if (!this.canceled) {
			this.canceled = true
			
			this.service._removeSubscription(this.id)
			
			this.context.logger.debug(`-> ${this.service._name}.${this.name}[~${(this.id)}] [cancel]`)
			
			useObjectPool(this.context.messagePool.writers, (message) => {
				message.writer.writeByte(ApiMessageType.SUBSCRIPTION_CANCEL)
				message.writer.writeInt(this.id)
				this.context.connection.send(message.buffer)
			})
		}
	}
	
	protected logCall(method: string, data: (lb: LogBuilder) => void) {
		if (this.context.logger.debugEnabled) {
			this.context.logger.debug(`<~ ${this.service._name}.${this.name}[~${this.id}].${method}(${LogBuilder.apply(data)})`)
		}
	}
}