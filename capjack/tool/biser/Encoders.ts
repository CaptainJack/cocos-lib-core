import {Long} from '../lang/Long'
import {Encoder} from './Encoder'

export namespace Encoders {
	export const BOOLEAN: Encoder<boolean> = (w, v) => w.writeBoolean(v)
	export const BYTE: Encoder<number> = (w, v) => w.writeByte(v)
	export const INT: Encoder<number> = (w, v) => w.writeInt(v)
	export const LONG: Encoder<Long> = (w, v) => w.writeLong(v)
	export const DOUBLE: Encoder<number> = (w, v) => w.writeDouble(v)
	
	export const BOOLEAN_ARRAY: Encoder<boolean[]> = (w, v) => w.writeBooleanArray(v)
	export const BYTE_ARRAY: Encoder<Int8Array> = (w, v) => w.writeByteArray(v)
	export const INT_ARRAY: Encoder<number[]> = (w, v) => w.writeIntArray(v)
	export const LONG_ARRAY: Encoder<Long[]> = (w, v) => w.writeLongArray(v)
	export const DOUBLE_ARRAY: Encoder<number[]> = (w, v) => w.writeDoubleArray(v)
	
	export const STRING: Encoder<string> = (w, v) => w.writeString(v)
	export const STRING_NULLABLE: Encoder<string | null> = (w, v) => w.writeStringNullable(v)
	
	export function forList<E>(encoder: Encoder<E>): Encoder<E[]> {
		return (w, v) => w.writeList(v, encoder)
	}
	
	export function forMap<K, V>(keyEncoder: Encoder<K>, valueEncoder: Encoder<V>): Encoder<Map<K, V>> {
		return (w, v) => w.writeMap(v, keyEncoder, valueEncoder)
	}
}