import {InputByteBuffer} from "../../../tool/io/InputByteBuffer";
import {ChannelInputProcess} from "./ChannelInputProcess";
import {InternalChannel} from "./InternalChannel";

export interface InternalChannelProcessor {
	processChannelInput(channel: InternalChannel, buffer: InputByteBuffer): ChannelInputProcess
	
	processChannelClose(channel: InternalChannel, interrupted: Boolean)
}