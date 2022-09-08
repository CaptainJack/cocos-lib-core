import {_decorator, Node, NodeEventType, UITransform, Vec2, widgetManager} from 'cc'
import {NormalizedComponent} from '../NormalizedComponent'

@_decorator.ccclass('Wrapper')
@_decorator.menu('lib/layout/Wrapper')
@_decorator.disallowMultiple(true)
export class Wrapper extends NormalizedComponent {
	
	@_decorator.property
	private _vertical: boolean = false
	
	@_decorator.property
	private _horizontal: boolean = false
	
	@_decorator.property([Node])
	private _targets: Array<Node> = []
	
	@_decorator.property([Node])
	public get targets(): Array<Node> {
		return this._targets
	}
	
	public set targets(value: Array<Node>) {
		for (const target of this._targets) {
			if (target) target.off(NodeEventType.SIZE_CHANGED, this.wrap, this)
		}
		
		this._targets = value
		
		for (const target of this._targets) {
			if (target) target.on(NodeEventType.SIZE_CHANGED, this.wrap, this)
		}
	}
	
	@_decorator.property
	public get vertical(): boolean {
		return this._vertical
	}
	
	public set vertical(value: boolean) {
		this._vertical = value
		this.wrap()
	}
	
	@_decorator.property
	public get horizontal(): boolean {
		return this._horizontal
	}
	
	public set horizontal(value: boolean) {
		this._horizontal = value
		this.wrap()
	}
	
	protected onLoad() {
		super.onLoad()
		
		this.wrap()
		
		for (const target of this._targets) {
			target.off(NodeEventType.SIZE_CHANGED, this.wrap, this)
			target.on(NodeEventType.SIZE_CHANGED, this.wrap, this)
		}
	}
	
	protected wrap() {
		const size = new Vec2(0, 0)
		
		for (const target of this._targets) {
			let t = target.getComponent(UITransform)
			size.x = Math.max(t.width, size.x)
			size.y = Math.max(t.height, size.y)
		}
		
		let t = this.getComponent(UITransform)
		
		if (this._vertical && this._horizontal) {
			t.setContentSize(size.x, size.y)
		}
		else if (this._vertical) {
			t.height = size.y
		}
		else if (this._horizontal) {
			t.width = size.x
		}
		
		widgetManager.onResized()
	}
}