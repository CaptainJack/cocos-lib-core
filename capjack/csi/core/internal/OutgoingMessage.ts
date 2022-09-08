import {InputByteBuffer} from '../../../tool/io/InputByteBuffer'

export interface OutgoingMessage {
	readonly id: number
	readonly size: number
	readonly data: InputByteBuffer
}