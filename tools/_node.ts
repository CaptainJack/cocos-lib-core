import {Class} from '../capjack/tool/lang/_types'
import {Component, Node} from 'cc'

declare module 'cc' {
	interface Node {
		getChildComponent<T extends Component>(path: string, type: Class<T>): T
	}
	
	interface Component {
		getChildComponent<T extends Component>(path: string, type: Class<T>): T
	}
}

Node.prototype.getChildComponent = function<T extends Component>(path: string, type: Class<T>): T {
	return this.getChildByPath(path).getComponent(type)
}

Component.prototype.getChildComponent = function<T extends Component>(path: string, type: Class<T>): T {
	return this.node.getChildComponent(path, type)
}