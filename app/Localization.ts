import {Long} from '../capjack/tool/lang/Long'

export interface Localization {
	formatPrice(value: number | Long, currency?: string): string
	
	formatIntegerNumber(value: number | Long): string
	
	formatFractionNumber(value: number | Long, precision: number): string
}