import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
} from '@mikro-orm/core'
import { v4 } from 'uuid'
import { User } from './user.entity'
import { SubTask } from './subtask.entity'
import { RecordEntity } from './record.entity'

@Entity({ tableName: 'goals' })
export class Goal {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4()

  @ManyToOne(() => User)
  user: User

  @Property()
  title: string

  @OneToMany(() => SubTask, (s) => s.goal)
  subtasks = new Collection<SubTask>(this)

  @OneToMany(() => RecordEntity, (r) => r.goal)
  records = new Collection<RecordEntity>(this)

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  constructor(user: User, title: string) {
    this.user = user
    this.title = title
  }
}
