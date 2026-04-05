import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core'
import { v4 } from 'uuid'
import { User } from './user.entity'

@Entity({ tableName: 'push_devices' })
export class PushDevice {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4()

  @ManyToOne(() => User)
  user: User

  @Property({ unique: true })
  fcmToken: string

  @Property()
  deviceId: string

  @Property()
  createdAt: Date = new Date()

  constructor(user: User, fcmToken: string, deviceId: string) {
    this.user = user
    this.fcmToken = fcmToken
    this.deviceId = deviceId
  }
}
