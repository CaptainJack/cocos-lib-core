import {LoadingProcess} from './LoadingProcess'

export class FakeLoadingProcess implements LoadingProcess<void> {
	readonly completed: boolean = true
	readonly progress: number = 1
	
	constructor() {}
	
	onComplete(handler: () => void): this {
		app.assistant.execute(handler)
		return this
	}
}