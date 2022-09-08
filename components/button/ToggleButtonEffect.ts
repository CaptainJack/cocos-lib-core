import {_decorator} from 'cc'
import {ButtonEffect} from './ButtonEffect'
import {ToggleButton} from './ToggleButton'

@_decorator.ccclass('ToggleButtonEffect')
@_decorator.menu('lib/button/ToggleButtonEffect')
export abstract class ToggleButtonEffect extends ButtonEffect {
	protected get toggled(): boolean {
		return (this._button as ToggleButton).toggled
	}
}
