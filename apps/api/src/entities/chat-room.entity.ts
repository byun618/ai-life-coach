import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core'
import { v4 } from 'uuid'
import { User } from './user.entity'
import { Goal } from './goal.entity'

export enum ChatRoomType {
  GLOBAL = 'global',
  GOAL = 'goal',
}

@Entity({ tableName: 'chat_rooms' })
export class ChatRoom {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4()

  @ManyToOne(() => User)
  user: User

  @Enum(() => ChatRoomType)
  type: ChatRoomType

  @ManyToOne(() => Goal, { nullable: true })
  goal?: Goal

  @Property()
  title: string

  @Property({ nullable: true })
  lastMessageAt?: Date

  @Property({ nullable: true })
  claudeSessionId?: string

  @Property()
  createdAt: Date = new Date()

  constructor(user: User, type: ChatRoomType, title: string) {
    this.user = user
    this.type = type
    this.title = title
  }
}
