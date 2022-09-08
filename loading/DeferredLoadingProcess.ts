import {AbstractLoadingProcess} from './AbstractLoadingProcess'
import {LoadingProcess} from './LoadingProcess'

export class DeferredLoadingProcess extends AbstractLoadingProcess {
	
	private target: LoadingProcess = null
	
	assign(target: LoadingProcess) {
		this.target = target
		this.target.onComplete(() => this.doComplete())
	}
	
	protected calcProgress(): number {
		return this.target ? this.target.progress : 0
	}
}