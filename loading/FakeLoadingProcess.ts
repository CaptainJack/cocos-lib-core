import {LoadingProcess} from './LoadingProcess'

export class FakeLoadingProcess implements LoadingProcess {
	readonly completed: boolean = true
	readonly progress: number = 1
	
	constructor() {}
	
	onComplete(handler: () => void) {
		app.assistant.execute(handler)
	}
}