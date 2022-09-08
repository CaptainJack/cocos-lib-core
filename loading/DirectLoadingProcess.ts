import {AbstractLoadingProcess} from './AbstractLoadingProcess'

export class DirectLoadingProcess extends AbstractLoadingProcess {
	
	complete() {
		app.assistant.execute(() => this.doComplete())
	}
	
	protected calcProgress(): number {
		return 0
	}
}

