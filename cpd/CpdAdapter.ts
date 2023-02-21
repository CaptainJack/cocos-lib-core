import {CpdAccount} from './CpdAccount'

export interface CpdAdapter {
	readonly authorized: boolean
	
	login(): Promise<CpdAccount>
	
	loadShop(ids: string[],
		receiver: (currency: string, products: Array<{id: string, price: number}>) => void,
		purchaseConsumer: (productId: string, orderId: string, receipt: string, successConsumer: () => void) => void
	): void
	
	purchase(
		product: {id: string, name: string, price: number},
		onSuccess: (orderId: string, receipt: string, successConsumer: () => void) => void,
		onFail: (reason: string) => void
	): void
	
	getAppFriends(): Promise<Array<string>>
	
	ready(): void
	
	authorize(): Promise<CpdAccount>
	
	isFullScreenAvailable():boolean
	
	isFullScreenCurrent():boolean
	
	enterFullScreen()
	
	exitFullScreen()
}