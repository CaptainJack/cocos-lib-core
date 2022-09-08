import {ByteBuffer} from './ByteBuffer'
import {_byte, EMPTY_BYTE_ARRAY} from '../lang/_byte'
import {InputByteBuffer, InputByteBufferArrayView} from './InputByteBuffer'
import {OutputByteBuffer, OutputByteBufferArrayView} from './OutputByteBuffer'
import {BufferUnderflowException} from './BufferUnderflowException'
import {Long} from '../lang/Long'
import {INT_MAX_VALUE} from '../lang/_number'
import {BufferOverflowException} from './BufferOverflowException'

export class ArrayByteBuffer implements ByteBuffer, InputByteBufferArrayView, OutputByteBufferArrayView {
	
	private _array: Int8Array
	private _readerIndex: number = 0
	private _writerIndex: number = 0
	
	constructor(initialCapacity: number = 10) {
		this._array = initialCapacity == 0 ? EMPTY_BYTE_ARRAY : new Int8Array(initialCapacity)
	}
	
	get readerIndex(): number {
		return this._readerIndex
	}
	
	get writerIndex(): number {
		return this._writerIndex
	}
	
	get readable(): boolean {
		return this._readerIndex < this._writerIndex
	}
	
	get readableSize(): number {
		return this._writerIndex - this._readerIndex
	}
	
	get arrayView(): (InputByteBufferArrayView & OutputByteBufferArrayView) | null {
		return this
	}
	
	get array(): Int8Array {
		return this._array
	}
	
	set array(value: Int8Array) {
		this.clear()
		this._array = value
		this._writerIndex = this._array.length
	}
	
	clear(): void {
		this._readerIndex = 0
		this._writerIndex = 0
	}
	
	flush(): void {
		if (this._readerIndex > 0) {
			if (this._readerIndex < this._writerIndex) {
				this._array.set(this._array.subarray(this._readerIndex, this._writerIndex))
				this._writerIndex -= this._readerIndex
				this._readerIndex = 0
			}
			else if (this._readerIndex == this._writerIndex) {
				this.clear()
			}
		}
	}
	
	isReadable(size: number): boolean {
		return this.readableSize >= size
	}
	
	readByte(): number {
		this.checkRead(1)
		let v = this._array[this._readerIndex]
		this.completeRead(1)
		return v
	}
	
	readInt(): number {
		this.checkRead(4)
		let v = _byte.getInt(this._array, this._readerIndex)
		this.completeRead(4)
		return v
	}
	
	readLong(): Long {
		this.checkRead(8)
		let v = _byte.getLong(this._array, this._readerIndex)
		this.completeRead(8)
		return v
	}
	
	readToArray(target: Int8Array, offset: number, size: number): void {
		if (size != 0) {
			this.checkRead(size)
			target.set(this._array.subarray(this._readerIndex, this._readerIndex + size), offset)
			this.completeRead(size)
		}
	}
	
	readToBuffer(target: OutputByteBuffer, size: number): void {
		if (size != 0) {
			this.checkRead(size)
			target.writeArray(this._array, this._readerIndex, size)
			this.completeRead(size)
		}
	}
	
	readArray(size: number): Int8Array {
		if (size == 0) {
			return EMPTY_BYTE_ARRAY
		}
		else {
			let v = new Int8Array(size)
			this.readToArray(v, 0, size)
			return v
		}
	}
	
	readArrayFully(): Int8Array {
		return this.readArray(this.readableSize)
	}
	
	skipRead(size: number): void {
		if (size != 0) {
			this.checkRead(size)
			this.completeRead(size)
		}
	}
	
	skipReadFully(): void {
		this.skipRead(this.readableSize)
	}
	
	backRead(size: number): void {
		if (size < 0) {
			throw BufferUnderflowException.createNegativeBack(size)
		}
		if (size > this._readerIndex) {
			throw BufferUnderflowException.createNoReadBack(size, this._readerIndex)
		}
		this._readerIndex -= size
	}
	
	writeByte(value: number): void {
		this.ensureWrite(1)
		this._array[this._writerIndex] = value
		this.completeWrite(1)
	}
	
	writeInt(value: number): void {
		this.ensureWrite(4)
		_byte.putInt(this._array, this._writerIndex, value)
		this.completeWrite(4)
	}
	
	writeLong(value: Long): void {
		this.ensureWrite(8)
		_byte.putLong(this._array, this._writerIndex, value)
		this.completeWrite(8)
	}
	
	writeArray(value: Int8Array, offset: number, size: number): void {
		if (size != 0) {
			this.ensureWrite(size)
			if (offset == 0 && size == value.length) {
				this._array.set(value, this._writerIndex)
			}
			else {
				this._array.set(value.subarray(offset, offset + size), this._writerIndex)
			}
			this.completeWrite(size)
		}
	}
	
	writeArrayFully(value: Int8Array): void {
		this.writeArray(value, 0, value.length)
	}
	
	writeBuffer(value: InputByteBuffer): void {
		let size = value.readableSize
		if (size != 0) {
			this.ensureWrite(size)
			value.readToArray(this._array, this._writerIndex, size)
			this.completeWrite(size)
		}
	}
	
	skipWrite(size: number): void {
		if (size != 0) {
			this.ensureWrite(size)
			this.completeWrite(size)
		}
	}
	
	ensureWrite(size: number) {
		if (size == 0) {
			return
		}
		if (size < 0) {
			throw new BufferUnderflowException(`Writing size is negative (${size})`)
		}
		if (this._readerIndex == this._writerIndex && this._readerIndex != 0) {
			this.clear()
		}
		
		let minCapacity = this._writerIndex + size
		let oldCapacity = this._array.length
		
		if (minCapacity > oldCapacity) {
			
			if (minCapacity > INT_MAX_VALUE) {
				throw new BufferOverflowException(`Buffer capacity overflow (current: ${oldCapacity}, additional: ${size}, required: ${minCapacity}, max: ${INT_MAX_VALUE})`)
			}
			
			let newCapacity = oldCapacity + (oldCapacity >> 1)
			if (newCapacity < minCapacity || newCapacity > INT_MAX_VALUE) {
				newCapacity = minCapacity
			}
			let arr = this._array
			
			this._array = new Int8Array(newCapacity)
			this._array.set(arr)
		}
	}
	
	private checkRead(size: number) {
		if (size < 0) {
			throw BufferUnderflowException.createNegative(size)
		}
		if (size > this.readableSize) {
			throw BufferUnderflowException.createNoRead(size, this.readableSize)
		}
	}
	
	private completeRead(size: number) {
		this._readerIndex += size
	}
	
	private completeWrite(size: number) {
		this._writerIndex += size
	}
}