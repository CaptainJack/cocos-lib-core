import {LoadingProcess} from './LoadingProcess'
import {AbstractLoadingProcess} from './AbstractLoadingProcess'
import {_array} from '../capjack/tool/lang/_arrays'

export class CompositeLoadingProcess<R> extends AbstractLoadingProcess<R> {
	private completeCount = 0
	
	constructor(
		protected processes: Array<LoadingProcess<any>> = [],
		private resultResolver?: () => R
	) {
		super()
		
		for (const process of processes) {
			process.onComplete(() => this.tryComplete())
		}
	}
	
	protected calcProgress(): number {
		return _array.sumOf(this.processes, p => p.progress) / this.processes.length
	}
	
	protected tryComplete() {
		if (++this.completeCount == this.processes.length) {
			this.doComplete(this.resultResolver ? this.resultResolver() : null)
			this.resultResolver = null
			this.processes = null
		}
	}
}

