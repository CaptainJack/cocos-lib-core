import {TemporalAssistant} from '../capjack/tool/utils/assistant/TemporalAssistant'
import {Tweener} from './Tweener'
import {LocalStorage} from './LocalStorage'
import {Localization} from './Localization'
import {EventChannel} from '../events/EventChannel'
import {Audio} from './Audio'
import {Bundler} from './Bundler'
import {Assets} from './Assets'

export interface Application {
	readonly local: boolean
	readonly debug: boolean
	readonly assistant: TemporalAssistant
	readonly tweener: Tweener
	readonly storage: LocalStorage
	readonly localization: Localization
	readonly events: EventChannel<any>
	readonly audio: Audio
	readonly bundler: Bundler
	readonly assets: Assets
}

