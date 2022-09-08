import {BiserWriter} from './BiserWriter'
import {Long} from '../lang/Long'
import {Encoder} from './Encoder'
import {byte, double} from './_utils'
import {Encoders} from './Encoders'

// noinspection DuplicatedCode
export abstract class AbstractBiserWriter implements BiserWriter {
	private static readonly longAsIntLeft = Long.fromInt(-33554433)
	private static readonly longAsIntRight = Long.fromInt(471875712)
	
	private readonly memory = new Int8Array(9)
	
	abstract writeByte(value: number)
	
	abstract writeString(value: string)
	
	abstract writeStringNullable(value: string | null)
	
	writeBoolean(value: boolean) {
		this.writeByte(value ? 0x01 : 0x00)
	}
	
	writeInt(value: number) {
		if (value >= 0) {
			if (value < 128) {
				this.writeByte(value)
			}
			else if (value < 16512) {
				const v = value - 128
				this.memory[0] = byte(v >>> 8 | 0x80)
				this.memory[1] = byte(v)
				this.writeByteArrayRaw(this.memory, 2)
			}
			else if (value < 2113664) {
				const v = value - 16512
				this.memory[0] = byte(v >>> 16 | 0xC0)
				this.memory[1] = byte(v >>> 8)
				this.memory[2] = byte(v)
				this.writeByteArrayRaw(this.memory, 3)
			}
			else if (value < 270549120) {
				const v = value - 2113664
				this.memory[0] = byte(v >>> 24 | 0xE0)
				this.memory[1] = byte(v >>> 16)
				this.memory[2] = byte(v >>> 8)
				this.memory[3] = byte(v)
				this.writeByteArrayRaw(this.memory, 4)
			}
			else if (value < 404766848) {
				const v = value - 270549120
				this.memory[0] = byte(v >>> 24 | 0xF0)
				this.memory[1] = byte(v >>> 16)
				this.memory[2] = byte(v >>> 8)
				this.memory[3] = byte(v)
				this.writeByteArrayRaw(this.memory, 4)
			}
			else if (value < 471875712) {
				const v = value - 404766848
				this.memory[0] = byte(v >>> 24 | 0xF8)
				this.memory[1] = byte(v >>> 16)
				this.memory[2] = byte(v >>> 8)
				this.memory[3] = byte(v)
				this.writeByteArrayRaw(this.memory, 4)
			}
			else {
				this.memory[0] = 0xFE
				this.memory[1] = byte(value >>> 24)
				this.memory[2] = byte(value >>> 16)
				this.memory[3] = byte(value >>> 8)
				this.memory[4] = byte(value)
				this.writeByteArrayRaw(this.memory, 5)
			}
		}
		else if (value == -1) {
			this.writeByte(0xFF)
		}
		else if (value >= -33554433) {
			let v = value + 1 & 0x1FFFFFF
			this.memory[0] = byte(v >>> 24 | 0xFC)
			this.memory[1] = byte(v >>> 16)
			this.memory[2] = byte(v >>> 8)
			this.memory[3] = byte(v)
			this.writeByteArrayRaw(this.memory, 4)
		}
		else {
			this.memory[0] = 0xFE
			this.memory[1] = byte(value >>> 24)
			this.memory[2] = byte(value >>> 16)
			this.memory[3] = byte(value >>> 8)
			this.memory[4] = byte(value)
			this.writeByteArrayRaw(this.memory, 5)
		}
	}
	
	writeLong(value: Long) {
		if (value.greatOrEqual(AbstractBiserWriter.longAsIntLeft) && value.less(AbstractBiserWriter.longAsIntRight)) {
			this.writeInt(value.toInt())
		}
		else {
			this.memory[0] = 0xFE
			this.memory[1] = byte(value.highBits >>> 24)
			this.memory[2] = byte(value.highBits >>> 16)
			this.memory[3] = byte(value.highBits >>> 8)
			this.memory[4] = byte(value.highBits)
			this.memory[5] = byte(value.lowBits >>> 24)
			this.memory[6] = byte(value.lowBits >>> 16)
			this.memory[7] = byte(value.lowBits >>> 8)
			this.memory[8] = byte(value.lowBits)
			this.writeByteArrayRaw(this.memory, 9)
		}
	}
	
	writeDouble(value: number) {
		double.toBytes(value, this.memory)
		this.writeByteArrayRaw(this.memory, 8)
	}
	
	writeBooleanArray(value: boolean[]) {
		let size = value.length
		this.writeInt(size)
		if (size != 0) {
			size /= 8
			if (value.length % 8 != 0) {
				size += 1
			}
			
			const bytes = size <= this.memory.length ? this.memory : new Int8Array(size)
			let byte = 0
			let bit = 0
			let i = 0
			
			for (const v of value) {
				if (v) {
					byte |= 1 << bit
				}
				if (++bit == 8) {
					bytes[i++] = byte
					bit = 0
					byte = 0
				}
			}
			
			if (bit != 0) {
				bytes[i] = byte
			}
			
			this.writeByteArrayRaw(bytes, size)
		}
	}
	
	writeByteArray(value: Int8Array) {
		this.writeInt(value.length)
		this.writeByteArrayRaw(value, value.length)
	}
	
	writeIntArray(value: number[]) {
		this.writeInt(value.length)
		for (const v of value) {
			this.writeInt(v)
		}
	}
	
	writeLongArray(value: Long[]) {
		this.writeInt(value.length)
		for (const v of value) {
			this.writeLong(v)
		}
	}
	
	writeDoubleArray(value: number[]) {
		const size = value.length
		this.writeInt(size)
		
		if (size != 0) {
			const buffer = new ArrayBuffer(size * 8)         // JS numbers are 8 bytes long, or 64 bits
			const view = new Float64Array(buffer)
			
			let i = 0
			for (const v of value) {
				view[i++] = v
			}
			
			this.writeByteArrayRaw(new Int8Array(buffer), buffer.byteLength)
		}
	}
	
	writeList<E>(value: E[], encoder: Encoder<E>) {
		this.writeInt(value.length)
		
		// @ts-ignore
		if (encoder === Encoders.BOOLEAN) {
			// @ts-ignore
			this.writeBooleanArray(value)
		}
		else {
			for (const v of value) {
				encoder(this, v)
			}
		}
	}
	
	writeMap<K, V>(value: Map<K, V>, keyEncoder: Encoder<K>, valueEncoder: Encoder<V>) {
		this.writeInt(value.size)
		
		value.forEach((v, k) => {
			keyEncoder(this, k)
			valueEncoder(this, v)
		})
	}
	
	write<T>(value: T, encoder: Encoder<T>) {
		encoder(this, value)
	}
	
	protected abstract writeByteArrayRaw(array: Int8Array, size: number)
}
