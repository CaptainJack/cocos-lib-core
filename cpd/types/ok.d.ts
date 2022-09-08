declare namespace FAPI {
	function init(url: string, connection: string, onSuccess: () => void, onError: (error) => void)
	
	type CallbackStatus = 'ok' | 'error'
	
	namespace Client {
		function call(params: any, callback: (status: CallbackStatus, data: any, error: any) => void)
	}
	
	namespace UI {
		function showPayment(
			name: string,
			description: string,
			code: string,
			price: number,
			options?: null,
			attributes?: string,
			currency?: null,
			callback?: 'true' | 'false',
			uiConf?: string
		)
	}
}