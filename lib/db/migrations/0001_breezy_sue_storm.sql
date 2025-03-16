CREATE TABLE "collaboration_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id_1" integer NOT NULL,
	"company_id_2" integer NOT NULL,
	"project_name" varchar(255),
	"start_date" timestamp,
	"end_date" timestamp,
	"rating" real,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"logo" text,
	"category" varchar(100),
	"sub_category" varchar(100),
	"description" text,
	"product_intro" text,
	"advantage_tags" jsonb,
	"contact_name" varchar(100),
	"contact_phone" varchar(50),
	"is_available" boolean DEFAULT true,
	"is_east_rising_park" boolean DEFAULT false,
	"rating" real,
	"active_project_count" integer DEFAULT 0,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"team_id" integer
);
--> statement-breakpoint
CREATE TABLE "company_capabilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"capability" varchar(255) NOT NULL,
	"description" text,
	"weight" real DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demand_modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"demand_id" integer NOT NULL,
	"module_name" varchar(255) NOT NULL,
	"description" text,
	"weight" real DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demands" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"raw_text" text NOT NULL,
	"parsed_modules" jsonb,
	"budget" integer,
	"timeline" varchar(100),
	"cooperation_type" varchar(100),
	"status" varchar(50) DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"submitted_by" integer NOT NULL,
	"team_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"demand_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"score" real NOT NULL,
	"match_details" jsonb,
	"is_recommended" boolean DEFAULT false,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "collaboration_history" ADD CONSTRAINT "collaboration_history_company_id_1_companies_id_fk" FOREIGN KEY ("company_id_1") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_history" ADD CONSTRAINT "collaboration_history_company_id_2_companies_id_fk" FOREIGN KEY ("company_id_2") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_capabilities" ADD CONSTRAINT "company_capabilities_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_modules" ADD CONSTRAINT "demand_modules_demand_id_demands_id_fk" FOREIGN KEY ("demand_id") REFERENCES "public"."demands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demands" ADD CONSTRAINT "demands_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demands" ADD CONSTRAINT "demands_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_demand_id_demands_id_fk" FOREIGN KEY ("demand_id") REFERENCES "public"."demands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;