import { Migration } from '@mikro-orm/migrations';

export class Migration20260405082513 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "nudge_settings" ("user_id" uuid not null, "enabled" boolean not null default true, "max_per_day" int not null default 2, "time_start" varchar(255) not null default '09:00', "time_end" varchar(255) not null default '22:00', constraint "nudge_settings_pkey" primary key ("user_id"));`);

    this.addSql(`create table "sync_states" ("id" varchar(255) not null default 'singleton', "repo_path" varchar(255) not null, "last_synced_at" timestamptz null, "last_scan_result" jsonb null, constraint "sync_states_pkey" primary key ("id"));`);

    this.addSql(`create table "users" ("id" uuid not null, "name" varchar(255) not null, "created_at" timestamptz not null, constraint "users_pkey" primary key ("id"));`);

    this.addSql(`create table "push_devices" ("id" uuid not null, "user_id" uuid not null, "fcm_token" varchar(255) not null, "device_id" varchar(255) not null, "created_at" timestamptz not null, constraint "push_devices_pkey" primary key ("id"));`);
    this.addSql(`alter table "push_devices" add constraint "push_devices_fcm_token_unique" unique ("fcm_token");`);

    this.addSql(`create table "goals" ("id" uuid not null, "user_id" uuid not null, "title" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "goals_pkey" primary key ("id"));`);

    this.addSql(`create table "subtasks" ("id" uuid not null, "goal_id" uuid not null, "title" varchar(255) not null, "completed" boolean not null default false, "order" int not null, "created_at" timestamptz not null, constraint "subtasks_pkey" primary key ("id"));`);

    this.addSql(`create table "chat_rooms" ("id" uuid not null, "user_id" uuid not null, "type" text check ("type" in ('global', 'goal')) not null, "goal_id" uuid null, "title" varchar(255) not null, "last_message_at" timestamptz null, "claude_session_id" varchar(255) null, "created_at" timestamptz not null, constraint "chat_rooms_pkey" primary key ("id"));`);

    this.addSql(`create table "messages" ("id" uuid not null, "chat_room_id" uuid not null, "role" text check ("role" in ('user', 'ai', 'system')) not null, "content" text not null, "metadata" jsonb null, "created_at" timestamptz not null, constraint "messages_pkey" primary key ("id"));`);

    this.addSql(`create table "records" ("id" uuid not null, "goal_id" uuid null, "source_message_id" uuid null, "content" text not null, "recorded_at" timestamptz not null, "created_at" timestamptz not null, constraint "records_pkey" primary key ("id"));`);

    this.addSql(`alter table "push_devices" add constraint "push_devices_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);

    this.addSql(`alter table "goals" add constraint "goals_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);

    this.addSql(`alter table "subtasks" add constraint "subtasks_goal_id_foreign" foreign key ("goal_id") references "goals" ("id") on update cascade;`);

    this.addSql(`alter table "chat_rooms" add constraint "chat_rooms_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);
    this.addSql(`alter table "chat_rooms" add constraint "chat_rooms_goal_id_foreign" foreign key ("goal_id") references "goals" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "messages" add constraint "messages_chat_room_id_foreign" foreign key ("chat_room_id") references "chat_rooms" ("id") on update cascade;`);

    this.addSql(`alter table "records" add constraint "records_goal_id_foreign" foreign key ("goal_id") references "goals" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "records" add constraint "records_source_message_id_foreign" foreign key ("source_message_id") references "messages" ("id") on update cascade on delete set null;`);
  }

}
