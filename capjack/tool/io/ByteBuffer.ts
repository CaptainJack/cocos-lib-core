import {InputByteBuffer, InputByteBufferArrayView} from './InputByteBuffer'
import {OutputByteBuffer, OutputByteBufferArrayView} from './OutputByteBuffer'

export interface ByteBuffer extends InputByteBuffer, OutputByteBuffer {
	
	readonly arrayView: (InputByteBufferArrayView & OutputByteBufferArrayView) | null
	
	flush(): void
	
	clear(): void
}