import {Cancelable} from '../capjack/tool/utils/Cancelable'

export class EventReceivers {
	
	private readonly _list = new Set<Receiver>()
	
	add(receiver: (event) => void): Cancelable {
		const r = new Receiver(receiver, this._list)
		this._list.add(r)
		return r
	}
	
	dispatch(event: any) {
		for (const receiver of this._list) {
			receiver.receive(event)
		}
	}
	
	clear() {
		for (const receiver of this._list) {
			receiver.cancel()
		}
	}
}

class Receiver implements Cancelable {
	constructor(
		private receiver: (event) => void,
		private receivers: Set<Receiver>
	) {}
	
	cancel(): void {
		if (this.receivers && this.receivers.delete(this)) {
			this.receiver = null
			this.receivers = null
		}
	}
	
	receive(event: any) {
		this.receiver(event)
	}
}
