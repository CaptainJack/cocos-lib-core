import {_decorator, Color, UIRenderer} from 'cc'
import {ButtonState} from './Button'
import {ToggleButtonEffect} from './ToggleButtonEffect'

@_decorator.ccclass('ToggleButton_Color')
@_decorator.menu('lib/button/ToggleButton_Color')
@_decorator.requireComponent(UIRenderer)
export class ToggleButton_Color extends ToggleButtonEffect {
	private _target: UIRenderer
	
	@_decorator.property({group: 'on', visible: true})
	private _onNormal: Color = Color.WHITE.clone()
	
	@_decorator.property({group: 'on', visible: true})
	private _onHovered: Color = Color.TRANSPARENT.clone()
	
	@_decorator.property({group: 'on', visible: true})
	private _onPressed: Color = Color.TRANSPARENT.clone()
	
	@_decorator.property({group: 'on', visible: true})
	private _onDisabled: Color = Color.TRANSPARENT.clone()
	
	
	@_decorator.property({group: 'off', visible: true})
	private _offNormal: Color = Color.WHITE.clone()
	
	@_decorator.property({group: 'off', visible: true})
	private _offHovered: Color = Color.TRANSPARENT.clone()
	
	@_decorator.property({group: 'off', visible: true})
	private _offPressed: Color = Color.TRANSPARENT.clone()
	
	@_decorator.property({group: 'off', visible: true})
	private _offDisabled: Color = Color.TRANSPARENT.clone()
	
	
	protected onLoad() {
		this._target = this.node.getComponent(UIRenderer)
		super.onLoad()
	}
	
	protected drawState(state: ButtonState) {
		let color = this.getColor(state)
		if (!color || color.equals(Color.TRANSPARENT)) {
			color = this.getColor(ButtonState.NORMAL)
		}
		this._target.color = color
	}
	
	private getColor(state: ButtonState): Color {
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