import {_decorator} from 'cc'
import {ButtonState} from './Button'
import {ButtonEffect} from './ButtonEffect'
import {Axis} from '../Axis'

@_decorator.ccclass('Button_PositionOffsetAxial')
@_decorator.menu('lib/button/Button_PositionOffsetAxial')
export class Button_PositionOffsetAxial extends ButtonEffect {
	private _normal: number
	
	@_decorator.property({visible: true, type: Axis})
	private _axis: Axis = Axis.Y
	
	@_decorator.property({visible: true})
	private _hovered: number = 0
	
	@_decorator.property({visible: true})
	private _pressed: number = 0
	
	@_decorator.property({visible: true})
	private _disabled: number = 0
	
	protected onLoad() {
		this._normal = this._axis == Axis.X ? this.node.position.x : this.node.position.y
		super.onLoad()
	}
	
	protected drawState(state: ButtonState) {
		const p = this.getStateOffset(state)
		if (this._axis == Axis.X) this.node.setX(this._normal + p)
		else this.node.setY(this._normal + p)
	}
	
	private getStateOffset(state: ButtonState): number {
		switch (state) {
			case ButtonState.PRESSED:
				return this._pressed
			case ButtonState.HOVERED:
				return this._hovered
			case ButtonState.DISABLED:
				return this._disabled
			default:
				return 0
		}
	}
	
}