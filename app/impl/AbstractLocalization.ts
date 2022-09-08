import {Localization} from '../Localization'
import {LocalizationConfig} from './LocalizationConfig'
import {Long} from '../../capjack/tool/lang/Long'

export abstract class AbstractLocalization implements Localization {
	
	constructor(protected readonly config: LocalizationConfig) {
	}
	
	public abstract formatPrice(value: number | Long, currency?: string): string
	
	public abstract formatIntegerNumber(value: number | Long): string
	
	public abstract formatFractionNumber(value: number | Long, precision: number): string
}