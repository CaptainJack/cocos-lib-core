import {CpdAccount} from './CpdAccount'

export interface CpdAdapter {
	authorize(): Promise<CpdAccount | null>
}
