import {Stoppable} from './Stoppable'
import {isNullable} from '../lang/_utils'
import {Accumulator} from './Accumulator'
import {Closeable} from './Closeable'

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

export type Interruptible = Cancelable | Stoppable | Closeable

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

export class CompositeCancelable implements Cancelable, Accumulator<Interruptible> {
	private readonly list: Array<Interruptible>
	
	constructor(list?: Array<Interruptible>) {
		this.list = isNullable(list) ? [] : list
	}
	
	public add(target: Interruptible): this {
		this.list.push(target)
		return this
	}
	
	public cancel(): void {
		for (const task of this.list) {
			if ((task as Cancelable).cancel) {
				(task as Cancelable).cancel()
			}
			else if ((task as Stoppable).stop) {
				(task as Stoppable).stop()
			}
			else {
				(task as Closeable).close()
			}
		}
		this.list.length = 0
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

