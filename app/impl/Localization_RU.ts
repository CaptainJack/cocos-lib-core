import {Long} from '../../capjack/tool/lang/Long'
import {_format} from '../../tools/_format'
import {AbstractLocalization} from './AbstractLocalization'

export class Localization_RU extends AbstractLocalization {
	
	public formatPrice(value: number | Long, currency: string): string {
		switch (currency) {
			case 'USD':
				return '$ ' + this.formatFractionNumber(value, 2)
			case 'EUR':
				return '€ ' + this.formatFractionNumber(value, 2)
			case 'GBP':
				return '£ ' + this.formatFractionNumber(value, 2)
			case 'RUB':
				return this.formatFractionNumber(value, 0) + ' ₽'
			case 'OK':
				return this.formatIntegerNumber(value) + ' ok'
			default:
				return this.formatFractionNumber(value, 2) + ' ' + currency
		}
	}
	
	public formatIntegerNumber(value: number | Long): string {
		return _format.formatIntegerNumber(value, this.config.thousandthSeparator)
	}
	
	public formatFractionNumber(value: number | Long, precision: number): string {
		return _format.formatFractionNumber(value, precision, this.config.thousandthSeparator, this.config.fractionSeparator)
	}
}

