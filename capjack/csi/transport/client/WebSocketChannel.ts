import {ChannelAcceptor} from '../../core/client/ChannelAcceptor'
import {Channel} from '../../core/Channel'
import {Logger} from '../../../tool/logging/Logger'
import {Logging} from '../../../tool/logging/Logging'
import {InputByteBuffer} from '../../../tool/io/InputByteBuffer'
import {ChannelHandler} from '../../core/ChannelHandler'
import {ArrayByteBuffer} from '../../../tool/io/ArrayByteBuffer'
import {EMPTY_BYTE_ARRAY} from '../../../tool/lang/_byte'
import {UnsupportedOperationException} from '../../../tool/lang/exceptions/UnsupportedOperationException'

export class WebSocketChannel implements Channel {
	private static nextId = 1
	private static readonly maxPacketSize = 0x4000
	
	readonly id = 'ws' + (WebSocketChannel.nextId++)
	
	private readonly logger: Logger = Logging.getLogger('capjack.csi.transport.client.WebSocketChannel')
	private readonly inputBuffer = new ArrayByteBuffer(0)
	private readonly handler: ChannelHandler
	private opened = true
	
	constructor(
		private readonly socket: WebSocket,
		acceptor: ChannelAcceptor
	) {
		this.socket.onmessage = this.handleEventMassage.bind(this)
		this.socket.onclose = this.handleEventClose.bind(this)
		this.socket.onerror = this.handleEventError.bind(this)
		
		this.handler = acceptor.acceptChannel(this)
	}
	
	close(): void {
		if (this.opened) {
			this.opened = false
			
			try {
				this.socket.onmessage = undefined
				this.socket.onclose = undefined
				this.socket.onerror = undefined
				
				let state = this.socket.readyState
				if (state == WebSocket.OPEN || state == WebSocket.CONNECTING) {
					this.socket.close()
				}
			}
			catch (e) {
				this.logger.warn('Error on close socket', e)
			}
		}
	}
	
	write(data: InputByteBuffer): void {
		if (this.opened) {
			try {
				let size = data.readableSize
				let arrayView = data.arrayView
				
				if (arrayView != null) {
					let index = arrayView.readerIndex
					let array = arrayView.array
					
					if (size > WebSocketChannel.maxPacketSize) {
						this.writePackets(array, index, index + size)
					}
					else {
						if (index == 0 && size == array.length) {
							this.socket.send(array)
						}
						else {
							this.socket.send(array.subarray(index, index + size))
						}
					}
					
					data.skipRead(size)
				}
				else {
					// noinspection ExceptionCaughtLocallyJS
					throw new UnsupportedOperationException('TODO')
				}
			}
			catch (e) {
				this.logger.error('Error on send massage', e)
				this.close()
				this.notifyClose()
			}
		}
		else {
			data.skipReadFully()
			this.logger.warn(`Skip write, because channel closed`)
		}
	}
	
	private writePackets(array: Int8Array, fromIndex: number, toIndex: number) {
		let offset = fromIndex
		do {
			let nextOffset = offset + WebSocketChannel.maxPacketSize
			if (nextOffset > toIndex) nextOffset = toIndex
			this.socket.send(array.subarray(offset, nextOffset))
			offset = nextOffset
		}
		while (offset < toIndex)
	}
	
	private handleEventMassage(event: MessageEvent) {
		try {
			this.inputBuffer.array = new Int8Array(event.data)
			this.handler.handleChannelInput(this.inputBuffer)
		}
		catch (e) {
			this.logger.error('Error on read massage', e)
			this.close()
			this.notifyClose()
		}
		finally {
			this.inputBuffer.array = EMPTY_BYTE_ARRAY
		}
	}
	
	private handleEventClose() {
		this.close()
		this.notifyClose()
	}
	
	private handleEventError() {
		this.logger.error(`Received WebSocket error`)
		this.close()
		this.notifyClose()
	}
	
	private notifyClose() {
		try {
			this.handler.handleChannelClose()
		}
		catch (e) {
			this.logger.warn('Error on handle channel close', e)
		}
	}
}