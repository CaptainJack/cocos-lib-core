import {Button} from './Button'
import {_decorator} from 'cc'

@_decorator.ccclass('ToggleButton')
@_decorator.menu('lib/button/ToggleButton')
export class ToggleButton extends Button {
	private _toggled: boolean = false
	
	get toggled(): boolean {
		return this._toggled
	}
	
	set toggled(value: boolean) {
		if (this._toggled != value) {
			this._toggled = value
			this.onToggle()
			this.redraw()
		}
	}
	
	public toggle() {
		this.toggled = !this.toggled
	}
	
	protected onToggle() {
	}
}

