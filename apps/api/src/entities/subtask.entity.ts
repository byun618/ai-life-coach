import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core'
import { v4 } from 'uuid'
import { Goal } from './goal.entity'

@Entity({ tableName: 'subtasks' })
export class SubTask {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4()

  @ManyToOne(() => Goal)
  goal: Goal

  @Property()
  title: string

  @Property()
  completed: boolean = false

  @Property()
  order: number

  @Property()
  createdAt: Date = new Date()

  constructor(goal: Goal, title: string, order: number) {
    this.goal = goal
    this.title = title
    this.order = order
  }
}
