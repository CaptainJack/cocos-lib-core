import {BaseInnerApi} from './BaseInnerApi'
import {Context} from './Context'
import {BaseConnectionHandler} from '../core/BaseConnectionHandler'
import {InputByteBuffer} from '../../tool/io/InputByteBuffer'
import {useObjectPool} from '../../tool/utils/pool/ObjectPool'
import {ApiMessageType} from './ApiMessageType'
import {ProtocolBrokenException} from '../core/ProtocolBrokenException'
import {InnerServiceDelegate} from './InnerServiceDelegate'

export abstract class BaseApiConnection<IA extends BaseInnerApi> implements BaseConnectionHandler {
	
	protected constructor(
		protected readonly context: Context,
		protected readonly api: IA
	) {
		this.context.logger.debug('Open')
	}
	
	handleConnectionMessage(message: InputByteBuffer) {
		useObjectPool(this.context.messagePool.readers, reader => {
			reader.buffer = message
			
			const messageTypeCode = reader.readByte()
			const messageType: ApiMessageType = ApiMessageType[ApiMessageType[messageTypeCode]]
			if (!messageType) throw new ProtocolBrokenException(`Bad api message type code ${messageTypeCode}`)
			
			switch (messageType) {
				case ApiMessageType.METHOD_RESPONSE: {
					const responseId = reader.readInt()
					const callback = this.context.callbacks.take(responseId)
					if (callback == null) {
						throw new ProtocolBrokenException(`Response an unknown callback $responseId`)
					}
					callback(reader, responseId)
					break
				}
				
				case ApiMessageType.SUBSCRIPTION_CALL: {
					const subscriptionId = reader.readInt()
					const argumentId = reader.readInt()
					const subscription = this.context.innerSubscriptions.get(subscriptionId)
					if (subscription === null) {
						message.skipReadFully()
						this.context.logger.warn(`Calling an unknown subscription ${subscriptionId}.${argumentId}`)
					}
					else {
						const success = subscription.call(argumentId, reader)
						if (!success) {
							throw new ProtocolBrokenException(`Calling an unknown subscription ${subscriptionId}.${argumentId}`)
						}
					}
					break
				}
				
				case ApiMessageType.METHOD_CALL: {
					const serviceId = reader.readInt()
					const methodId = reader.readInt()
					const service = this.findService(serviceId)
					const success = service != null && service.callMethod(methodId, reader)
					if (!success) {
						throw new ProtocolBrokenException(`Calling an unknown service ${serviceId}.${methodId}`)
					}
					break
				}
				
				case ApiMessageType.INSTANCE_METHOD_CALL: {
					const serviceId = reader.readInt()
					const methodId = reader.readInt()
					const service = this.context.innerInstanceServices.get(serviceId)
					const success = service != null && service.callMethod(methodId, reader)
					if (!success) {
						throw new ProtocolBrokenException(`Calling an unknown service ${serviceId}.${methodId}`)
					}
					break
				}
				
				case ApiMessageType.SUBSCRIPTION_CANCEL: {
					const subscriptionId = reader.readInt()
					const success = this.context.outerSubscriptions.cancel(subscriptionId)
					if (!success) {
						throw new ProtocolBrokenException(`Calling an unknown subscription ${subscriptionId}`)
					}
					break
				}
				
				case ApiMessageType.INSTANCE_CLOSE: {
					const serviceId = reader.readInt()
					const success = this.context.innerInstanceServices.close(serviceId)
					if (!success) {
						throw new ProtocolBrokenException(`Sub service ${serviceId} is not exists`)
					}
					break
				}
			}
		})
	}
	
	handleConnectionClose() {
		this.context.logger.debug('Close')
		
		this.context.outerSubscriptions.cancelAll()
		this.context.innerSubscriptions.cancelAll()
		this.context.innerInstanceServices.closeAll()
		
		try {
			this.api.handleConnectionClose()
		}
		catch (e) {
			this.context.logger.error('Error on close', e)
		}
	}
	
	protected abstract findService(serviceId: number): InnerServiceDelegate<any> | null
}