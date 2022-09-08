import {RealSound} from './RealSound'
import {Volumeable} from '../../Audio'

export interface RealSoundOwner extends Volumeable {
	releaseSound(sound: RealSound)
}