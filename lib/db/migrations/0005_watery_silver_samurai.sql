ALTER TABLE "collaboration_history" DROP CONSTRAINT "collaboration_history_company_id_1_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "collaboration_history" DROP CONSTRAINT "collaboration_history_company_id_2_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "companies" DROP CONSTRAINT "companies_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "company_capabilities" DROP CONSTRAINT "company_capabilities_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "demand_modules" DROP CONSTRAINT "demand_modules_demand_id_demands_id_fk";
--> statement-breakpoint
ALTER TABLE "demands" DROP CONSTRAINT "demands_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "match_results" DROP CONSTRAINT "match_results_demand_id_demands_id_fk";
--> statement-breakpoint
ALTER TABLE "match_results" DROP CONSTRAINT "match_results_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "collaboration_history" ADD CONSTRAINT "collaboration_history_company_id_1_companies_id_fk" FOREIGN KEY ("company_id_1") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_history" ADD CONSTRAINT "collaboration_history_company_id_2_companies_id_fk" FOREIGN KEY ("company_id_2") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_capabilities" ADD CONSTRAINT "company_capabilities_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_modules" ADD CONSTRAINT "demand_modules_demand_id_demands_id_fk" FOREIGN KEY ("demand_id") REFERENCES "public"."demands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demands" ADD CONSTRAINT "demands_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_demand_id_demands_id_fk" FOREIGN KEY ("demand_id") REFERENCES "public"."demands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;