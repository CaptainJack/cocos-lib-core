import {_decorator, instantiate, Layout, Node, PageViewIndicator} from 'cc'
import {Button} from '../button/Button'

@_decorator.ccclass('NodePageViewIndicator')
@_decorator.menu('lib/ui/NodePageViewIndicator')
@_decorator.disallowMultiple(true)
@_decorator.requireComponent(Layout)
export class NodePageViewIndicator extends PageViewIndicator {
	@_decorator.property(Node)
	private nodeOn: Node
	
	@_decorator.property(Node)
	private nodeOff: Node
	
	@_decorator.property
	private showOne: boolean = false
	
	public onLoad() {
		this.nodeOn.removeFromParent()
		this.nodeOff.removeFromParent()
		
		super.onLoad()
	}
	
	public _changedState() {
		if (!this._pageView) return
		
		this.node.removeAllChildren()
		
		const pages = this._pageView.getPages().length
		const page = this._pageView.curPageIdx
		
		if (pages == 1 && !this.showOne) return
		
		for (let i = 0; i < pages; ++i) {
			let indicator: Node
			
			if (i == page) {
				indicator = instantiate(this.nodeOn)
			}
			else {
				indicator = instantiate(this.nodeOff)
				let button = indicator.getComponent(Button)
				if (!button) {
					button = indicator.addComponent(Button)
				}
				button.onPress(() => this.onPressIndicator(i))
			}
			
			this.node.addChild(indicator)
		}
		
		this.getComponent(Layout).updateLayout()
	}
	
	public _refresh() {
		this._changedState()
	}
	
	private onPressIndicator(i: number) {
		this._pageView.scrollToPage(i)
	}
}
