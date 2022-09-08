import {TemporalAssistant} from '../capjack/tool/utils/assistant/TemporalAssistant'
import {Tweener} from './Tweener'
import {LocalStorage} from './LocalStorage'
import {Localization} from './Localization'
import {EventChannel} from '../events/EventChannel'
import {Audio} from './Audio'

export interface Application {
	readonly devMode: boolean
	readonly assistant: TemporalAssistant
	readonly tweener: Tweener
	readonly storage: LocalStorage
	readonly localization: Localization
	readonly events: EventChannel<object>
	readonly audio: Audio
}
