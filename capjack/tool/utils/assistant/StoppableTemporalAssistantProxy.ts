import {TemporalAssistant} from './TemporalAssistant'
import {Cancelable} from '../Cancelable'
import {Stoppable} from '../Stoppable'

export class StoppableTemporalAssistantProxy implements TemporalAssistant, Stoppable {
	
	private _mapCodeToCancel = new Map<any, Cancelable>()
	
	constructor(private target: TemporalAssistant) {}
	
	stop() {
		this.target = null
		
		this._mapCodeToCancel.forEach(cancelable => cancelable.cancel())
		this._mapCodeToCancel.clear()
	}
	
	charge(code: () => void): Cancelable {
		if (this.target) {
			return this.wrapCancel(this.target.charge(this.wrapCode(code)), code)
		}
		return Cancelable.DUMMY
	}
	
	chargeOn(target: any, code: () => void): Cancelable {
		return this.charge(code.bind(target))
	}
	
	execute(code: () => void): void {
		this.charge(code)
	}
	
	executeOn(target: any, code: () => void): void {
		this.chargeOn(target, code)
	}
	
	repeat(delayMillis: number, code: () => void): Cancelable {
		if (this.target) {
			if (this.target) {
				return this.wrapCancel(this.target.repeat(delayMillis, code), code)
			}
		}
		return Cancelable.DUMMY
	}loc
	
	schedule(delayMillis: number, code: () => void): Cancelable {
		if (this.target) {
			if (this.target) {
				return this.wrapCancel(this.target.schedule(delayMillis, this.wrapCode(code)), code)
			}
		}
		return Cancelable.DUMMY
	}
	
	wait(condition: () => boolean, action: () => void): Cancelable {
		if (this.target) {
			if (this.target) {
				return this.wrapCancel(this.target.wait(condition, this.wrapCode(action)), action)
			}
		}
		return Cancelable.DUMMY
	}
	
	private wrapCode(code: () => void): () => void {
		return () => {
			this._mapCodeToCancel.delete(code)
			code()
		}
	}
	
	private wrapCancel(cancelable: Cancelable, code: () => void): Cancelable {
		this._mapCodeToCancel.set(code, cancelable)
		return new WrappedCancelable(this._mapCodeToCancel, cancelable, code)
	}
}

class WrappedCancelable implements Cancelable {
	constructor(
		private map: Map<any, Cancelable>,
		private cancelable: Cancelable,
		private code: () => void
	) {}
	
	cancel(): void {
		if (this.map) {
			this.map.delete(this.code)
			this.cancelable.cancel()
			
			this.map = null
			this.cancelable = null
			this.code = null
		}
	}
	
}