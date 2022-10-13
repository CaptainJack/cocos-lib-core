import {Long} from '../../capjack/tool/lang/Long'
import {_format} from '../../tools/_format'
import {AbstractLocalization} from './AbstractLocalization'

export class Localization_RU extends AbstractLocalization {
	
	public formatPrice(value: number, currency: string): string {
		if (this.isPriceCurrencyLeft(currency)) {
			return this.getPriceCurrency(value, currency) + ' ' + this.formatPriceValue(value, currency)
		}
		return this.formatPriceValue(value, currency) + ' ' + this.getPriceCurrency(value, currency)
	}
	
	public formatPriceValue(value: number, currency: string): string {
		switch (currency) {
			case 'RUB':
				return this.formatFractionNumber(value, 0)
			case 'OK':
				return this.formatIntegerNumber(value)
			case 'VK':
				return this.formatIntegerNumber(value)
			default:
				return this.formatFractionNumber(value, 2)
		}
	}
	
	public getPriceCurrency(value: number, currency: string): string {
		switch (currency) {
			case 'USD':
				return '$'
			case 'EUR':
				return '€'
			case 'GBP':
				return '£'
			case 'RUB':
				return '₽'
			case 'OK':
				return 'OK'
			case 'VK':
				return _format.defineWordDeclinationRu(value, 'голос', 'голоса', 'голосов')
			default:
				return currency
		}
	}
	
	public isPriceCurrencyLeft(currency: string): boolean {
		switch (currency) {
			case 'USD':
			case 'EUR':
			case 'GBP':
				return true;
			default:
				return false;
		}
	}
	
	
	public formatIntegerNumber(value: number | Long): string {
		return _format.formatIntegerNumber(value, this.config.thousandthSeparator)
	}
	
	public formatFractionNumber(value: number | Long, precision: number): string {
		return _format.formatFractionNumber(value, precision, this.config.thousandthSeparator, this.config.fractionSeparator)
	}
}

