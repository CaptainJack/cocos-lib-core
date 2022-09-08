import {InnerApi} from './InnerApi'
import {OuterApi} from '../OuterApi'
import {ConnectFailReason} from '../../core/client/ConnectFailReason'

export interface ApiSluice<IA extends InnerApi, OA extends OuterApi> {
	connect(server: OA): IA

	fail(reason: ConnectFailReason)
}