import {_decorator, Sprite, SpriteFrame} from 'cc'
import {ButtonState} from './Button'
import {ButtonEffect} from './ButtonEffect'

@_decorator.ccclass
@_decorator.menu('lib/button/Button_Scale')
export class Button_Scale extends ButtonEffect {
	private normal: number
	
	@_decorator.property
	private hovered: number = 1
	
	@_decorator.property
	private pressed: number = 1
	
	@_decorator.property
	private disabled: number = 1
	
	protected onLoad() {
		this.normal = this.node.scale.x
		super.onLoad()
	}
	
	protected drawState(state: ButtonState) {
		this.setScaleFully(this.getStateScale(state))
	}
	
	private getStateScale(state: ButtonState): number {
		switch (state) {
			case ButtonState.PRESSED:
				return this.pressed
			case ButtonState.HOVERED:
				return this.hovered
			case ButtonState.DISABLED:
				return this.disabled
			default:
				return this.normal
		}
	}
	
}