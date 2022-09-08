import {BaseInnerApi} from './BaseInnerApi'
import {BaseConnectionHandler} from '../core/BaseConnectionHandler'
import {OuterApi} from './OuterApi'
import {ObjectPool} from '../../tool/utils/pool/ObjectPool'
import {ByteBuffer} from '../../tool/io/ByteBuffer'
import {ApiMessagePool} from './ApiMessagePool'
import {ApiMessagePoolImpl} from './ApiMessagePoolImpl'
import {Context} from './Context'
import {Connection} from '../core/Connection'
import {Logging} from '../../tool/logging/Logging'
import {PrefixMessageTransformerLogger} from '../../tool/logging/PrefixMessageTransformerLogger'
import {CallbacksRegister} from './CallbacksRegister'

export abstract class BaseApiAdapter<IA extends BaseInnerApi, OA extends OuterApi, CH extends BaseConnectionHandler> {
	protected readonly messagePool: ApiMessagePool
	
	protected constructor(byteBuffers: ObjectPool<ByteBuffer>) {
		this.messagePool = new ApiMessagePoolImpl(byteBuffers)
	}
	
	protected abstract getLoggerName(): string
	
	protected abstract createOuterApi(context: Context): OA
	
	protected abstract createConnectionHandler(context: Context, api: IA): CH
	
	protected abstract provideCallbacksRegister(): CallbacksRegister
	
	protected createContext(connection: Connection): Context {
		return new Context(
			new PrefixMessageTransformerLogger(Logging.getLogger(this.getLoggerName()), `[${connection.loggingName}] `),
			this.messagePool,
			connection,
			this.provideCallbacksRegister()
		)
	}
}

