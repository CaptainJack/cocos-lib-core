import {Logger} from '../../../tool/logging/Logger'
import {InternalChannel} from './InternalChannel'
import {Connection} from '../Connection'
import {Messages} from './Messages'
import {InternalChannelProcessor} from './InternalChannelProcessor'

export interface InternalConnection extends Connection, InternalChannelProcessor {
	readonly logger: Logger
	readonly messages: Messages
	
	accept()
	
	recovery(channel: InternalChannel, lastSentMessageId: number)
	
	closeWithMarker(marker: number)
}