import {Cancelable} from '../Cancelable'

export class CancelableTask implements Cancelable {
	private _canceled = false
	
	constructor(private readonly task: () => void) {}
	
	protected get canceled(): boolean {
		return this._canceled
	}
	
	cancel() {
		this._canceled = true
	}
	
	invoke() {
		if (!this._canceled) {
			this.task()
		}
	}
}