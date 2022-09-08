import {BiserReader} from './BiserReader'
import {BiserReadException, BiserReadNegativeSizeException} from './_exceptions'
import {_hex} from '../lang/_hex'
import {Long} from '../lang/Long'
import {EMPTY_ARRAY} from '../lang/_arrays'
import {Decoder} from './Decoder'
import {Decoders} from './Decoders'
import {byte, double} from './_utils'

export abstract class AbstractBiserReader implements BiserReader {
	protected readonly memory = new Int8Array(8)
	
	abstract readByte(): number
	
	abstract readString(): string
	
	abstract readStringNullable(): string | null
	
	readBoolean(): boolean {
		const b = this.readByte()
		switch (b) {
			case 0x00:
				return false
			case 0x01:
				return true
			default:
				throw new BiserReadException(`Illegal boolean value (0x${_hex.byteToHexString(b)})`)
		}
	}
	
	readInt(): number {
		const b = this.readByte()
		
		if ((b & 0x80) == 0x00) {
			return b
		}
		if (b == 0xFF) {
			return -1
		}
		if ((b & 0xC0) == 0x80) {
			return (((b & 0x3F) << 8) | this.readByte()) + 128
		}
		if ((b & 0xE0) == 0xC0) {
			this.readToMemory(2)
			return (((b & 0x1F) << 16) | (this.m(0) << 8) | this.m(1)) + 16512
		}
		if ((b & 0xF0) == 0xE0) {
			this.readToMemory(3)
			return (((b & 0x0F) << 24) | (this.m(0) << 16) | (this.m(1) << 8) | this.m(2)) + 2113664
		}
		if ((b & 0xF8) == 0xF0) {
			this.readToMemory(3)
			return (((b & 0x07) << 24) | (this.m(0) << 16) | (this.m(1) << 8) | this.m(2)) + 270549120
		}
		if ((b & 0xFC) == 0xF8) {
			this.readToMemory(3)
			return (((b & 0x03) << 24) | (this.m(0) << 16) | (this.m(1) << 8) | this.m(2)) + 404766848
		}
		if ((b & 0xFE) == 0xFC) {
			this.readToMemory(3)
			return (((b & 0x01 | 0xFE) << 24) | (this.m(0) << 16) | (this.m(1) << 8) | this.m(2)) - 1
		}
		if (b == 0xFE) {
			return this.readIntRaw()
		}
		
		throw new BiserReadException(`Illegal int value (0x${_hex.byteToHexString(b)})`)
	}
	
	readLong(): Long {
		const b = this.readByte()
		
		if ((b & 0x80) == 0x00) {
			return Long.fromInt(b)
		}
		if (b == 0xFF) {
			return Long.NEG_ONE
		}
		if ((b & 0xC0) == 0x80) {
			return Long.fromInt((((b & 0x3F) << 8) | this.readByte()) + 128)
		}
		if ((b & 0xE0) == 0xC0) {
			this.readToMemory(2)
			return Long.fromInt((((b & 0x1F) << 16) | (this.m(0) << 8) | this.m(1)) + 16512)
		}
		if ((b & 0xF0) == 0xE0) {
			this.readToMemory(3)
			return Long.fromInt((((b & 0x0F) << 24) | (this.m(0) << 16) | (this.m(1) << 8) | this.m(2)) + 2113664)
		}
		if ((b & 0xF8) == 0xF0) {
			this.readToMemory(3)
			return Long.fromInt((((b & 0x07) << 24) | (this.m(0) << 16) | (this.m(1) << 8) | this.m(2)) + 270549120)
		}
		if ((b & 0xFC) == 0xF8) {
			this.readToMemory(3)
			return Long.fromInt((((b & 0x03) << 24) | (this.m(0) << 16) | (this.m(1) << 8) | this.m(2)) + 404766848)
		}
		if ((b & 0xFE) == 0xFC) {
			this.readToMemory(3)
			return Long.fromInt((((b & 0x01 | 0xFE) << 24) | (this.m(0) << 16) | (this.m(1) << 8) | this.m(2)) - 1)
		}
		if (b == 0xFE) {
			return this.readLongRaw()
		}
		
		throw new BiserReadException(`Illegal long value (0x${_hex.byteToHexString(b)})`)
	}
	
	readDouble(): number {
		this.readToMemory(8)
		return double.fromBytes(this.memory)
	}
	
	readBooleanArray(): boolean[] {
		return this.readBooleanArrayWithSize(this.readInt())
	}
	
	readByteArray(): Int8Array {
		return this.readByteArrayWithSize(this.readInt())
	}
	
	readIntArray(): number[] {
		return this.readIntArrayWithSize(this.readInt())
	}
	
	readLongArray(): Long[] {
		return this.readLongArrayWithSize(this.readInt())
	}
	
	readDoubleArray(): number[] {
		return this.readDoubleArrayWithSize(this.readInt())
	}
	
	readList<E>(decoder: Decoder<E>): E[] {
		const size = this.readInt()
		
		if (size == 0) return EMPTY_ARRAY
		
		// @ts-ignore
		if (decoder === Decoders.BOOLEAN) return this.readBooleanArrayWithSize(size)
		// @ts-ignore
		if (decoder === Decoders.BYTE) return this.readByteArrayWithSize(size)
		// @ts-ignore
		if (decoder === Decoders.INT) return this.readIntArrayWithSize(size)
		// @ts-ignore
		if (decoder === Decoders.LONG) return this.readLongArrayWithSize(size)
		// @ts-ignore
		if (decoder === Decoders.DOUBLE) return this.readDoubleArrayWithSize(size)
		
		if (size < 0) throw new BiserReadNegativeSizeException(size)
		
		const array = new Array(size)
		
		for (let i = 0; i < size; i++) {
			array[i] = decoder(this)
		}
		
		return array
	}
	
	readMap<K, V>(keyDecoder: Decoder<K>, valueDecoder: Decoder<V>): Map<K, V> {
		const size = this.readInt()
		
		if (size == 0)
			return new Map<K, V>()
		
		if (size < 0) throw new BiserReadNegativeSizeException(size)
		
		const map = new Map<K, V>()
		
		for (let i = 0; i < size; i++) {
			map.set(keyDecoder(this), valueDecoder(this))
		}
		
		return map
	}
	
	read<E>(decoder: Decoder<E>): E {
		return decoder(this)
	}
	
	protected m(index: number): number {
		return byte(this.memory[index])
	}
	
	protected abstract readToMemory(size: number)
	
	protected abstract readByteArrayWithSize(size: number): Int8Array
	
	private readBooleanArrayWithSize(size: number): boolean[] {
		if (size == 0) return EMPTY_ARRAY
		if (size < 0) throw new BiserReadNegativeSizeException(size)
		
		let bit = 7
		let byte = 0
		
		const array = new Array(size)
		
		for (let i = 0; i < size; i++) {
			if (++bit == 8) {
				bit = 0
				byte = this.readByte()
			}
			const m = 1 << bit
			array[i] = (byte & m) == m
		}
		
		return array
	}
	
	private readIntArrayWithSize(size: number): number[] {
		if (size == 0) return EMPTY_ARRAY
		if (size < 0) throw new BiserReadNegativeSizeException(size)
		
		const array = new Array(size)
		for (let i = 0; i < size; i++) {
			array[i] = this.readInt()
		}
		return array
	}
	
	private readLongArrayWithSize(size: number): Long[] {
		if (size == 0) return EMPTY_ARRAY
		if (size < 0) throw new BiserReadNegativeSizeException(size)
		
		const array = new Array(size)
		for (let i = 0; i < size; i++) {
			array[i] = this.readLong()
		}
		return array
	}
	
	private readDoubleArrayWithSize(size: number): number[] {
		if (size == 0) return EMPTY_ARRAY
		if (size < 0) throw new BiserReadNegativeSizeException(size)
		
		const bytes = this.readByteArrayWithSize(size * 8)
		const buffer = new Float64Array(bytes.buffer, 0)
		const array = new Array(size)
		
		for (let i = 0; i < size; i++) {
			array[i] = buffer[i]
		}
		
		return array
	}
	
	private readIntRaw() {
		this.readToMemory(4)
		return (this.m(0) << 24) | (this.m(1) << 16) | (this.m(2) << 8) | this.m(3)
	}
	
	private readLongRaw(): Long {
		this.readToMemory(8)
		
		const high = (this.m(0) << 24) | (this.m(1) << 16) | (this.m(2) << 8) | this.m(3)
		const low = (this.m(4) << 24) | (this.m(5) << 16) | (this.m(6) << 8) | this.m(7)
		
		return Long.fromBits(low, high)
	}
}

