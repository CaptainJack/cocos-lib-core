import {Long} from '../../tool/lang/Long'
import {InputByteBuffer} from '../../tool/io/InputByteBuffer'

export interface Connection {
	readonly id: Long
	readonly loggingName: String
	
	send(message: InputByteBuffer)
	
	close()
	
	closeDueError()
}