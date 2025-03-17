import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  real,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

// 新增企业信息表
export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  logo: text('logo'),
  category: varchar('category', { length: 100 }),
  subCategory: varchar('sub_category', { length: 100 }),
  description: text('description'),
  productIntro: text('product_intro'),
  advantageTags: jsonb('advantage_tags'),
  contactName: varchar('contact_name', { length: 100 }),
  contactPhone: varchar('contact_phone', { length: 50 }),
  isAvailable: boolean('is_available').default(true),
  isEastRisingPark: boolean('is_east_rising_park').default(false),
  rating: real('rating'),
  activeProjectCount: integer('active_project_count').default(0),
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  teamId: integer('team_id').references(() => teams.id),
});

// 企业能力表
export const companyCapabilities = pgTable('company_capabilities', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id')
    .notNull()
    .references(() => companies.id),
  capability: varchar('capability', { length: 255 }).notNull(),
  description: text('description'),
  weight: real('weight').default(1.0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// 需求表
export const demands = pgTable('demands', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  rawText: text('raw_text').notNull(),
  parsedModules: jsonb('parsed_modules'),
  budget: integer('budget'),
  timeline: varchar('timeline', { length: 100 }),
  cooperationType: varchar('cooperation_type', { length: 100 }),
  status: varchar('status', { length: 50 }).notNull().default('new'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  submittedBy: integer('submitted_by')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
});

// 需求模块表
export const demandModules = pgTable('demand_modules', {
  id: serial('id').primaryKey(),
  demandId: integer('demand_id')
    .notNull()
    .references(() => demands.id),
  moduleName: varchar('module_name', { length: 255 }).notNull(),
  description: text('description'),
  weight: real('weight').default(1.0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// 匹配结果表
export const matchResults = pgTable('match_results', {
  id: serial('id').primaryKey(),
  demandId: integer('demand_id')
    .notNull()
    .references(() => demands.id),
  companyId: integer('company_id')
    .notNull()
    .references(() => companies.id),
  score: real('score').notNull(),
  matchDetails: jsonb('match_details'),
  isRecommended: boolean('is_recommended').default(false),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 合作历史表
export const collaborationHistory = pgTable('collaboration_history', {
  id: serial('id').primaryKey(),
  companyId1: integer('company_id_1')
    .notNull()
    .references(() => companies.id),
  companyId2: integer('company_id_2')
    .notNull()
    .references(() => companies.id),
  projectName: varchar('project_name', { length: 255 }),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  rating: real('rating'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// 关系定义
export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  companies: many(companies),
  demands: many(demands),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  demands: many(demands),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  team: one(teams, {
    fields: [companies.teamId],
    references: [teams.id],
  }),
  capabilities: many(companyCapabilities),
  matchResults: many(matchResults),
  collaborationsAsCompany1: many(collaborationHistory, { relationName: 'company1' }),
  collaborationsAsCompany2: many(collaborationHistory, { relationName: 'company2' }),
}));

export const companyCapabilitiesRelations = relations(companyCapabilities, ({ one }) => ({
  company: one(companies, {
    fields: [companyCapabilities.companyId],
    references: [companies.id],
  }),
}));

export const demandsRelations = relations(demands, ({ one, many }) => ({
  submitter: one(users, {
    fields: [demands.submittedBy],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [demands.teamId],
    references: [teams.id],
  }),
  modules: many(demandModules),
  matchResults: many(matchResults),
}));

export const demandModulesRelations = relations(demandModules, ({ one }) => ({
  demand: one(demands, {
    fields: [demandModules.demandId],
    references: [demands.id],
  }),
}));

export const matchResultsRelations = relations(matchResults, ({ one }) => ({
  demand: one(demands, {
    fields: [matchResults.demandId],
    references: [demands.id],
  }),
  company: one(companies, {
    fields: [matchResults.companyId],
    references: [companies.id],
  }),
}));

export const collaborationHistoryRelations = relations(collaborationHistory, ({ one }) => ({
  company1: one(companies, {
    fields: [collaborationHistory.companyId1],
    references: [companies.id],
    relationName: 'company1',
  }),
  company2: one(companies, {
    fields: [collaborationHistory.companyId2],
    references: [companies.id],
    relationName: 'company2',
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type CompanyCapability = typeof companyCapabilities.$inferSelect;
export type NewCompanyCapability = typeof companyCapabilities.$inferInsert;
export type Demand = typeof demands.$inferSelect;
export type NewDemand = typeof demands.$inferInsert;
export type DemandModule = typeof demandModules.$inferSelect;
export type NewDemandModule = typeof demandModules.$inferInsert;
export type MatchResult = typeof matchResults.$inferSelect;
export type NewMatchResult = typeof matchResults.$inferInsert;
export type CollaborationHistory = typeof collaborationHistory.$inferSelect;
export type NewCollaborationHistory = typeof collaborationHistory.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
  CREATE_DEMAND = 'CREATE_DEMAND',
  UPDATE_DEMAND = 'UPDATE_DEMAND',
  CREATE_COMPANY = 'CREATE_COMPANY',
  UPDATE_COMPANY = 'UPDATE_COMPANY',
  IMPORT_COMPANIES = 'IMPORT_COMPANIES',
}
