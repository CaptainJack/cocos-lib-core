import {LoadingProcess} from './LoadingProcess'

export abstract class AbstractLoadingProcess implements LoadingProcess {
	private completeHandlers: Array<() => void> = []
	private completeArgs: any
	
	constructor() {}
	
	get completed(): boolean {
		return this.completeHandlers === null
	}
	
	get progress(): number {
		return this.completed ? 1 : this.calcProgress()
	}
	
	onComplete(handler: (...args) => void) {
		if (this.completed) {
			app.assistant.execute(() => handler.apply(null, this.completeArgs))
		}
		else {
			this.completeHandlers.push(handler)
		}
	}
	
	protected doComplete(...args: any) {
		const handlers = this.completeHandlers
		this.completeHandlers = null
		this.completeArgs = args
		
		app.assistant.execute(() => {
			for (const handler of handlers) {
				handler.apply(null, args)
			}
		})
		
		this.clearOnComplete()
	}
	
	protected abstract calcProgress(): number
	
	protected clearOnComplete() {}
}