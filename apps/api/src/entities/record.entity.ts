import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core'
import { v4 } from 'uuid'
import { Goal } from './goal.entity'
import { Message } from './message.entity'

@Entity({ tableName: 'records' })
export class RecordEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4()

  @ManyToOne(() => Goal, { nullable: true })
  goal?: Goal

  @ManyToOne(() => Message, { nullable: true })
  sourceMessage?: Message

  @Property({ type: 'text' })
  content: string

  @Property()
  recordedAt: Date

  @Property()
  createdAt: Date = new Date()

  constructor(content: string, recordedAt: Date) {
    this.content = content
    this.recordedAt = recordedAt
  }
}
