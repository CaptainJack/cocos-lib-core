import {Cancelable} from '../Cancelable'

export class CancelableTask implements Cancelable {
	private _canceled = false
	
	constructor(private task: () => void) {}
	
	protected get canceled(): boolean {
		return this._canceled
	}
	
	cancel() {
		if (!this._canceled) {
			this._canceled = true
			this.task = null
		}
	}
	
	invoke() {
		if (!this._canceled) {
			this.task()
		}
	}
}