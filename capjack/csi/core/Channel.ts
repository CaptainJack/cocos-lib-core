import {InputByteBuffer} from "../../tool/io/InputByteBuffer";

export interface Channel {
	readonly id: any
	
	write(data: InputByteBuffer): void
	
	close(): void
}