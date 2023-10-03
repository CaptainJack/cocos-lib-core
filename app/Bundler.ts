import {LoadingProcess} from '../loading/LoadingProcess'

export interface Bundler {
	load(name: string): LoadingProcess<void>
	
	unload(name: string): void
	
	onLoaded(name: string, handler: () => void): void
}