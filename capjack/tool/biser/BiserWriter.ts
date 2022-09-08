import {Long} from '../lang/Long'
import {Encoder} from './Encoder'

export interface BiserWriter {
	writeBoolean(value: boolean)
	
	writeByte(value: number)
	
	writeInt(value: number)
	
	writeLong(value: Long)
	
	writeDouble(value: number)
	
	writeBooleanArray(value: boolean[])
	
	writeByteArray(value: Int8Array)
	
	writeIntArray(value: number[])
	
	writeLongArray(value: Long[])
	
	writeDoubleArray(value: number[])
	
	writeString(value: string)
	
	writeStringNullable(value: string | null)
	
	writeList<E>(value: E[], encoder: Encoder<E>)
	
	writeMap<K, V>(value: Map<K, V>, keyEncoder: Encoder<K>, valueEncoder: Encoder<V>)
	
	write<T>(value: T, encoder: Encoder<T>)
}
