declare namespace YaGames {
	function init(options: {}): Promise<YaSdk>
	
	const deviceInfo: {}
}

declare class YaSdk {
	public auth: {
		openAuthDialog():  Promise<any>
	}
	public getPlayer(options: {}): Promise<YaPlayer>
	
	public getPayments(options: {signed: boolean}): Promise<YaPayments>
}

declare class YaPayments {
	
	public purchase(params: {id: string; developerPayload?: string}): Promise<YaPurchase>
	
	public consumePurchase(purchaseToken: string)
	
	public getPurchases(): Promise<Array<YaPurchase>>
}

declare class YaPurchase {
	readonly productID: string
	readonly purchaseToken: string
	readonly developerPayload: string
	readonly signature: string
}

declare class YaPlayer {
	
	public getMode(): string
	
	public getUniqueID(): string
	
	public getName(): string
	
	public getPhoto(size: string): string
}