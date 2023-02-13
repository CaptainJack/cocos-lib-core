import {Asset, AssetManager, Sprite, SpriteFrame} from 'cc'
import {Class} from '../capjack/tool/lang/_types'
import {LoadingProcess} from '../loading/LoadingProcess'

export interface Assets {
	exists(path: string): boolean
	
	get<T extends Asset>(path: string, type: Class<T>): T
	
	getOrNull<T extends Asset>(path: string, type: Class<T>): T | null
	
	loadBundle(name: string): LoadingProcess<AssetManager.Bundle>
	
	unloadBundle(name: string)
	
	loadExternalImage(path: string, target?: Sprite): LoadingProcess<SpriteFrame>
	
	loadOutsideImage(url: string, target?: Sprite): LoadingProcess<SpriteFrame>
}