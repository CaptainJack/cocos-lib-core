import {Long} from '../capjack/tool/lang/Long'

export interface Localization {
	formatPrice(value: number, currency: string): string
	
	formatPriceValue(value: number, currency: string): string
	
	getPriceCurrency(value: number, currency: string): string
	
	isPriceCurrencyLeft(currency: string): boolean
	
	formatIntegerNumber(value: number | Long): string
	
	formatIntegerM(value: number): string
	
	formatFractionNumber(value: number | Long, precision: number, fixed: boolean): string
	
}