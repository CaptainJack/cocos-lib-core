import {ObjectPool} from '../../../tool/utils/pool/ObjectPool'
import {ByteBuffer} from '../../../tool/io/ByteBuffer'
import {UnsupportedOperationException} from '../../../tool/lang/exceptions/UnsupportedOperationException'

// noinspection JSUnusedLocalSymbols
export class NothingByteBufferPool implements ObjectPool<ByteBuffer> {
	back(instance: ByteBuffer) {
		throw new UnsupportedOperationException()
	}
	
	clear(): void {
		throw new UnsupportedOperationException()
	}
	
	take(): ByteBuffer {
		throw new UnsupportedOperationException()
	}
}