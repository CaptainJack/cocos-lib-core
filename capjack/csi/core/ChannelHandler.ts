import {InputByteBuffer} from "../../tool/io/InputByteBuffer";

export interface ChannelHandler {
	handleChannelInput(data: InputByteBuffer): void
	
	handleChannelClose(): void
}