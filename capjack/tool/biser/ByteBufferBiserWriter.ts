import {AbstractBiserWriter} from './AbstractBiserWriter'
import {OutputByteBuffer} from '../io/OutputByteBuffer'
import {Long} from '../lang/Long'
import {_byte} from '../lang/_byte'
import {_string} from '../lang/_string'

export class ByteBufferBiserWriter extends AbstractBiserWriter {
	
	constructor(public buffer: OutputByteBuffer) {
		super()
	}
	
	writeByte(value: number) {
		this.buffer.writeByte(value)
	}
	
	writeByteArray(value: Int8Array) {
		this.buffer.ensureWrite(1 + value.length)
		super.writeByteArray(value)
	}
	
	writeIntArray(value: number[]) {
		this.buffer.ensureWrite(1 + value.length)
		super.writeIntArray(value)
	}
	
	writeLongArray(value: Long[]) {
		this.buffer.ensureWrite(1 + value.length)
		super.writeLongArray(value)
	}
	
	writeDoubleArray(value: number[]) {
		this.buffer.ensureWrite(1 + value.length + 8)
		super.writeDoubleArray(value)
	}
	
	writeString(value: string) {
		if (value.length == 0) {
			this.writeInt(0)
		}
		else {
			const view = this.buffer.arrayView
			if (view == null) {
				this.writeByteArray(_string.encodeUtf8(value))
			}
			else {
				this.buffer.ensureWrite(value.length * 4 + 5)
				
				const array = view.array
				const index = view.writerIndex
				const size = _byte.putSting(array, index, value)
				let shift
				if (size < 128) shift = 1
				else if (size < 16512) shift = 2
				else if (size < 2113664) shift = 3
				else if (size < 471875712) shift = 4
				else shift = 5
				
				array.copyWithin(index + shift, index, index + size)
				
				this.writeInt(size)
				this.buffer.skipWrite(size)
			}
		}
	}
	
	writeStringNullable(value: string | null) {
		if (value == null) {
			this.writeInt(-1)
		}
		else {
			this.writeString(value)
		}
	}
	
	protected writeByteArrayRaw(array: Int8Array, size: number) {
		this.buffer.writeArray(array, 0, size)
	}
}