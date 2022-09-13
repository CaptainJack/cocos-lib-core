import {ButtonState} from './Button'
import {_decorator, Color, Graphics} from 'cc'
import {ButtonEffect} from './ButtonEffect'

@_decorator.ccclass('Button_GraphicsColorStroke')
@_decorator.menu('lib/button/Button_GraphicsColorStroke')
@_decorator.requireComponent(Graphics)
export class Button_GraphicsColorStroke extends ButtonEffect {
	private _target: Graphics
	
	private _normal: Color
	
	@_decorator.property({visible: true})
	private _pressed: Color = Color.TRANSPARENT.clone()
	
	@_decorator.property({visible: true})
	private _hovered: Color = Color.TRANSPARENT.clone()
	
	@_decorator.property({visible: true})
	private _disabled: Color = Color.TRANSPARENT.clone()
	
	protected onLoad() {
		this._target = this.node.getComponent(Graphics)
		this._normal = this._target.strokeColor.clone()
		super.onLoad()
	}
	
	protected drawState(state: ButtonState) {
		this._target.strokeColor = this.getStateColor(state)
		// @ts-ignore
		this._target.draw()
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
