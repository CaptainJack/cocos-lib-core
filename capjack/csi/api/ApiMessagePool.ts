import {ObjectPool} from '../../tool/utils/pool/ObjectPool'

import {ByteBufferBiserReader} from '../../tool/biser/ByteBufferBiserReader'
import {OutputApiMessage} from './OutputApiMessage'

export interface ApiMessagePool {
	readonly readers: ObjectPool<ByteBufferBiserReader>
	readonly  writers: ObjectPool<OutputApiMessage>
}

