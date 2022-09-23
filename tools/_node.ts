import {Class} from '../capjack/tool/lang/_types'
import {Component, Node, UIRenderer, sys, UIOpacity, UITransform} from 'cc'
import {require} from '../capjack/tool/lang/_utils'
import {IllegalArgumentException} from '../capjack/tool/lang/exceptions/IllegalArgumentException'

export const SKELETON_EMPTY_ATTACHMENT = sys.isNative ? '' : null

declare module 'cc' {
	
	interface Extension {
		getChildComponent<T extends Component>(path: string, type: Class<T>): T
		
		getChild(path: string): Node
		
		setOpacity(percent: number)
		
		setScaleFully(percent: number)
		
		setWidth(value: number)
		
		getWidth(): number
		
		setHeight(value: number)
		
		getHeight(): number
		
		setX(value: number)
		
		setY(value: number)
		
		setScaleX(percent: number)
		
		setScaleY(percent: number)
	}
	
	interface Node extends Extension {
		addChildWithKeepPosition(child: Node)
	}
	
	interface Component extends Extension {}
}

Node.prototype.addChildWithKeepPosition = function (child: Node) {
	const position = child.worldPosition.clone()
	this.addChild(child)
	child.setWorldPosition(position)
}

Node.prototype.getChildComponent = function <T extends Component>(path: string, type: Class<T>): T {
	const node = this.getChild(path)
	return node ? node.getComponent(type) : null
}

Node.prototype.getChild = function (path: string): Node {
	let c = this.getChildByPath(path)
	if (c) {
		return c
	}
	
	let i = path.indexOf('/')
	if (i > 0) {
		const n = this.getChild(path.substring(0, i))
		if (n) {
			return n.getChild(path.substring(i + 1))
		}
	}
	else {
		for (c of this.children) {
			c = c.getChild(path)
			if (c) {
				return c
			}
		}
	}
	return null
}

Node.prototype.setOpacity = function (percent: number) {
	require(percent >= 0 && percent <= 1)
	
	const opacity = 255 * percent
	const opacityComponent: UIOpacity = this.getComponent(UIOpacity)
	
	if (opacityComponent) {
		opacityComponent.opacity = opacity
	}
	else {
		const renderableComponent = this.getComponent(UIRenderer)
		if (renderableComponent) {
			const color = renderableComponent.color.clone()
			color.a = opacity
			renderableComponent.color = color
		}
		else {
			throw new IllegalArgumentException('UIOpacity or UIRenderer component required')
		}
	}
}

Node.prototype.setScaleFully = function (value: number) {
	this.setScale(value, value)
}

Node.prototype.setWidth = function (value: number) {
	this.getComponent(UITransform).width = value
}

Node.prototype.setHeight = function (value: number) {
	this.getComponent(UITransform).height = value
}

Node.prototype.getWidth = function (): number {
	return this.getComponent(UITransform).width
}

Node.prototype.getHeight = function (): number {
	return this.getComponent(UITransform).height
}

Node.prototype.setX = function (value: number) {
	this.setPosition(value, this.position.y)
}

Node.prototype.setY = function (value: number) {
	this.setPosition(this.position.x, value)
}

Node.prototype.setScaleX = function (percent: number) {
	this.setScale(percent, this.scale.y)
}

Node.prototype.setScaleY = function (percent: number) {
	this.setScale(this.scale.x, percent)
}

///

Component.prototype.getChildComponent = function <T extends Component>(path: string, type: Class<T>): T {
	return this.node.getChildComponent(path, type)
}

Component.prototype.getChild = function(path: string): Node {
	return this.node.getChild(path)
}

Component.prototype.setOpacity = function (percent: number) {
	this.node.setOpacity(percent)
}

Component.prototype.setScaleFully = function (percent: number) {
	this.node.setScaleFully(percent)
}

Component.prototype.setWidth = function (value: number) {
	this.node.setWidth(value)
}

Component.prototype.getWidth = function():number {
	return this.node.getWidth()
}

Component.prototype.setHeight = function (value: number) {
	this.node.setHeight(value)
}

Component.prototype.getHeight = function():number {
	return this.node.getHeight()
}

Component.prototype.setX = function (value: number) {
	this.node.setX(value)
}

Component.prototype.setY = function (value: number) {
	this.node.setY(value)
}

Component.prototype.setScaleX = function (value: number) {
	this.node.setScaleX(value)
}

Component.prototype.setScaleY = function (value: number) {
	this.node.setScaleY(value)
}