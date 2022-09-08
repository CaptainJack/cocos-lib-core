import {ChannelAcceptor} from '../../core/client/ChannelAcceptor'
import {IllegalStateException} from '../../../tool/lang/exceptions/IllegalStateException'
import {Logging} from '../../../tool/logging/Logging'
import {Logger} from '../../../tool/logging/Logger'
import {WebSocketChannel} from './WebSocketChannel'

export class WebSocketChannelProducer {
	private readonly logger: Logger = Logging.getLogger('capjack.csi.transport.client.WebSocketChannelProducer')
	private readonly socket: WebSocket
	
	constructor(
		private readonly acceptor: ChannelAcceptor,
		url: string
	) {
		this.socket = new WebSocket(url)
		this.socket.binaryType = 'arraybuffer'
		
		let h = this.handleEvent.bind(this)
		this.socket.onopen = h
		this.socket.onclose = h
		this.socket.onerror = h
	}
	
	private handleEvent(event: Event): void {
		try {
			this.socket.onopen = undefined
			this.socket.onclose = undefined
			this.socket.onerror = undefined
			
			switch (event.type) {
				case 'open':
					this.handleEventOpen()
					break
				case 'close':
					this.handleEventClose()
					break
				case 'error':
					this.handleEventError()
					break
				default:
					// noinspection ExceptionCaughtLocallyJS
					throw new IllegalStateException(`Unexpected event type '${event.type}'`)
			}
		}
		catch (e) {
			this.logger.error('Error on handle WebSocket event', e)
			this.acceptor.acceptFail()
		}
	}
	
	private handleEventOpen() {
		new WebSocketChannel(this.socket, this.acceptor)
	}
	
	private handleEventClose() {
		this.logger.warn('WebSocket closed on opening')
		this.acceptor.acceptFail()
	}
	
	private handleEventError() {
		this.logger.warn(`WebSocket error on opening`)
		this.acceptor.acceptFail()
	}
}