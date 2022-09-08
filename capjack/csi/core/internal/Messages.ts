import {ObjectPool} from '../../../tool/utils/pool/ObjectPool'
import {ByteBuffer} from '../../../tool/io/ByteBuffer'
import {LastIncomingMessageId} from './LastIncomingMessageId'
import {OutgoingMessageBuffer} from './OutgoingMessageBuffer'

export class Messages {
	readonly incoming: LastIncomingMessageId
	readonly outgoing: OutgoingMessageBuffer
	
	constructor(buffers: ObjectPool<ByteBuffer>) {
		this.incoming = new LastIncomingMessageId()
		this.outgoing = new OutgoingMessageBuffer(buffers)
	}
}

