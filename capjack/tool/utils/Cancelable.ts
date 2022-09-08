import {Stoppable} from './Stoppable'
import {IllegalStateException} from '../lang/exceptions/IllegalStateException'
import {isNullable} from '../lang/_utils'

export interface Cancelable {
	cancel(): void
}

export namespace Cancelable {
	export const DUMMY: Cancelable = {
		cancel(): void {}
	}
	
	export function wrap(code: () => void): Cancelable {
		return new CancelableCode(code)
	}
	
	export function composite(...list: Array<Cancelable>): CompositeCancelable {
		return new CompositeCancelable(list)
	}
	
	export function from(target: Stoppable): Cancelable {
		return new StoppableCancelable(target)
	}
}

class CancelableCode implements Cancelable {
	constructor(private code: () => void) {
	}
	
	cancel(): void {
		if (this.code) {
			this.code()
			this.code = null
		}
	}
}


export class CompositeCancelable implements Cancelable {
	private list: Array<Cancelable>
	
	constructor(list?: Array<Cancelable>) {
		this.list = isNullable(list) ? [] : list
	}
	
	public add(target: Cancelable): this {
		if (this.list) {
			this.list.push(target)
			return this
		}
		throw new IllegalStateException()
	}
	
	public cancel(): void {
		if (this.list) {
			for (const cancelable of this.list) {
				cancelable.cancel()
			}
			this.list.length = 0
			this.list = null
		}
	}
	
}

class StoppableCancelable implements Cancelable {
	constructor(private target: Stoppable) {}
	
	public cancel(): void {
		if (this.target) {
			this.target.stop()
			this.target = null
		}
	}
}
