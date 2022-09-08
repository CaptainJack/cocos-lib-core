export interface LoadingProcess {
	readonly progress: number
	readonly completed: boolean
	
	onComplete(handler: () => void)
}

