import {Long} from '../lang/Long'
import {InputByteBuffer} from './InputByteBuffer'

export interface OutputByteBuffer {
	readonly arrayView: OutputByteBufferArrayView | null
	
	writeByte(value: number): void
	
	writeInt(value: number): void
	
	writeLong(value: Long): void
	
	writeArray(value: Int8Array, offset: number, size: number): void
	
	writeArrayFully(value: Int8Array): void
	
	writeBuffer(value: InputByteBuffer): void
	
	ensureWrite(size: number): void
	
	skipWrite(size: number): void
}

export interface OutputByteBufferArrayView {
	readonly array: Int8Array
	readonly writerIndex: number
}