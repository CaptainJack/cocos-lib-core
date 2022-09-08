import {Assistant} from './Assistant'
import {Cancelable} from '../Cancelable'
import {ArrayQueue} from '../collections/ArrayQueue'
import {extractError} from '../../lang/_errors'
import {Logger} from '../../logging/Logger'
import {Logging} from '../../logging/Logging'
import {CancelableTask} from './CancelableTask'

export class WgAssistant implements Assistant {
	private static get logger(): Logger {
		return Logging.getLogger('capjack.tool.utils.assistant.WgAssistant')
	}

	private readonly tasks = new ArrayQueue<(() => void) | CancelableTask>()
	private readonly runFn = this.run.bind(this)
	private runId: number = 0
	private idle = true
	private errorCatching: boolean = false
	
	constructor(
		protected readonly wg: WindowOrWorkerGlobalScope,
		private readonly errorHandler: (e: Error) => void
	) {}
	
	charge(code: () => void): Cancelable {
		
		const task = new CancelableTask(code)
		this.queue(task)
		return task
	}
	
	chargeOn(target: any, code: () => void): Cancelable {
		return this.charge(code.bind(target))
	}
	
	execute(code: () => void): void {
		this.queue(code)
	}
	
	executeOn(target: any, code: () => void): void {
		this.execute(code.bind(target))
	}
	
	private queue(task: (() => void) | CancelableTask): void {
		this.tasks.add(task)
		this.activate()
	}
	
	private activate() {
		if (this.idle) {
			this.idle = false
			this.runId = this.wg.setInterval(this.runFn)
		}
	}
	
	private deactivate() {
		if (!this.idle) {
			this.wg.clearInterval(this.runId)
			this.runId = 0
			this.idle = true
		}
	}
	
	private run() {
		const startTime = this.wg.performance.now()
		let delay = 0
		
		do {
			const task = this.tasks.poll()
			
			try {
				if (task instanceof CancelableTask) {
					task.invoke()
				}
				else {
					task()
				}
			}
			catch (e) {
				this.catchError(e)
			}
			
			delay = this.wg.performance.now() - startTime
		}
		while (!this.tasks.isEmpty() && delay < 20)
		
		if (this.tasks.size == 0) {
			this.deactivate()
		}
		
	}
	
	private catchError(error: any) {
		error = extractError(error)
		if (this.errorCatching) {
			WgAssistant.logger.error('Nested error', error)
		}
		else {
			this.errorCatching = true
			try {
				if (!this.errorHandler) {
					WgAssistant.logger.error('Uncaught error', error)
				}
				else {
					this.errorHandler(error)
				}
			}
			catch (e) {
				WgAssistant.logger.error('Nested error on catching', e)
			}
			this.errorCatching = false
		}
	}
}

