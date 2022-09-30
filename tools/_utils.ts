import {Color} from 'cc'

export function color(n: number): Color {
	return new Color(n >> 16 & 255, n >> 8 & 255, n & 255)
}