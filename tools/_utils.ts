import {Color} from 'cc'

export function color(n: number, alpha: number = 1): Color {
	return new Color(n >> 16 & 255, n >> 8 & 255, n & 255, 0xFF * alpha)
}