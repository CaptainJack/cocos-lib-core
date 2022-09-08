import {_decorator, Sprite, SpriteFrame} from 'cc'
import {ButtonState} from './Button'
import {ToggleButtonEffect} from './ToggleButtonEffect'

@_decorator.ccclass('ToggleButton_SpriteFrame')
@_decorator.menu('lib/button/ToggleButton_SpriteFrame')
@_decorator.requireComponent(Sprite)
export class ToggleButton_SpriteFrame extends ToggleButtonEffect {
	private _target: Sprite
	
	@_decorator.property({type: SpriteFrame, group: 'on', visible: true})
	private _onNormal: SpriteFrame
	
	@_decorator.property({type: SpriteFrame, group: 'on', visible: true})
	private _onHovered: SpriteFrame
	
	@_decorator.property({type: SpriteFrame, group: 'on', visible: true})
	private _onPressed: SpriteFrame
	
	@_decorator.property({type: SpriteFrame, group: 'on', visible: true})
	private _onDisabled: SpriteFrame
	
	
	@_decorator.property({type: SpriteFrame, group: 'off', visible: true})
	private _offNormal: SpriteFrame
	
	@_decorator.property({type: SpriteFrame, group: 'off', visible: true})
	private _offHovered: SpriteFrame
	
	@_decorator.property({type: SpriteFrame, group: 'off', visible: true})
	private _offPressed: SpriteFrame
	
	@_decorator.property({type: SpriteFrame, group: 'off', visible: true})
	private _offDisabled: SpriteFrame
	
	
	protected onLoad() {
		this._target = this.node.getComponent(Sprite)
		super.onLoad()
	}
	
	protected drawState(state: ButtonState) {
		this._target.spriteFrame = this.getStateFrame(state) || this.getStateFrame(ButtonState.NORMAL)
	}
	
	private getStateFrame(state: ButtonState): SpriteFrame {
		switch (state) {
			case ButtonState.PRESSED:
				return this.toggled ? this._onPressed : this._offPressed
			case ButtonState.HOVERED:
				return this.toggled ? this._onHovered : this._offHovered
			case ButtonState.DISABLED:
				return this.toggled ? this._onDisabled : this._offDisabled
			default:
				return this.toggled ? this._onNormal : this._offNormal
		}
	}
	
}