import {Localization} from '../Localization'
import {LocalizationConfig} from './LocalizationConfig'
import {Long} from '../../capjack/tool/lang/Long'

export abstract class AbstractLocalization implements Localization {
	
	constructor(protected readonly config: LocalizationConfig) {
	}
	
	public abstract formatPrice(value: number, currency: string): string
	
	public abstract getPriceCurrency(value: number, currency: string): string
	
	public abstract isPriceCurrencyLeft(currency: string): boolean
	
	public abstract formatPriceValue(value: number, currency: string): string
	
	public abstract formatIntegerNumber(value: number | Long): string
	
	public abstract formatIntegerM(value: number): string
	
	public abstract formatFractionNumber(value: number | Long, precision: number, fixed: boolean): string
}