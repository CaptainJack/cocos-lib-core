import {Long} from '../lang/Long'
import {Decoder} from './Decoder'

export namespace Decoders {
	export const BOOLEAN: Decoder<boolean> = r => r.readBoolean()
	export const BYTE: Decoder<number> = r => r.readByte()
	export const INT: Decoder<number> = r => r.readInt()
	export const LONG: Decoder<Long> = r => r.readLong()
	export const DOUBLE: Decoder<number> = r => r.readDouble()
	
	export const BOOLEAN_ARRAY: Decoder<boolean[]> = r => r.readBooleanArray()
	export const BYTE_ARRAY: Decoder<Int8Array> = r => r.readByteArray()
	export const INT_ARRAY: Decoder<number[]> = r => r.readIntArray()
	export const LONG_ARRAY: Decoder<Long[]> = r => r.readLongArray()
	export const DOUBLE_ARRAY: Decoder<number[]> = r => r.readDoubleArray()
	
	export const STRING: Decoder<string> = r => r.readString()
	export const STRING_NULLABLE: Decoder<string | null> = r => r.readStringNullable()
	
	export function forList<E>(decoder: Decoder<E>): Decoder<E[]> {
		return r => r.readList(decoder)
	}
	
	export function forMap<K, V>(keyDecoder: Decoder<K>, valueDecoder: Decoder<V>): Decoder<Map<K, V>> {
		return r => r.readMap(keyDecoder, valueDecoder)
	}
}
