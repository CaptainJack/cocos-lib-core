import {_decorator, EventTouch, NodeEventType} from 'cc'
import {Cancelable} from '../../capjack/tool/utils/Cancelable'
import {NormalizedComponent} from '../../../../main/lib-main/components/NormalizedComponent'

export enum ButtonState {
	NORMAL,
	HOVERED,
	PRESSED,
	DISABLED
}

@_decorator.ccclass('Button')
@_decorator.menu('lib/button/Button')
@_decorator.disallowMultiple(true)
export class Button extends NormalizedComponent {
	private static calculateDeltaMove(event: EventTouch): number {
		let start = event.touch.getStartLocationInView()
		let end = event.touch.getLocationInView()
		let dx = start.x - end.x
		let dy = start.y - end.y
		return dx * dx + dy * dy
	}
	
	@_decorator.property
	public data: string = ''
	
	@_decorator.property({visible: true})
	private _holdable: boolean = false
	
	private _holdTask: Cancelable = Cancelable.DUMMY
	
	private _state: ButtonState = ButtonState.NORMAL
	private _interactive = true
	private _pressed: boolean = false
	private _hovered: boolean = false
	private _moving = false
	
	private _stateHandlers: Array<(state: ButtonState) => void> = []
	private _pressHandlers: Array<(state: Button) => void> = []
	private _holdHandlers: Array<(state: Button) => void> = []
	
	public get state(): ButtonState {
		return this._state
	}
	
	public get interactive(): boolean {
		return this._interactive
	}
	
	public set interactive(value) {
		this._interactive = value
		this.updateState()
	}
	
	public onChangeState(handler: (state: ButtonState) => void, target?: any) {
		if (target) handler = handler.bind(target)
		this._stateHandlers.push(handler)
	}
	
	public onPress(handler: (button: Button) => void, target?: any) {
		if (target) handler = handler.bind(target)
		this._pressHandlers.push(handler)
	}
	
	public onHold(handler: (button: Button) => void, target?: any) {
		if (this._holdable) {
			if (target) handler = handler.bind(target)
			this._holdHandlers.push(handler)
		}
	}
	
	public removeAllPressHandlers() {
		this._pressHandlers.length = 0
	}
	
	public removeAllStateHandlers() {
		this._stateHandlers.length = 0
	}
	
	public redraw() {
		this.drawState(this._state)
		for (const handler of this._stateHandlers) {
			handler(this._state)
		}
	}
	
	public drawState(state: ButtonState) {
	}
	
	protected onEnable() {
		super.onEnable()
		
		this.updateState()
		this.node.on(NodeEventType.TOUCH_START, this.onTouchStart, this)
		this.node.on(NodeEventType.TOUCH_MOVE, this.onTouchMove, this)
		this.node.on(NodeEventType.TOUCH_END, this.onTouchEnd, this)
		this.node.on(NodeEventType.TOUCH_CANCEL, this.onTouchCancel, this)
		this.node.on(NodeEventType.MOUSE_ENTER, this.onMouseEnter, this)
		this.node.on(NodeEventType.MOUSE_LEAVE, this.onMouseLeave, this)
	}
	
	protected onDisable() {
		super.onDisable()
		
		this._pressed = false
		this._hovered = false
		this.updateState()
		this.node.off(NodeEventType.TOUCH_START, this.onTouchStart, this)
		this.node.off(NodeEventType.TOUCH_MOVE, this.onTouchMove, this)
		this.node.off(NodeEventType.TOUCH_END, this.onTouchEnd, this)
		this.node.off(NodeEventType.TOUCH_CANCEL, this.onTouchCancel, this)
		this.node.off(NodeEventType.MOUSE_ENTER, this.onMouseEnter, this)
		this.node.off(NodeEventType.MOUSE_LEAVE, this.onMouseLeave, this)
	}
	
	protected onDestroy() {
		super.onDestroy()
		
		this.removeAllPressHandlers()
		this.removeAllStateHandlers()
	}
	
	protected executePress() {
		for (const handler of this._pressHandlers) {
			handler(this)
		}
	}
	
	protected executeHold() {
		for (const handler of this._holdHandlers) {
			handler(this)
		}
	}
	
	private updateState() {
		const state = this.defineState()
		if (this._state != state) {
			this._state = state
			this.redraw()
		}
	}
	
	private defineState() {
		if (this._interactive) {
			if (this._pressed) return ButtonState.PRESSED
			if (this._hovered) return ButtonState.HOVERED
			return ButtonState.NORMAL
		}
		return ButtonState.DISABLED
	}
	
	private onTouchStart(event: EventTouch) {
		event.propagationStopped = true
		
		if (!this._interactive) {
			return
		}
		
		this._pressed = true
		this._moving = false
		this.updateState()
		
		if (this._holdable) {
			this._holdTask = app.assistant.schedule(1000, () => this.doHold())
		}
	}
	
	private onTouchMove(event: EventTouch) {
		if (!this._interactive) {
			return
		}
		
		const touch = event.touch
		if (!touch) {
			return
		}
		event.propagationStopped = true
		
		if (this._moving) {
			return
		}
		
		let deltaMove = Button.calculateDeltaMove(event)
		if (deltaMove > 1000) {
			this._moving = true
			this._pressed = false
			this.updateState()
			return
		}
		
		this._pressed = this.node._uiProps.uiTransformComp!.isHit(touch.getUILocation())
		this.updateState()
	}
	
	private onTouchEnd(event: EventTouch) {
		if (!this._interactive) {
			return
		}
		
		if (this._pressed && !this._moving) {
			event.propagationStopped = true
			this._pressed = false
			this.updateState()
			this._holdTask.cancel()
			this._holdTask = Cancelable.DUMMY
			this.executePress()
		}
	}
	
	private doHold() {
		if (this._pressed && !this._moving) {
			this._pressed = false
			this.updateState()
			this._holdTask.cancel()
			this._holdTask = Cancelable.DUMMY
			this.executeHold()
		}
	}
	
	private onTouchCancel() {
		if (!this._interactive) {
			return
		}
		this._pressed = false
		this.updateState()
	}
	
	private onMouseEnter() {
		if (!this._interactive) {
			return
		}
		this._hovered = true
		this.updateState()
	}
	
	private onMouseLeave() {
		if (!this._interactive) {
			return
		}
		this._hovered = false
		this.updateState()
	}
}

