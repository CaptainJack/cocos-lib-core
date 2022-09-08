import {_hex} from '../../../tool/lang/_hex'

export const ProtocolMarker = {
	AUTHORIZATION: 0x10,
	RECOVERY: 0x11,
	
	MESSAGING_PING: 0x20,
	MESSAGING_NEW: 0x21,
	MESSAGING_RECEIVED: 0x22,
	
	CLOSE_DEFINITELY: 0x30,
	CLOSE_PROTOCOL_BROKEN: 0x31,
	CLOSE_ERROR: 0x32,
	CLOSE_ACTIVITY_TIMEOUT: 0x33,
	
	SERVER_SHUTDOWN_TIMEOUT: 0x40,
	
	SERVER_CLOSE_VERSION: 0x50,
	SERVER_CLOSE_AUTHORIZATION: 0x51,
	SERVER_CLOSE_RECOVERY_FAIL: 0x52,
	SERVER_CLOSE_CONCURRENT: 0x53,
	SERVER_CLOSE_SHUTDOWN: 0x54,
	
	toString(marker: number): String {
		return `${this.getName(marker)}(0x${_hex.byteToHexString(marker)})`
	},

	getName(marker: number): String {
		switch (marker) {
			case this.AUTHORIZATION              : return "AUTHORIZATION";
			case this.RECOVERY                   : return "RECOVERY";
			case this.MESSAGING_PING             : return "MESSAGING_PING";
			case this.MESSAGING_NEW              : return "MESSAGING_NEW";
			case this.MESSAGING_RECEIVED         : return "MESSAGING_RECEIVED";
			case this.CLOSE_DEFINITELY           : return "CLOSE_DEFINITELY";
			case this.CLOSE_PROTOCOL_BROKEN      : return "CLOSE_PROTOCOL_BROKEN";
			case this.CLOSE_ERROR                : return "CLOSE_ERROR";
			case this.CLOSE_ACTIVITY_TIMEOUT     : return "CLOSE_ACTIVITY_TIMEOUT";
			case this.SERVER_SHUTDOWN_TIMEOUT    : return "SERVER_SHUTDOWN_TIMEOUT";
			case this.SERVER_CLOSE_VERSION       : return "SERVER_CLOSE_VERSION";
			case this.SERVER_CLOSE_AUTHORIZATION : return "SERVER_CLOSE_AUTHORIZATION";
			case this.SERVER_CLOSE_RECOVERY_FAIL : return "SERVER_CLOSE_RECOVERY_FAIL";
			case this.SERVER_CLOSE_CONCURRENT    : return "SERVER_CLOSE_CONCURRENT";
			case this.SERVER_CLOSE_SHUTDOWN      : return "SERVER_CLOSE_SHUTDOWN";
			default:                               return "UNKNOWN";
		}
	}
}