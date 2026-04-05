import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'sync_states' })
export class SyncState {
  @PrimaryKey()
  id: string = 'singleton'

  @Property()
  repoPath: string

  @Property({ nullable: true })
  lastSyncedAt?: Date

  @Property({ type: 'jsonb', nullable: true })
  lastScanResult?: Record<string, unknown>

  constructor(repoPath: string) {
    this.repoPath = repoPath
  }
}
