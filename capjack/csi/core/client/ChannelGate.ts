import {ChannelAcceptor} from "./ChannelAcceptor"

export interface ChannelGate {
	openChannel(acceptor: ChannelAcceptor): void
}