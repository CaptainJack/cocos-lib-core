import {_byte} from '../../../tool/lang/_byte'
import {ProtocolMarker} from './ProtocolMarker'

export class LastIncomingMessageId {
	private _changed: boolean = false
	private _id: number = 0
	
	private readonly message = new Int8Array(5)
	
	constructor() {
		this.message[0] = ProtocolMarker.MESSAGING_RECEIVED
	}
	
	get changed(): boolean {
		return this._changed
	}
	
	get id(): number {
		return this._id
	}
	
	update(value: number) {
		this._id = value
		this._changed = true
	}
	
	makeMessage(): Int8Array {
		this._changed = false
		_byte.putInt(this.message, 1, this._id)
		return this.message
	}
}