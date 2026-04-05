import { defineConfig } from '@mikro-orm/postgresql'
import { Migrator } from '@mikro-orm/migrations'
import * as path from 'path'
import * as dotenv from 'dotenv'
import {
  User,
  Goal,
  SubTask,
  RecordEntity,
  ChatRoom,
  Message,
  NudgeSettings,
  SyncState,
  PushDevice,
} from './entities'

dotenv.config()

export default defineConfig({
  clientUrl: process.env.DATABASE_URL,
  entities: [
    User,
    Goal,
    SubTask,
    RecordEntity,
    ChatRoom,
    Message,
    NudgeSettings,
    SyncState,
    PushDevice,
  ],
  extensions: [Migrator],
  migrations: {
    path: path.join(__dirname, '../migrations'),
    pathTs: path.join(__dirname, '../migrations'),
    tableName: 'mikro_orm_migrations',
  },
  debug: process.env.NODE_ENV !== 'production',
})
