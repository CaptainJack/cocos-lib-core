import {Connection} from "../Connection";
import {ConnectionHandler} from "./ConnectionHandler";
import {ConnectFailReason} from "./ConnectFailReason";

export interface ConnectionAcceptor {
	acceptConnection(connection: Connection): ConnectionHandler
	
	acceptFail(reason: ConnectFailReason): void
}