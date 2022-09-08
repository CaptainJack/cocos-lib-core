import {InternalChannelProcessor} from '../../internal/InternalChannelProcessor'
import {InternalConnection} from '../../internal/InternalConnection'
import {InternalChannel} from '../../internal/InternalChannel'
import {ChannelInputProcess, ChannelInputProcessSwitch} from '../../internal/ChannelInputProcess'
import {InputByteBuffer} from '../../../../tool/io/InputByteBuffer'
import {ProtocolMarker} from '../../internal/ProtocolMarker'

// noinspection JSUnusedLocalSymbols
export class RecoveryChannelProcessor implements InternalChannelProcessor {
	constructor(
		private readonly connection: InternalConnection
	) {}
	
	processChannelInput(channel: InternalChannel, buffer: InputByteBuffer): ChannelInputProcess {
		if (buffer.readByte() == ProtocolMarker.RECOVERY) {
			if (buffer.isReadable(4)) {
				
				let messageId = buffer.readInt()
				this.connection.recovery(channel, messageId)
				
				return new ChannelInputProcessSwitch(this.connection)
			}
		}
		else {
			channel.close()
		}
		
		return ChannelInputProcess.BREAK
	}
	
	processChannelClose(channel: InternalChannel, interrupted: Boolean) {
		this.connection.close()
	}
}