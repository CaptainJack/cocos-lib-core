import {AbstractBiserReader} from './AbstractBiserReader'
import {InputByteBuffer} from '../io/InputByteBuffer'
import {BiserReadNegativeSizeException} from './_exceptions'
import {_byte, EMPTY_BYTE_ARRAY} from '../lang/_byte'
import {byte} from './_utils'

export class ByteBufferBiserReader extends AbstractBiserReader {
	
	constructor(public buffer: InputByteBuffer) {
		super()
	}
	
	readByte(): number {
		return byte(this.buffer.readByte())
	}
	
	readString(): string {
		const size = this.readInt()
		return this.readStringWithSize(size)
	}
	
	readStringNullable(): string | null {
		const size = this.readInt()
		return size == -1 ? null : this.readStringWithSize(size)
	}
	
	protected readByteArrayWithSize(size: number): Int8Array {
		if (size == 0) return EMPTY_BYTE_ARRAY
		if (size < 0) throw new BiserReadNegativeSizeException(size)
		return this.buffer.readArray(size)
	}
	
	protected readToMemory(size: number) {
		this.buffer.readToArray(this.memory, 0, size)
	}
	
	protected readStringWithSize(size: number): string {
		if (size == 0) return ''
		if (size < 0) throw new BiserReadNegativeSizeException(size)
		
		const view = this.buffer.arrayView
		if (view == null) {
			const bytes = this.buffer.readArray(size)
			return _byte.getSting(bytes, 0, size)
		}
		
		const value = _byte.getSting(view.array, view.readerIndex, size)
		this.buffer.skipRead(size)
		return value
	}
}