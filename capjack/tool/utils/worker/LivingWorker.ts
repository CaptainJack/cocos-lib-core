import {Worker} from './Worker'

export class LivingWorker extends Worker {
	private _alive: boolean = true
	
	get alive(): boolean {
		return this._alive
	}
	
	die() {
		if (this._alive) {
			if (this.working) {
				this._alive = false
			}
			else {
				this.executeOn(this, this.die)
			}
		}
	}
}