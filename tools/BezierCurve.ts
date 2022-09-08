import {bezier, IVec2Like, Vec2} from 'cc'

export class BezierCurve {
	public static randomPath(start: IVec2Like, end: IVec2Like, power: number): BezierCurve {
		const d = Vec2.distance(start, end)
		
		const kx = d / (end.x - start.x)
		const ky = d / (end.y - start.y)
		
		let dh = d / 2
		const d1 = dh * Math.random()
		const d2 = dh * Math.random() + dh
		
		const p1 = new Vec2(d1 / kx, d1 / ky)
		const p2 = new Vec2(d2 / kx, d2 / ky)
		
		p1.x += start.x
		p1.y += start.y
		p2.x += start.x
		p2.y += start.y
		
		const bound = d * power
		const bm = power / 100
		
		const f1 = d1 + (bm + bound * Math.random())
		const f2 = d2 - (bm + bound * Math.random())
		
		const o1 = new Vec2(f1 / kx, f1 / ky)
		const o2 = new Vec2(f2 / kx, f2 / ky)
		
		o1.x += start.x
		o1.y += start.y
		o2.x += start.x
		o2.y += start.y
		
		o1.subtract(p1)
		o2.subtract(p2)
		
		o1.rotate(Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1))
		o2.rotate(Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1))
		
		o1.add(p1)
		o2.add(p2)
		
		return new BezierCurve(
			start,
			end,
			o1,
			o2
		)
	}
	
	constructor(
		readonly a: IVec2Like,
		readonly e: IVec2Like,
		readonly c1: IVec2Like,
		readonly c2: IVec2Like
	) {}
	
	public x(t: number): number {
		return bezier(this.a.x, this.c1.x, this.c2.x, this.e.x, t)
	}
	
	public y(t: number): number {
		return bezier(this.a.y, this.c1.y, this.c2.y, this.e.y, t)
	}
}
