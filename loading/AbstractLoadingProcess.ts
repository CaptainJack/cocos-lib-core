import {LoadingProcess} from './LoadingProcess'

export abstract class AbstractLoadingProcess<R> implements LoadingProcess<R> {
	private handlers: Array<(result: R) => void> = []
	private result: R = null
	
	constructor() {}
	
	get completed(): boolean {
		return this.handlers === null
	}
	
	get progress(): number {
		return this.completed ? 1 : this.calcProgress()
	}
	
	onComplete(handler: (result: R) => void): this {
		if (this.completed) {
			app.assistant.execute(() => handler(this.result))
		}
		else {
			this.handlers.push(handler)
		}
		return this
	}
	
	protected doComplete(result?:R) {
		const handlers = this.handlers
		this.handlers = null
		this.result = result
		
		app.assistant.execute(() => {
			for (const handler of handlers) {
				handler(result)
			}
		})
		
		this.clearOnComplete()
	}
	
	protected abstract calcProgress(): number
	
	protected clearOnComplete() {}
}