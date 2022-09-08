import {InputByteBuffer} from '../../../tool/io/InputByteBuffer'
import {InternalConnection} from './InternalConnection'
import {InternalChannel} from './InternalChannel'

export interface InternalConnectionProcessor {
	processConnectionAccept(channel: InternalChannel, connection: InternalConnection): InternalConnectionProcessor
	
	processConnectionRecovery(channel: InternalChannel): InternalConnectionProcessor
	
	processConnectionClose()
	
	processChannelInput(channel: InternalChannel, buffer: InputByteBuffer): boolean
	
	processChannelInterrupt(connection: InternalConnection): InternalConnectionProcessor
}