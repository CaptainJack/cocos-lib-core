import {CpdAccount} from './CpdAccount'

export interface CpdAdapter {
	authorize(): Promise<CpdAccount | null>
	
	loadShop(ids: string[], receiver: (currency: string, products: Array<{id: string, price: number}>) => void): void
	
	purchase(
		product: {id: string, name: string, price: number},
		onSuccess: (orderId: string, receipt: string, successConsumer: () => void) => void,
		onFail: (reason: string) => void
	): void
}