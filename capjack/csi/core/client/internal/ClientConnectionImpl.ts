import {InternalConnectionImpl} from '../../internal/InternalConnectionImpl'
import {InternalChannel} from '../../internal/InternalChannel'
import {Long} from '../../../../tool/lang/Long'
import {InternalConnectionProcessor} from '../../internal/InternalConnectionProcessor'
import {TemporalAssistant} from '../../../../tool/utils/assistant/TemporalAssistant'
import {ObjectPool} from '../../../../tool/utils/pool/ObjectPool'
import {ByteBuffer} from '../../../../tool/io/ByteBuffer'
import {_hex} from '../../../../tool/lang/_hex'

export class ClientConnectionImpl extends InternalConnectionImpl {
	constructor(
		id: Long,
		channel: InternalChannel,
		processor: InternalConnectionProcessor,
		assistant: TemporalAssistant,
		buffers: ObjectPool<ByteBuffer>
	) {
		super(id, channel, processor, assistant, buffers, _hex.longToHexString(id))
	}
	
}