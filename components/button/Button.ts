import {_decorator, AudioClip, EventKeyboard, EventTouch, Input, input, NodeEventType} from 'cc'
import {Cancelable} from '../../capjack/tool/utils/Cancelable'
import {NormalizedComponent} from '../../../../main/lib-main/components/NormalizedComponent'
import {_string} from '../../capjack/tool/lang/_string'
import {IllegalArgumentException} from '../../capjack/tool/lang/exceptions/IllegalArgumentException'

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
	private _key: string = ''
	
	@_decorator.property({visible: true, type: AudioClip})
	private _soundPress: AudioClip = null
	
	private _keyed: boolean = false
	private _keyCode: number
	
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
		if (target) handler = handler.bind(target)
		this._holdHandlers.push(handler)
		this._holdable = true
	}
	
	public removeAllPressHandlers() {
		this._pressHandlers.length = 0
	}
	
	public removeAllHoldHandlers() {
		this._holdHandlers.length = 0
		this._holdable = false
	}
	
	public removeAllStateHandlers() {
		this._stateHandlers.length = 0
	}
	
	public redraw(state: ButtonState = null) {
		if (!state) state = this._state
		this.drawState(state)
		for (const handler of this._stateHandlers) {
			handler(state)
		}
	}
	
	// noinspection JSUnusedLocalSymbols
	protected drawState(state: ButtonState) {
	}
	
	protected onLoad() {
		super.onLoad();
		this._keyed = !_string.isBlank(this._key)
		if (this._keyed) {
			if (_string.contains(this._key, 'SPACE')) {
				this._keyCode = 32
			}
			else {
				throw new IllegalArgumentException(this._key)
			}
		}
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
		
		if (this._keyed) {
			input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)
			input.on(Input.EventType.KEY_UP, this.onKeyUp, this)
		}
	}
	
	protected onDisable() {
		super.onDisable()
		
		this.stopHold()
		
		this._pressed = false
		this._hovered = false
		this.updateState()
		this.node.off(NodeEventType.TOUCH_START, this.onTouchStart, this)
		this.node.off(NodeEventType.TOUCH_MOVE, this.onTouchMove, this)
		this.node.off(NodeEventType.TOUCH_END, this.onTouchEnd, this)
		this.node.off(NodeEventType.TOUCH_CANCEL, this.onTouchCancel, this)
		this.node.off(NodeEventType.MOUSE_ENTER, this.onMouseEnter, this)
		this.node.off(NodeEventType.MOUSE_LEAVE, this.onMouseLeave, this)
		
		if (this._keyed) {
			input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this)
			input.off(Input.EventType.KEY_UP, this.onKeyUp, this)
		}
	}
	
	protected onDestroy() {
		super.onDestroy()
		
		this.removeAllPressHandlers()
		this.removeAllHoldHandlers()
		this.removeAllStateHandlers()
	}
	
	protected executePress() {
		if (this._soundPress) app.audio.play(this._soundPress)
		
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
	
	private onKeyDown(event: EventKeyboard) {
		if (!this._interactive) return
		
		if (event.keyCode == this._keyCode) {
			event.propagationStopped = true
			
			this._pressed = true
			this.updateState()
			this.startHold()
		}
	}
	
	private onKeyUp(event: EventKeyboard) {
		if (!this._interactive) return
		
		if (this._pressed && event.keyCode == this._keyCode) {
			event.propagationStopped = true
			this._pressed = false
			this.updateState()
			this.stopHold()
			this.executePress()
		}
	}
	
	private onTouchStart(event: EventTouch) {
		if (!this._interactive) {
			return
		}
		
		event.propagationStopped = true
		
		this._pressed = true
		this._moving = false
		this.updateState()
		this.startHold()
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
			this.stopHold()
			this.executePress()
		}
	}
	
	private doHold() {
		if (this._pressed && !this._moving) {
			this._pressed = false
			this.updateState()
			this.stopHold()
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
	
	private startHold() {
		if (this._holdable) {
			this._holdTask = app.assistant.schedule(1000, () => this.doHold())
		}
	}
	
	private stopHold() {
		this._holdTask.cancel()
		this._holdTask = Cancelable.DUMMY
	}
}

