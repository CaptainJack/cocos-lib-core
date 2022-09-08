import {InputByteBuffer, InputByteBufferArrayView} from './InputByteBuffer'
import {DummyByteBuffer} from './DummyByteBuffer'
import {BufferUnderflowException} from './BufferUnderflowException'
import {OutputByteBuffer} from './OutputByteBuffer'

export class SubInputByteBuffer implements InputByteBuffer, InputByteBufferArrayView {
	private source: InputByteBuffer = DummyByteBuffer.INSTANCE
	private size = 0
	private _readerIndex = 0
	
	get readable() {
		return this.readableSize > 0
	}
	
	get readableSize() {
		return this.size - this._readerIndex
	}
	
	get arrayView() {
		return this
	}
	
	get array() {
		return this.source.arrayView.array
	}
	
	get readerIndex() {
		return this.source.arrayView.readerIndex
	}
	
	bindSource(source: InputByteBuffer, size: number) {
		if (source.isReadable(size)) {
			this.source = source
			this.size = size
			this._readerIndex = 0
		}
		else {
			throw BufferUnderflowException.createNoRead(size, source.readableSize)
		}
	}
	
	commitRead(size: number) {
		this.skipRead(size)
	}
	
	unbindSource() {
		this.source = DummyByteBuffer.INSTANCE
		this.size = 0
		this._readerIndex = 0
	}
	
	isReadable(size: number) {
		return this.readableSize >= size
	}
	
	readByte() {
		this.checkRead(1)
		const r = this.source.readByte()
		this.completeRead(1)
		return r
	}
	
	readInt() {
		this.checkRead(4)
		const r = this.source.readInt()
		this.completeRead(4)
		return r
	}
	
	readLong() {
		this.checkRead(8)
		const r = this.source.readLong()
		this.completeRead(8)
		return r
	}
	
	readToArray(target: Int8Array, offset: number, size: number) {
		this.checkRead(size)
		this.source.readToArray(target, offset, size)
		this.completeRead(size)
	}
	
	readToBuffer(target: OutputByteBuffer, size: number) {
		this.checkRead(size)
		this.source.readToBuffer(target, size)
		this.completeRead(size)
	}
	
	readArray(size: number): Int8Array {
		let array = new Int8Array(size)
		this.readToArray(array, 0, size)
		return array
	}
	
	readArrayFully(): Int8Array {
		return this.readArray(this.readableSize)
	}
	
	skipRead(size: number) {
		this.checkRead(size)
		this.source.skipRead(size)
		this.completeRead(size)
	}
	
	skipReadFully(): void {
		this.skipRead(this.readableSize)
	}
	
	backRead(size: number) {
		if (size < 0) {
			throw BufferUnderflowException.createNegativeBack(size)
		}
		if (size > this._readerIndex) {
			throw BufferUnderflowException.createNoReadBack(size, this._readerIndex)
		}
		this._readerIndex -= size
	}
	
	private checkRead(size: number) {
		if (size < 0) {
			throw BufferUnderflowException.createNegative(size)
		}
		if (size > this.readableSize) {
			throw BufferUnderflowException.createNoRead(size, this.readableSize)
		}
	}
	
	private completeRead(v: number) {
		this._readerIndex += v
	}
}