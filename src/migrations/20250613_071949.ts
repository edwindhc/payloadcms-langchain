import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_projects\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`proyecto_id\` integer NOT NULL,
  	FOREIGN KEY (\`proyecto_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_projects_order_idx\` ON \`users_projects\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_projects_parent_id_idx\` ON \`users_projects\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`users_projects_proyecto_idx\` ON \`users_projects\` (\`proyecto_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`projects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`code\` text NOT NULL,
  	\`status\` text NOT NULL,
  	\`firm_rate\` text NOT NULL,
  	\`name\` text NOT NULL,
  	\`description\` text NOT NULL,
  	\`comment\` text,
  	\`manager\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_code_idx\` ON \`projects\` (\`code\`);`)
  await db.run(sql`CREATE INDEX \`projects_updated_at_idx\` ON \`projects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`projects_created_at_idx\` ON \`projects\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`master_data\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`code\` text NOT NULL,
  	\`name\` text NOT NULL,
  	\`description\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`master_data_code_idx\` ON \`master_data\` (\`code\`);`)
  await db.run(sql`CREATE INDEX \`master_data_updated_at_idx\` ON \`master_data\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`master_data_created_at_idx\` ON \`master_data\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`master_value\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`description\` text NOT NULL,
  	\`type_id\` integer NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`type_id\`) REFERENCES \`master_data\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`master_value_type_idx\` ON \`master_value\` (\`type_id\`);`)
  await db.run(sql`CREATE INDEX \`master_value_updated_at_idx\` ON \`master_value\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`master_value_created_at_idx\` ON \`master_value\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`employees\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`surname\` text NOT NULL,
  	\`start_date\` text NOT NULL,
  	\`end_date\` text,
  	\`category_id\` integer NOT NULL,
  	\`sub_category_id\` integer NOT NULL,
  	\`technology_id\` integer NOT NULL,
  	\`main_skill_id\` integer NOT NULL,
  	\`secondary_skill_id\` integer NOT NULL,
  	\`email\` text NOT NULL,
  	\`project_id\` integer NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`master_value\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`sub_category_id\`) REFERENCES \`master_value\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`technology_id\`) REFERENCES \`master_value\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`main_skill_id\`) REFERENCES \`master_value\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`secondary_skill_id\`) REFERENCES \`master_value\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`employees_category_idx\` ON \`employees\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`employees_sub_category_idx\` ON \`employees\` (\`sub_category_id\`);`)
  await db.run(sql`CREATE INDEX \`employees_technology_idx\` ON \`employees\` (\`technology_id\`);`)
  await db.run(sql`CREATE INDEX \`employees_main_skill_idx\` ON \`employees\` (\`main_skill_id\`);`)
  await db.run(sql`CREATE INDEX \`employees_secondary_skill_idx\` ON \`employees\` (\`secondary_skill_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`employees_email_idx\` ON \`employees\` (\`email\`);`)
  await db.run(sql`CREATE INDEX \`employees_project_idx\` ON \`employees\` (\`project_id\`);`)
  await db.run(sql`CREATE INDEX \`employees_updated_at_idx\` ON \`employees\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`employees_created_at_idx\` ON \`employees\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`teams\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`proyecto_id\` integer,
  	\`name\` text NOT NULL,
  	\`description\` text,
  	\`leader_id\` integer NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`proyecto_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`leader_id\`) REFERENCES \`employees\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`teams_proyecto_idx\` ON \`teams\` (\`proyecto_id\`);`)
  await db.run(sql`CREATE INDEX \`teams_leader_idx\` ON \`teams\` (\`leader_id\`);`)
  await db.run(sql`CREATE INDEX \`teams_updated_at_idx\` ON \`teams\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`teams_created_at_idx\` ON \`teams\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`teams_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`employees_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`teams\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`employees_id\`) REFERENCES \`employees\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`teams_rels_order_idx\` ON \`teams_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`teams_rels_parent_idx\` ON \`teams_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`teams_rels_path_idx\` ON \`teams_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`teams_rels_employees_id_idx\` ON \`teams_rels\` (\`employees_id\`);`)
  await db.run(sql`CREATE TABLE \`conversations_messages\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`role\` text NOT NULL,
  	\`content\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`conversations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`conversations_messages_order_idx\` ON \`conversations_messages\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`conversations_messages_parent_id_idx\` ON \`conversations_messages\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`conversations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`proyecto_id\` integer,
  	\`title\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`proyecto_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`conversations_proyecto_idx\` ON \`conversations\` (\`proyecto_id\`);`)
  await db.run(sql`CREATE INDEX \`conversations_updated_at_idx\` ON \`conversations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`conversations_created_at_idx\` ON \`conversations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`projects_id\` integer,
  	\`master_data_id\` integer,
  	\`master_value_id\` integer,
  	\`employees_id\` integer,
  	\`teams_id\` integer,
  	\`conversations_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`master_data_id\`) REFERENCES \`master_data\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`master_value_id\`) REFERENCES \`master_value\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`employees_id\`) REFERENCES \`employees\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`teams_id\`) REFERENCES \`teams\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`conversations_id\`) REFERENCES \`conversations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_projects_id_idx\` ON \`payload_locked_documents_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_master_data_id_idx\` ON \`payload_locked_documents_rels\` (\`master_data_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_master_value_id_idx\` ON \`payload_locked_documents_rels\` (\`master_value_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_employees_id_idx\` ON \`payload_locked_documents_rels\` (\`employees_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_teams_id_idx\` ON \`payload_locked_documents_rels\` (\`teams_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_conversations_id_idx\` ON \`payload_locked_documents_rels\` (\`conversations_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_projects\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`projects\`;`)
  await db.run(sql`DROP TABLE \`master_data\`;`)
  await db.run(sql`DROP TABLE \`master_value\`;`)
  await db.run(sql`DROP TABLE \`employees\`;`)
  await db.run(sql`DROP TABLE \`teams\`;`)
  await db.run(sql`DROP TABLE \`teams_rels\`;`)
  await db.run(sql`DROP TABLE \`conversations_messages\`;`)
  await db.run(sql`DROP TABLE \`conversations\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
}
