import {Long} from '../capjack/tool/lang/Long'

export interface Localization {
	formatPrice(value: number, currency: string): string
	
	formatPriceValue(value: number, currency: string): string
	
	getPriceCurrency(value: number, currency: string): string
	
	isPriceCurrencyLeft(currency: string): boolean
	
	formatIntegerNumber(value: number | Long): string
	
	formatFractionNumber(value: number | Long, precision: number): string
}