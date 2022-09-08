import {Component, Graphics, UITransform} from 'cc'

export interface RoundRectComponent {
	readonly radius: number
	readonly leftTop: boolean
	readonly leftBottom: boolean
	readonly rightTop: boolean
	readonly rightBottom: boolean
}

export namespace RoundRectComponent {
	export function draw(g: Graphics, c: RoundRectComponent & Component) {
		const t = c.getComponent(UITransform)
		
		let r = c.radius
		
		if (r == -1) {
			r = Math.min(t.width, t.height) / 2
		}
		
		g.clear()
		g.roundRect(-t.anchorX * t.width, -t.anchorY * t.height, t.width, t.height, r)
		
		if (!c.leftTop) {
			g.rect(-t.anchorX * t.width, t.anchorY * t.height, r, -r)
		}
		if (!c.leftBottom) {
			g.rect(-t.anchorX * t.width, -t.anchorY * t.height, r, r)
		}
		if (!c.rightTop) {
			g.rect(t.anchorX * t.width, t.anchorY * t.height, -r, -r)
		}
		if (!c.rightBottom) {
			g.rect(t.anchorX * t.width, -t.anchorY * t.height, -r, r)
		}
		
		g.fill()
	}
}