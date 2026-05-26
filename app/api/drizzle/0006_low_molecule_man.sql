CREATE TABLE "project_extensions" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"additional_days" integer NOT NULL,
	"applied_end_date" date NOT NULL,
	"reason" text NOT NULL,
	"cost_minor" bigint,
	"billed_amount_minor" bigint,
	"granted_at" date NOT NULL,
	"granted_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_extensions_additional_days_pos" CHECK ("project_extensions"."additional_days" > 0),
	CONSTRAINT "project_extensions_cost_nonneg" CHECK ("project_extensions"."cost_minor" IS NULL OR "project_extensions"."cost_minor" >= 0),
	CONSTRAINT "project_extensions_billed_amount_nonneg" CHECK ("project_extensions"."billed_amount_minor" IS NULL OR "project_extensions"."billed_amount_minor" >= 0)
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "original_planned_end_date" date;--> statement-breakpoint
UPDATE "projects" SET "original_planned_end_date" = "planned_end_date";--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "original_planned_end_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "project_extensions" ADD CONSTRAINT "project_extensions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_extensions" ADD CONSTRAINT "project_extensions_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
