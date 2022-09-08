import {ByteBuffer} from './ByteBuffer'
import {InputByteBuffer, InputByteBufferArrayView} from './InputByteBuffer'
import {EMPTY_BYTE_ARRAY} from '../lang/_byte'
import {Long} from '../lang/Long'
import {OutputByteBuffer, OutputByteBufferArrayView} from './OutputByteBuffer'
import {BufferUnderflowException} from './BufferUnderflowException'

// noinspection JSUnusedLocalSymbols
export class DummyByteBuffer implements ByteBuffer, InputByteBufferArrayView, OutputByteBufferArrayView {
	static readonly INSTANCE = new DummyByteBuffer()
	
	get readable() {
		return false
	}
	
	get readableSize() {
		return 0
	}
	
	get readerIndex() {
		return 0
	}
	
	get writerIndex() {
		return 0
	}
	
	get arrayView(): (InputByteBufferArrayView & OutputByteBufferArrayView) | null {
		return this
	}
	
	get array() {
		return EMPTY_BYTE_ARRAY
	}
	
	isReadable(size: number): boolean {
		return false
	}
	
	readByte(): number {
		throw BufferUnderflowException.createNoRead(1, 0)
	}
	
	readInt(): number {
		throw BufferUnderflowException.createNoRead(4, 0)
	}
	
	readLong(): Long {
		throw BufferUnderflowException.createNoRead(8, 0)
	}
	
	readToArray(target: Int8Array, offset: number, size: number) {
		if (size != 0) throw BufferUnderflowException.createNoRead(size, 0)
	}
	
	readToBuffer(target: OutputByteBuffer, size: number) {
		if (size != 0) throw BufferUnderflowException.createNoRead(size, 0)
	}
	
	readArray(size: number): Int8Array {
		if (size != 0) throw BufferUnderflowException.createNoRead(size, 0)
		return EMPTY_BYTE_ARRAY
	}
	
	readArrayFully(): Int8Array {
		return EMPTY_BYTE_ARRAY
	}
	
	skipRead(size: number) {
		if (size != 0) throw BufferUnderflowException.createNoRead(size, 0)
	}
	
	backRead(size: number) {
		if (size != 0) throw BufferUnderflowException.createNoReadBack(size, 0)
	}
	
	commitRead(size: number) {}
	
	skipReadFully() {}
	
	skipWrite(size: number) {}
	
	writeArray(value: Int8Array, offset: number, size: number) {}
	
	writeArrayFully(value: Int8Array) {}
	
	writeBuffer(value: InputByteBuffer) {}
	
	writeByte(value: number) {}
	
	writeInt(value: number) {}
	
	writeLong(value: Long) {}
	
	ensureWrite(size: number) {}
	
	commitWrite(size: number) {}
	
	clear() {}
	
	flush() {}
}