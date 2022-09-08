import {ArrayByteBuffer} from '../io/ArrayByteBuffer'
import {ByteBufferBiserWriter} from './ByteBufferBiserWriter'
import {ByteBufferBiserReader} from './ByteBufferBiserReader'

export function encodeBiser(block: (BiserWriter) => void): Int8Array {
	let buffer = new ArrayByteBuffer()
	let writer = new ByteBufferBiserWriter(buffer)
	block(writer)
	return buffer.readArrayFully()
}

export function decodeBiser<T>(bytes: Int8Array, block: (BiserReader) => T): T {
	let buffer = new ArrayByteBuffer()
	buffer.array = bytes
	let reader = new ByteBufferBiserReader(buffer)
	return block(reader)
}

