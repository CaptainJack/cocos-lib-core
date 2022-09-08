import {ByteBuffer} from '../../tool/io/ByteBuffer'
import {OutputApiMessage} from './OutputApiMessage'
import {ByteBufferBiserWriter} from '../../tool/biser/ByteBufferBiserWriter'
import {DummyByteBuffer} from '../../tool/io/DummyByteBuffer'

export class OutputApiMessageImpl implements OutputApiMessage {
	readonly writer: ByteBufferBiserWriter
	
	constructor(public buffer: ByteBuffer) {
		this.writer = new ByteBufferBiserWriter(buffer)
	}
	
	dispose() {
		this.buffer = DummyByteBuffer.INSTANCE
		this.writer.buffer = DummyByteBuffer.INSTANCE
	}
}