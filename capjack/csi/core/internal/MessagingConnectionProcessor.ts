import {BaseConnectionHandler} from '../BaseConnectionHandler'
import {InternalConnectionProcessor} from './InternalConnectionProcessor'
import {Messages} from './Messages'
import {Logger} from '../../../tool/logging/Logger'
import {SubInputByteBuffer} from '../../../tool/io/SubInputByteBuffer'
import {InternalConnection} from './InternalConnection'
import {Channel} from '../Channel'
import {UnsupportedOperationException} from '../../../tool/lang/exceptions/UnsupportedOperationException'
import {InputByteBuffer} from '../../../tool/io/InputByteBuffer'
import {ProtocolMarker} from './ProtocolMarker'
import {ProtocolBrokenException} from '../ProtocolBrokenException'
import {formatLoggerMessageBytesBuffer} from './_logging_csi_core'
import {Exception} from '../../../tool/lang/exceptions/Exception'
import {InternalChannel} from './InternalChannel'

// noinspection JSUnusedLocalSymbols
export abstract class MessagingConnectionProcessor<H extends BaseConnectionHandler> implements InternalConnectionProcessor {
	
	private inputState = InputState.MARKER
	private inputMessageId = 0
	private readonly inputMessageBuffer = new SubInputByteBuffer()
	
	protected constructor(
		private _handler: H,
		private readonly  messages: Messages,
		protected readonly logger: Logger
	) {}
	
	protected get handler(): H {
		return this._handler
	}
	
	protected get lastIncomingMessageId(): number {
		return this.messages.incoming.id
	}
	
	processConnectionAccept(channel: InternalChannel, connection: InternalConnection): InternalConnectionProcessor {
		throw new UnsupportedOperationException()
	}
	
	processConnectionRecovery(channel: InternalChannel): InternalConnectionProcessor {
		this.inputState = InputState.MARKER
		this.inputMessageId = 0
		return this.doProcessConnectionRecovery(channel)
	}
	
	processConnectionClose() {
		this._handler.handleConnectionClose()
		this._handler = this.doProcessConnectionClose()
	}
	
	processChannelInput(channel: InternalChannel, buffer: InputByteBuffer): boolean {
		switch (this.inputState) {
			case InputState.MARKER:
				let marker = buffer.readByte()
				if (this.logger.traceEnabled) this.logger.trace(`Process marker ${ProtocolMarker.toString(marker)}`)
				return this.processChannelInputMarker(channel, buffer, marker)
			case InputState.MESSAGE_ID:
				return this.processChannelInputMessageId(buffer)
			case InputState.MESSAGE_BODY:
				return this.processChannelInputMessageBody(buffer)
			case InputState.MESSAGE_RECEIVED:
				return this.processChannelInputMessageReceived(buffer)
		}
	}
	
	abstract processChannelInterrupt(connection: InternalConnection): InternalConnectionProcessor
	
	protected abstract doProcessConnectionRecovery(channel: InternalChannel): InternalConnectionProcessor
	
	protected abstract doProcessConnectionClose(): H
	
	protected processChannelInputMarker(channel: Channel, buffer: InputByteBuffer, marker: number): boolean {
		switch (marker) {
			case ProtocolMarker.MESSAGING_NEW:
				this.inputState = InputState.MESSAGE_ID
				return this.processChannelInputMessageId(buffer)
			
			case ProtocolMarker.MESSAGING_RECEIVED:
				this.inputState = InputState.MESSAGE_RECEIVED
				return this.processChannelInputMessageReceived(buffer)
			
			case ProtocolMarker.CLOSE_DEFINITELY:
				channel.close()
				return false
			
			case ProtocolMarker.CLOSE_ACTIVITY_TIMEOUT:
			case ProtocolMarker.CLOSE_ERROR:
			case ProtocolMarker.CLOSE_PROTOCOL_BROKEN:
				this.logger.error(`Closing because of the received marker ${ProtocolMarker.toString(marker)}`)
				channel.close()
				return false
			
			default:
				throw new ProtocolBrokenException(`Unknown marker ${ProtocolMarker.toString(marker)}`)
		}
		
	}
	
	private processChannelInputMessageId(buffer: InputByteBuffer): boolean {
		if (buffer.isReadable(4)) {
			this.inputMessageId = buffer.readInt()
			this.inputState = InputState.MESSAGE_BODY
			return this.processChannelInputMessageBody(buffer)
		}
		return false
	}
	
	private processChannelInputMessageBody(buffer: InputByteBuffer): boolean {
		if (buffer.isReadable(4)) {
			let size = buffer.readInt()
			
			if (buffer.isReadable(size)) {
				this.messages.incoming.update(this.inputMessageId)
				
				this.inputState = InputState.MARKER
				this.inputMessageBuffer.bindSource(buffer, size)
				
				if (this.logger.traceEnabled) this.logger.trace(formatLoggerMessageBytesBuffer(`Receive message id ${this.inputMessageId}`, this.inputMessageBuffer))
				
				try {
					this.handler.handleConnectionMessage(this.inputMessageBuffer)
					if (this.inputMessageBuffer.readable) {
						throw new Exception('Message must be read in full')
					}
				}
				finally {
					this.inputMessageBuffer.unbindSource()
				}
				
				return true
			}
			else {
				buffer.backRead(4)
				if (this.logger.traceEnabled) this.logger.trace(`Wait message id ${this.inputMessageId} body`)
			}
		}
		else {
			if (this.logger.traceEnabled) this.logger.trace(`Wait message id ${this.inputMessageId} body size`)
		}
		return false
	}
	
	private processChannelInputMessageReceived(buffer: InputByteBuffer): boolean {
		if (buffer.isReadable(4)) {
			let messageId = buffer.readInt()
			if (this.logger.traceEnabled) this.logger.trace(`Outgoing message ${messageId} is delivered`)
			this.inputState = InputState.MARKER
			this.messages.outgoing.clearTo(messageId)
			
			return true
		}
		return false
	}
}

enum InputState {
	MARKER,
	MESSAGE_ID,
	MESSAGE_BODY,
	MESSAGE_RECEIVED
}