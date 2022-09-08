import {ChannelGate} from "./ChannelGate";
import {ConnectionAcceptor} from "./ConnectionAcceptor";
import {AuthorizationChannelAcceptor} from "./internal/AuthorizationChannelAcceptor";
import {TemporalAssistant} from "../../../tool/utils/assistant/TemporalAssistant";
import {ObjectPool} from "../../../tool/utils/pool/ObjectPool";
import {ByteBuffer} from "../../../tool/io/ByteBuffer";

export class Client {
	constructor(
		private readonly assistant: TemporalAssistant,
		private readonly buffers: ObjectPool<ByteBuffer>,
		private readonly gate: ChannelGate,
		private readonly version: number = 0,
		private readonly authorizationTimeoutSeconds: number = 300
	) {
	}
	
	
	connect(authorizationKey: Int8Array, connectionAcceptor: ConnectionAcceptor) {
		this.gate.openChannel(new AuthorizationChannelAcceptor(
			this.assistant,
			this.buffers,
			this.gate,
			this.version,
			authorizationKey,
			connectionAcceptor,
			this.authorizationTimeoutSeconds
		))
	}
}