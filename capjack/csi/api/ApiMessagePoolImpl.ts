import {ObjectPool} from '../../tool/utils/pool/ObjectPool'
import {ByteBufferBiserReader} from '../../tool/biser/ByteBufferBiserReader'
import {OutputApiMessage} from './OutputApiMessage'
import {ApiMessagePool} from './ApiMessagePool'
import {ByteBuffer} from '../../tool/io/ByteBuffer'
import {ArrayAllocatorObjectPool} from '../../tool/utils/pool/ArrayAllocatorObjectPool'
import {ObjectAllocator} from '../../tool/utils/pool/ObjectAllocator'
import {DummyByteBuffer} from '../../tool/io/DummyByteBuffer'
import {OutputApiMessageImpl} from './OutputApiMessageImpl'

export class ApiMessagePoolImpl implements ApiMessagePool {
	readonly readers: ObjectPool<ByteBufferBiserReader>
	readonly writers: ObjectPool<OutputApiMessage>
	
	constructor(byteBuffers: ObjectPool<ByteBuffer>) {
		this.readers = new ArrayAllocatorObjectPool(64, new ReaderAllocator())
		this.writers = new ArrayAllocatorObjectPool(64, new WriterAllocator(byteBuffers))
	}
}

class ReaderAllocator implements ObjectAllocator<ByteBufferBiserReader> {
	produceInstance(): ByteBufferBiserReader {
		return new ByteBufferBiserReader(DummyByteBuffer.INSTANCE)
	}
	
	clearInstance(instance: ByteBufferBiserReader): void {
		instance.buffer = DummyByteBuffer.INSTANCE
	}
	
	disposeInstance(instance: ByteBufferBiserReader): void {
		this.clearInstance(instance)
	}
	
}

class WriterAllocator implements ObjectAllocator<OutputApiMessage> {
	constructor(private buffers: ObjectPool<ByteBuffer>) {}
	
	produceInstance(): OutputApiMessage {
		return new OutputApiMessageImpl(this.buffers.take())
	}
	
	clearInstance(instance: OutputApiMessage): void {
		instance.buffer.clear()
	}
	
	disposeInstance(instance: OutputApiMessage): void {
		const buffer = instance.buffer
		instance.dispose()
		this.buffers.back(buffer)
	}
}
