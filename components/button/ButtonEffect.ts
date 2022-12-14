import {_decorator} from 'cc'
import {Button, ButtonState} from './Button'
import {NormalizedComponent} from '../../../../main/lib-main/components/NormalizedComponent'
import {IllegalStateException} from '../../capjack/tool/lang/exceptions/IllegalStateException'

@_decorator.ccclass('ButtonEffect')
@_decorator.menu('lib/button/ButtonEffect')
export abstract class ButtonEffect extends NormalizedComponent {
	
	protected _button: Button
	
	protected onLoad() {
		super.onLoad()
		
		if (!this._button) {
			let p = this.node
			do {
				this._button = p.getComponent(Button)
				p = p.parent
			}
			while (!this._button && p)
		}
		
		if (!this._button) {
			throw new IllegalStateException(`Button not defined for effect ${this.node.getPathInHierarchy()}`)
		}
		
		this._button.onChangeState(this.drawState, this)
		this.drawState(this._button.state)
	}
	
	protected abstract drawState(state: ButtonState)
}
