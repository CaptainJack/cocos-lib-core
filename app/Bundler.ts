import {LoadingProcess} from '../loading/LoadingProcess'

export interface Bundler {
	load(names: string | Array<string>): LoadingProcess
	
	unload(names: string | Array<string>): void
	
	onLoaded(name: string, handler: () => void)
	
	loadWithAssets(bundle: string, assets: Array<string>): LoadingProcess
	
	unloadWithoutAssets(bundle: string, assets: Array<string>)
}