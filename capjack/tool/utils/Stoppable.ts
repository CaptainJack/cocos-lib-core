export interface Stoppable {
	stop(): void
}

export namespace Stoppable {
	export const DUMMY: Stoppable = {
		stop(): void {}
	}
	
	export function wrap(code: () => void): Stoppable {
		return new StoppableCode(code)
	}
	
	export function composite(...list: Array<Stoppable>): Stoppable {
		return new CompositeStoppable(list)
	}
}

class StoppableCode implements Stoppable {
	constructor(private code: () => void) {
	}
	
	stop(): void {
		if (this.code) {
			this.code()
			this.code = null
		}
	}
}

class CompositeStoppable implements Stoppable {
	constructor(private list: Array<Stoppable>) {}
	
	public stop(): void {
		if (this.list) {
			for (const cancelable of this.list) {
				cancelable.stop()
			}
			this.list.length = 0
			this.list = null
		}
	}
	
}