import {_decorator, Enum, EventTouch, NodeEventType, Vec2} from 'cc'
import {NormalizedComponent} from './NormalizedComponent'

export enum SwipeDirection {
	ANY,
	UP,
	DOWN,
	LEFT,
	RIGHT,
	VERTICAL,
	HORIZONTAL,
}

Enum(SwipeDirection)

@_decorator.ccclass('SwipeCatcher')
@_decorator.menu('lib/SwipeCatcher')
@_decorator.disallowMultiple(true)
export class SwipeCatcher extends NormalizedComponent {
	@_decorator.property({type: SwipeDirection})
	public direction: SwipeDirection = SwipeDirection.ANY
	
	@_decorator.property
	public length: number = 200
	
	private handlers: Array<(x: number, y: number) => void> = []
	
	private catching: boolean = false
	private touchStartPosition: Vec2
	
	public onSwipe(handler: (x: number, y: number) => void, target?: any) {
		if (target) handler = handler.bind(target)
		this.handlers.push(handler)
	}
	
	protected onEnable() {
		super.onEnable()
		
		this.node.on(NodeEventType.TOUCH_START, this.onTouchStart, this, true)
		this.node.on(NodeEventType.TOUCH_END, this.onTouchEnd, this, true)
		this.node.on(NodeEventType.TOUCH_CANCEL, this.onTouchCancel, this, true)
	}
	
	protected onDisable() {
		super.onDisable()
		
		this.node.off(NodeEventType.TOUCH_START, this.onTouchStart, this, true)
		this.node.off(NodeEventType.TOUCH_END, this.onTouchEnd, this, true)
		this.node.off(NodeEventType.TOUCH_CANCEL, this.onTouchCancel, this, true)
	}
	
	private onTouchStart(e: EventTouch) {
		this.catching = true
		this.touchStartPosition = e.getLocation()
	}
	
	private onTouchCancel(e: EventTouch) {
		this.onEnd(e)
	}
	
	private onTouchEnd(e: EventTouch) {
		this.onEnd(e)
	}
	
	private onEnd(e: EventTouch) {
		if (this.catching) {
			this.catching = false
			
			const start = this.touchStartPosition
			const end = e.getLocation()
			
			const dx = end.x - start.x
			const dy = end.y - start.y
			
			const dxa = Math.abs(dx)
			const dya = Math.abs(dy)
			
			const vertical = dxa < dya
			
			let caught: boolean = false
			
			switch (this.direction) {
				case SwipeDirection.ANY:
					caught = dxa >= this.length || dya >= this.length || Math.sqrt((dxa * dxa) + (dya * dya)) >= this.length
					break
				case SwipeDirection.UP:
					caught = vertical && dya >= this.length && end.y > start.y
					break
				case SwipeDirection.DOWN:
					caught = vertical && dya >= this.length && end.y < start.y
					break
				case SwipeDirection.LEFT:
					caught = !vertical && dxa >= this.length && end.x > start.x
					break
				case SwipeDirection.RIGHT:
					caught = !vertical && dxa >= this.length && end.x < start.x
					break
				case SwipeDirection.VERTICAL:
					caught = vertical && dya >= this.length
					break
				case SwipeDirection.HORIZONTAL:
					caught = !vertical && dxa >= this.length
					break
			}
			
			if (caught) {
				e.propagationStopped = true
				for (const handler of this.handlers) {
					handler(dx, dy)
				}
			}
		}
	}
}
