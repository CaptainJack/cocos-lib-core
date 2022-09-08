import {ChannelGate} from '../../core/client/ChannelGate'
import {ChannelAcceptor} from '../../core/client/ChannelAcceptor'
import {Logging} from '../../../tool/logging/Logging'
import {WebSocketChannelProducer} from './WebSocketChannelProducer'

export class WebSocketChannelGate implements ChannelGate {
	private readonly logger = Logging.getLogger('capjack.csi.transport.client.WebSocketChannelGate')
	
	constructor(
		private readonly url: string
	) {}
	
	openChannel(acceptor: ChannelAcceptor): void {
		this.logger.info(`Connect to ${this.url}`)
		
		try {
			new WebSocketChannelProducer(acceptor, this.url)
		}
		catch (e) {
			this.logger.warn('WebSocket opening failed', e)
			acceptor.acceptFail()
		}
	}
}