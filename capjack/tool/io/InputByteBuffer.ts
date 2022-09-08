import {Long} from "../lang/Long";
import {OutputByteBuffer} from "./OutputByteBuffer";

export interface InputByteBuffer {
	readonly readable: boolean
	readonly readableSize: number
	readonly arrayView: InputByteBufferArrayView | null
	
	isReadable(size: number): boolean
	
	readByte(): number
	
	readInt(): number
	
	readLong(): Long
	
	readToArray(target: Int8Array, offset: number, size: number): void
	
	readToBuffer(target: OutputByteBuffer, size: number): void
	
	readArray(size: number): Int8Array
	
	readArrayFully(): Int8Array
	
	skipRead(size: number): void
	
	skipReadFully(): void
	
	backRead(size: number): void
}


export interface InputByteBufferArrayView {
	readonly array: Int8Array
	readonly readerIndex: number
}