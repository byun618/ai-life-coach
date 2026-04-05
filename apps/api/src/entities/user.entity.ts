import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 } from 'uuid'

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4()

  @Property()
  name: string

  @Property()
  createdAt: Date = new Date()

  constructor(name: string) {
    this.name = name
  }
}
