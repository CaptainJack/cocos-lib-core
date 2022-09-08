import {_decorator, Sprite} from 'cc'
import {ButtonState} from './Button'
import {ButtonEffect} from './ButtonEffect'

@_decorator.ccclass('Button_SpriteGrayscale')
@_decorator.menu('lib/button/Button_SpriteGrayscale')
@_decorator.requireComponent(Sprite)
export class Button_SpriteGrayscale extends ButtonEffect {
	private _target: Sprite
	
	@_decorator.property({visible: true})
	private _pressed: boolean = false
	
	@_decorator.property({visible: true})
	private _hovered: boolean = false
	
	@_decorator.property({visible: true})
	private _disabled: boolean = false
	
	protected onLoad() {
		this._target = this.node.getComponent(Sprite)
		super.onLoad()
	}
	
	protected drawState(state: ButtonState) {
		this._target.grayscale = this.getStateGrayscale(state)
	}
	
	private getStateGrayscale(state: ButtonState): boolean {
		switch (state) {
			case ButtonState.PRESSED:
				return this._pressed
			case ButtonState.HOVERED:
				return this._hovered
			case ButtonState.DISABLED:
				return this._disabled
			case ButtonState.NORMAL:
				return false
		}
	}
}
