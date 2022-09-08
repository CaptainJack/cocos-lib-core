import {_decorator, Sprite, SpriteFrame} from 'cc'
import {ButtonState} from './Button'
import {ButtonEffect} from './ButtonEffect'

@_decorator.ccclass('Button_SpriteFrame')
@_decorator.menu('lib/button/Button_SpriteFrame')
@_decorator.requireComponent(Sprite)
export class Button_SpriteFrame extends ButtonEffect {
	private _target: Sprite
	
	private _normal: SpriteFrame
	
	@_decorator.property({type: SpriteFrame, visible: true})
	private _hovered: SpriteFrame
	
	@_decorator.property({type: SpriteFrame, visible: true})
	private _pressed: SpriteFrame
	
	@_decorator.property({type: SpriteFrame, visible: true})
	private _disabled: SpriteFrame
	
	protected onLoad() {
		this._target = this.node.getComponent(Sprite)
		this._normal = this._target.spriteFrame
		super.onLoad()
	}
	
	protected drawState(state: ButtonState) {
		this._target.spriteFrame = this.getStateFrame(state)
	}
	
	private getStateFrame(state: ButtonState): SpriteFrame {
		switch (state) {
			case ButtonState.PRESSED:
				return this._pressed || this._normal
			case ButtonState.HOVERED:
				return this._hovered || this._normal
			case ButtonState.DISABLED:
				return this._disabled || this._normal
			default:
				return this._normal
		}
	}
	
}