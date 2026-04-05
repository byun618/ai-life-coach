import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'nudge_settings' })
export class NudgeSettings {
  @PrimaryKey({ type: 'uuid' })
  userId: string

  @Property()
  enabled: boolean = true

  @Property()
  maxPerDay: number = 2

  @Property()
  timeStart: string = '09:00'

  @Property()
  timeEnd: string = '22:00'

  constructor(userId: string) {
    this.userId = userId
  }
}
