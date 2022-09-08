import {InputByteBuffer} from "../../tool/io/InputByteBuffer";

export interface BaseConnectionHandler {
	handleConnectionMessage(message: InputByteBuffer)
	
	handleConnectionClose()
}