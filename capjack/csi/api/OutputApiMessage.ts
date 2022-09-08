import {ByteBuffer} from '../../tool/io/ByteBuffer'
import {BiserWriter} from '../../tool/biser/BiserWriter'

export interface OutputApiMessage {
	readonly buffer: ByteBuffer
	readonly writer: BiserWriter
	
	dispose()
}

