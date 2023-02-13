export interface LoadingProcess<R> {
	readonly progress: number
	readonly completed: boolean
	
	onComplete(handler: (result: R) => void)
}

