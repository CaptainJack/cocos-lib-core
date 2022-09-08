import {Assistant} from '../assistant/Assistant'
import {ArrayQueue} from '../collections/ArrayQueue'
import {extractError} from '../../lang/_errors'
import {Logging} from '../../logging/Logging'
import {Logger} from '../../logging/Logger'

export class Worker {
	private _working: boolean = false
	private queue = new ArrayQueue<() => void>()
	private errorCatching: boolean = false
	private readonly nextTaskFn: () => void = this.nextTask.bind(this)
	
	constructor(
		readonly assistant: Assistant,
		readonly errorHandler: (e: Error) => void
	) {
	}
	
	private static get logger(): Logger {
		return Logging.getLogger('capjack.tool.utils.worker.Worker')
	}
	
	get working(): boolean {
		return this._working
	}
	
	execute(task: () => void) {
		if (this._working) {
			this.queue.add(task)
		}
		else {
			this._working = true
			this.work(task)
		}
	}
	
	executeOn(target: any, task: () => void) {
		this.execute(task.bind(target))
	}
	
	defer(task: () => void) {
		this.queue.add(task)
		if (!this._working) {
			this._working = true
			this.scheduleNextTask()
		}
	}
	
	deferOn(target: any, task: () => void) {
		this.defer(task.bind(target))
	}
	
	private work(task: () => void) {
		try {
			task()
		}
		catch (e) {
			this.catchError(e)
		}
		this.scheduleNextTask()
	}
	
	private scheduleNextTask() {
		this.assistant.execute(this.nextTaskFn)
	}
	
	private nextTask() {
		let task = this.queue.poll()
		if (task == null) {
			this._working = false
			return
		}
		this.work(task)
	}
	
	private catchError(error: any) {
		error = extractError(error)
		if (this.errorCatching) {
			Worker.logger.error('Nested error', error)
		}
		else {
			this.errorCatching = true
			try {
				if (!this.errorHandler) {
					Worker.logger.error('Uncaught error', error)
				}
				else {
					this.errorHandler(error)
				}
			}
			catch (e) {
				Worker.logger.error('Nested error on catching', e)
			}
			this.errorCatching = false
		}
	}
	
}