import {InternalChannelProcessor} from './InternalChannelProcessor'
import {InternalChannel} from './InternalChannel'
import {InputByteBuffer} from '../../../tool/io/InputByteBuffer'
import {ChannelInputProcess} from './ChannelInputProcess'
import {UnsupportedOperationException} from '../../../tool/lang/exceptions/UnsupportedOperationException'

// noinspection JSUnusedLocalSymbols
export class NothingChannelProcessor implements InternalChannelProcessor {
	processChannelClose(channel: InternalChannel, interrupted: Boolean) {
		throw new UnsupportedOperationException()
	}
	
	processChannelInput(channel: InternalChannel, buffer: InputByteBuffer): ChannelInputProcess {
		throw new UnsupportedOperationException()
	}
}