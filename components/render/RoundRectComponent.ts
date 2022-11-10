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
		
		const K = 1 - 0.5522847493
		
		const x = -t.anchorX * t.width
		const y = -t.anchorY * t.height
		const w = t.width
		const h = t.height
		
		let r = c.radius
		
		if (r == -1) {
			r = Math.min(w, h) / 2
		}
		
		const rx_lt = c.leftTop ? Math.min(r, Math.abs(w)) * Math.sign(w) : 0
		const ry_lt = c.leftTop ? Math.min(r, Math.abs(h)) * Math.sign(h) : 0
		
		const rx_lb = c.leftBottom ? Math.min(r, Math.abs(w)) * Math.sign(w) : 0
		const ry_lb = c.leftBottom ? Math.min(r, Math.abs(h)) * Math.sign(h) : 0
		
		const rx_rt = c.rightTop ? Math.min(r, Math.abs(w)) * Math.sign(w) : 0
		const ry_rt = c.rightTop ? Math.min(r, Math.abs(h)) * Math.sign(h) : 0
		
		const rx_rb = c.rightBottom ? Math.min(r, Math.abs(w)) * Math.sign(w) : 0
		const ry_rb = c.rightBottom ? Math.min(r, Math.abs(h)) * Math.sign(h) : 0
		
		g.clear()
		
		g.moveTo(x, y + ry_lb)
		g.lineTo(x, y + h - ry_lt)
		g.bezierCurveTo(x, y + h - ry_lt * K, x + rx_lt * K, y + h, x + rx_lt, y + h)
		g.lineTo(x + w - rx_rt, y + h)
		g.bezierCurveTo(x + w - rx_rt * K, y + h, x + w, y + h - ry_rt * K, x + w, y + h - ry_rt)
		g.lineTo(x + w, y + ry_rb)
		g.bezierCurveTo(x + w, y + ry_rb * K, x + w - rx_rb * K, y, x + w - rx_rb, y)
		g.lineTo(x + rx_lb, y)
		g.bezierCurveTo(x + rx_lb * K, y, x, y + ry_lb * K, x, y + ry_lb)
		g.close()
	}
}