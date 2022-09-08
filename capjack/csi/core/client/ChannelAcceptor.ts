import {Channel} from "../Channel";
import {ChannelHandler} from "../ChannelHandler";

export interface ChannelAcceptor {
	acceptChannel(channel: Channel): ChannelHandler
	
	acceptFail(): void
}