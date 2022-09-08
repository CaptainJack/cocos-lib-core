export interface Closeable {
	close(): void
}

export namespace Closeable {
	export const DUMMY: Closeable = {
		close(): void {}
	}
}

