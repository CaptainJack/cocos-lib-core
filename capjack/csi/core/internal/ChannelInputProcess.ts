import {InternalChannelProcessor} from './InternalChannelProcessor'

export class ChannelInputProcess {
	static readonly CONTINUE = new ChannelInputProcess()
	static readonly BREAK = new ChannelInputProcess()
}

export class ChannelInputProcessSwitch extends ChannelInputProcess {
	constructor(
		public readonly processor: InternalChannelProcessor,
		public readonly activityTimeoutSeconds: number = 0
	) {
		super()
	}
}