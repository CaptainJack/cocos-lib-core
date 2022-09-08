import {OuterApi} from '../OuterApi'
import {InnerApi} from './InnerApi'
import {BaseApiAdapter} from '../BaseApiAdapter'
import {ConnectionHandler} from '../../core/client/ConnectionHandler'
import {ConnectionAcceptor} from '../../core/client/ConnectionAcceptor'
import {ObjectPool} from '../../../tool/utils/pool/ObjectPool'
import {ByteBuffer} from '../../../tool/io/ByteBuffer'
import {ApiSluice} from './ApiSluice'
import {ConnectFailReason} from '../../core/client/ConnectFailReason'
import {Connection} from '../../core/Connection'

export abstract class AbstractApiAdapter<IA extends InnerApi, OA extends OuterApi> extends BaseApiAdapter<IA, OA, ConnectionHandler> implements ConnectionAcceptor {
	protected constructor(
		private readonly sluice: ApiSluice<IA, OA>,
		byteBuffers: ObjectPool<ByteBuffer>
	) {
		super(byteBuffers)
	}
	
	acceptConnection(connection: Connection): ConnectionHandler {
		const context = this.createContext(connection)
		const outerApi = this.createOuterApi(context)
		const innerApi = this.sluice.connect(outerApi)
		return this.createConnectionHandler(context, innerApi)
	}
	
	acceptFail(reason: ConnectFailReason): void {
		this.sluice.fail(reason)
	}
}
