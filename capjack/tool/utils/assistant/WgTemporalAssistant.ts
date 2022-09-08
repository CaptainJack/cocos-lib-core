import {WgAssistant} from './WgAssistant'
import {TemporalAssistant} from './TemporalAssistant'
import {Cancelable} from '../Cancelable'
import {CancelableTask} from './CancelableTask'

export class WgsTemporalAssistant extends WgAssistant implements TemporalAssistant {
	schedule(delayMillis: number, code: () => void): Cancelable {
		return new ScheduledTask(code, this.wg, delayMillis)
	}
	
	repeat(delayMillis: number, code: () => void): Cancelable {
		return new RepeatableTask(code, this.wg, delayMillis)
	}
	
	wait(condition: () => boolean, action: () => void): Cancelable {
		const cancelable = this.repeat(100, () => {
			if (condition()) {
				cancelable.cancel()
				action()
			}
		})
		return cancelable
	}
}

abstract class TemporalTask extends CancelableTask {
	protected id: number
	
	protected constructor(
		task: () => void,
		protected readonly wg: WindowOrWorkerGlobalScope
	) {
		super(task)
	}
	
	cancel() {
		if (!this.canceled) {
			super.cancel()
			this.stop()
		}
	}
	
	protected abstract stop()
}

class ScheduledTask extends TemporalTask {
	constructor(task: () => void, wg: WindowOrWorkerGlobalScope, time: number) {
		super(task, wg)
		this.id = this.wg.setTimeout(this.invoke.bind(this), time)
	}
	
	protected stop() {
		this.wg.clearTimeout(this.id)
	}
}

class RepeatableTask extends TemporalTask {
	constructor(task: () => void, wg: WindowOrWorkerGlobalScope, time: number) {
		super(task, wg)
		this.id = this.wg.setInterval(this.invoke.bind(this), time)
	}
	
	protected stop() {
		this.wg.clearInterval(this.id)
	}
}