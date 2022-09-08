import {ButtonState} from './Button'
import {_decorator, Color, Renderable2D} from 'cc'
import {ButtonEffect} from './ButtonEffect'

@_decorator.ccclass('Button_Color')
@_decorator.menu('lib/button/Button_Color')
@_decorator.requireComponent(Renderable2D)
export class Button_Color extends ButtonEffect {
	private _target: Renderable2D
	
	private _normal: Color
	
	@_decorator.property({visible: true})
	private _pressed: Color = Color.TRANSPARENT.clone()
	
	@_decorator.property({visible: true})
	private _hovered: Color = Color.TRANSPARENT.clone()
	
	@_decorator.property({visible: true})
	private _disabled: Color = Color.TRANSPARENT.clone()
	
	protected onLoad() {
		this._target = this.node.getComponent(Renderable2D)
		this._normal = this._target.color.clone()
		super.onLoad()
	}
	
	protected drawState(state: ButtonState) {
		this._target.color = this.getStateColor(state)
	}
	
	private getStateColor(state: ButtonState): Color {
		switch (state) {
			case ButtonState.PRESSED:
				return this._pressed.equals(Color.TRANSPARENT) ? this._normal : this._pressed
			case ButtonState.HOVERED:
				return this._hovered.equals(Color.TRANSPARENT) ? this._normal : this._hovered
			case ButtonState.DISABLED:
				return this._disabled.equals(Color.TRANSPARENT) ? this._normal : this._disabled
			case ButtonState.NORMAL:
				return this._normal
		}
	}
}
