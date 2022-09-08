import {Long} from '../lang/Long'
import {Decoder} from './Decoder'

export interface BiserReader {
	readBoolean(): boolean
	
	readByte(): number
	
	readInt(): number
	
	readLong(): Long
	
	readDouble(): number
	
	readBooleanArray(): boolean[]
	
	readByteArray(): Int8Array
	
	readIntArray(): number[]
	
	readLongArray(): Long[]
	
	readDoubleArray(): number[]
	
	readString(): string
	
	readStringNullable(): string | null
	
	readList<E>(decoder: Decoder<E>): E[]
	
	readMap<K, V>(keyDecoder: Decoder<K>, valueDecoder: Decoder<V>): Map<K, V>
	
	read<E>(decoder: Decoder<E>): E
}
