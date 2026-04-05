import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core'
import { v4 } from 'uuid'
import { ChatRoom } from './chat-room.entity'

export enum MessageRole {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system',
}

@Entity({ tableName: 'messages' })
export class Message {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4()

  @ManyToOne(() => ChatRoom)
  chatRoom: ChatRoom

  @Enum(() => MessageRole)
  role: MessageRole

  @Property({ type: 'text' })
  content: string

  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>

  @Property()
  createdAt: Date = new Date()

  constructor(chatRoom: ChatRoom, role: MessageRole, content: string) {
    this.chatRoom = chatRoom
    this.role = role
    this.content = content
  }
}
