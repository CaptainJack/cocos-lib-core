declare namespace YaGames {
	function init(options: {}): Promise<YaSdk>
	
	const deviceInfo: {
		isMobile(): boolean
	}
}

declare class YaSdk {
	public auth: {
		openAuthDialog(): Promise<any>
	}
	
	public features: {
		LoadingAPI: YaLoadingAPI
	}
	public screen: {
		fullscreen: YaFullscreen
	}
	
	public getPlayer(options: {}): Promise<YaPlayer>
	
	public getPayments(options: {signed: boolean}): Promise<YaPayments>
}

declare class YaLoadingAPI {
	public ready()
}

declare class YaFullscreen {
	readonly STATUS_ON: string
	readonly STATUS_OFF: string
	readonly status: string
	
	request(): Promise<void>
	
	exit(): Promise<void>
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