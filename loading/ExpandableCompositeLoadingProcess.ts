import {LoadingProcess} from './LoadingProcess'
import {CompositeLoadingProcess} from './CompositeLoadingProcess'
import {DirectLoadingProcess} from './DirectLoadingProcess'

export class ExpandableCompositeLoadingProcess extends CompositeLoadingProcess {
	public add<T extends LoadingProcess> (process: T): T {
		this.processes.push(process)
		process.onComplete(() => this.tryComplete())
		return process
	}
	
	public addDirect(): DirectLoadingProcess {
		const p = new DirectLoadingProcess()
		this.add(p)
		return p
	}
	
	public addPromise(promise: Promise<any>) {
		const process = this.addDirect()
		promise.then(() => process.complete())
	}
}