import {_decorator, Vec2} from 'cc'
import {ButtonState} from './Button'
import {ButtonEffect} from './ButtonEffect'

@_decorator.ccclass('Button_PositionOffset')
@_decorator.menu('lib/button/Button_PositionOffset')
export class Button_PositionOffset extends ButtonEffect {
	private _normal: Vec2
	
	@_decorator.property({visible: true})
	private _hovered: Vec2 = new Vec2()
	
	@_decorator.property({visible: true})
	private _pressed: Vec2 = new Vec2()
	
	@_decorator.property({visible: true})
	private _disabled: Vec2 = new Vec2()
	
	protected onLoad() {
		this._normal = new Vec2(this.node.position.x, this.node.position.y)
		super.onLoad()
	}
	
	protected drawState(state: ButtonState) {
		const p = this.getStateOffset(state)
		this.node.setPosition(this._normal.x + p.x, this._normal.y + p.y)
	}
	
	private getStateOffset(state: ButtonState): Vec2 {
		switch (state) {
			case ButtonState.PRESSED:
				return this._pressed
			case ButtonState.HOVERED:
				return this._hovered
			case ButtonState.DISABLED:
				return this._disabled
			default:
				return Vec2.ZERO
		}
	}
	
}