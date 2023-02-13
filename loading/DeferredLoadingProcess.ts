import {AbstractLoadingProcess} from './AbstractLoadingProcess'
import {LoadingProcess} from './LoadingProcess'

export class DeferredLoadingProcess<R> extends AbstractLoadingProcess<R> {
	
	private target: LoadingProcess<R> = null
	
	public assign(target: LoadingProcess<R>) {
		this.target = target
		this.target.onComplete(r => this.doComplete(r))
	}
	
	protected calcProgress(): number {
		return this.target ? this.target.progress : 0
	}
}