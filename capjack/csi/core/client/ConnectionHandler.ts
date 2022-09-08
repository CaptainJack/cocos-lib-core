import {BaseConnectionHandler} from "../BaseConnectionHandler";
import {ConnectionRecoveryHandler} from "./ConnectionRecoveryHandler";

export interface ConnectionHandler extends BaseConnectionHandler {
	handleConnectionLost(): ConnectionRecoveryHandler
	
	handleConnectionCloseTimeout(seconds: number)
}