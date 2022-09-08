import {ObjectPool} from '../../../tool/utils/pool/ObjectPool'
import {ByteBuffer} from '../../../tool/io/ByteBuffer'
import {OutgoingMessage} from './OutgoingMessage'
import {ProtocolMarker} from './ProtocolMarker'
import {DummyByteBuffer} from '../../../tool/io/DummyByteBuffer'
import {InputByteBuffer} from '../../../tool/io/InputByteBuffer'

export class OutgoingMessageBuffer {
	private readonly cache: Message[] = []
	private nextMessageId: number = 1
	private head: Message | null = null
	private tail: Message | null = null
	
	constructor(private readonly buffers: ObjectPool<ByteBuffer>) {}
	
	add(data: InputByteBuffer): OutgoingMessage {
		let message = this.provideMessage(data.readableSize)
		message.data.writeBuffer(data)
		return message
	}
	
	iterate(fn: (m: OutgoingMessage) => void) {
		let m = this.head
		while (m != null) {
			m.reset()
			fn(m)
			m = m.next
		}
	}
	
	clearTo(messageId: number) {
		let message = this.head
		
		if (message != null) {
			if (message.id == messageId) {
				this.head = message.next
				message.clear()
				this.cache.push(message)
			}
			else {
				while (message != null && message.id != messageId) {
					message = message.next
				}
				
				if (message != null) {
					this.head = message.next
					
					while (message != null) {
						let prev = message.prev
						message.clear()
						this.cache.push(message)
						message = prev
					}
				}
			}
			
			let h = this.head
			if (h == null) {
				this.tail = null
			}
			else {
				h.prev = null
			}
		}
	}
	
	dispose() {
		let current = this.head
		while (current != null) {
			let next = current.next
			current.dispose(this.buffers)
			current = next
		}
		
		for (let message of this.cache) {
			message.dispose(this.buffers)
		}
		
		this.cache.length = 0
		this.head = null
		this.tail = null
	}
	
	private provideMessage(size: number): Message {
		let message = (this.cache.length == 0)
			? new Message(this.buffers.take())
			: this.cache.pop()
		
		message.prepare(this.nextMessageId++, size)
		
		if (this.head == null) {
			this.head = message
		}
		message.prev = this.tail
		
		if (this.tail != null) {
			this.tail.next = message
		}
		this.tail = message
		
		return message
	}
}

class Message implements OutgoingMessage {
	
	public id: number = 0
	public size: number = 0
	
	public prev: Message | null = null
	public next: Message | null = null
	
	constructor(
		public data: ByteBuffer
	) {}
	
	prepare(id: number, size: number) {
		this.id = id
		this.size = size
		
		this.data.writeByte(ProtocolMarker.MESSAGING_NEW)
		this.data.writeInt(id)
		this.data.writeInt(size)
	}
	
	reset() {
		this.data.backRead((this.size + 1 + 4 + 4) - this.data.readableSize)
	}
	
	clear() {
		this.id = 0
		this.size = 0
		this.next = null
		this.prev = null
		this.data.clear()
	}
	
	dispose(buffers: ObjectPool<ByteBuffer>) {
		this.clear()
		buffers.back(this.data)
		this.data = DummyByteBuffer.INSTANCE
	}
}