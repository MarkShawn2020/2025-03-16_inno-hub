import { 
  pgTable as createTable,
  varchar, 
  text, 
  timestamp, 
  index,
  integer,
  json
} from 'drizzle-orm/pg-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// 需求表
export const demand = createTable(
  "demand",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    userId: varchar("user_id", { length: 191 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    budget: varchar("budget", { length: 50 }),
    duration: varchar("duration", { length: 50 }),
    cooperationType: varchar("cooperation_type", { length: 50 }),
    category: varchar("category", { length: 50 }),
    status: varchar("status", { length: 20 }).default("pending").notNull(),
    modules: json("modules").$type<Array<{
      name: string;
      description: string;
      weight: number | null;
    }>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("demand_user_id_idx").on(table.userId),
    };
  }
);

export type Demand = InferSelectModel<typeof demand>;
export type NewDemand = InferInsertModel<typeof demand>;

// 企业表
export const company = createTable(
  "company",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    userId: varchar("user_id", { length: 191 }).notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    description: text("description"),
    contactPerson: varchar("contact_person", { length: 191 }),
    contactPhone: varchar("contact_phone", { length: 191 }),
    contactEmail: varchar("contact_email", { length: 191 }),
    location: varchar("location", { length: 191 }),
    size: varchar("size", { length: 191 }),
    industry: varchar("industry", { length: 191 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("company_user_id_idx").on(table.userId),
    };
  }
);

export type Company = InferSelectModel<typeof company>;
export type NewCompany = InferInsertModel<typeof company>; 