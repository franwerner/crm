CREATE TYPE "public"."insight_status" AS ENUM('queued', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."trigger_kind" AS ENUM('post_import', 'batch', 'individual', 'retry');--> statement-breakpoint
CREATE TABLE "analysis_templates" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"rubro" text NOT NULL,
	"prompt" text NOT NULL,
	"model_provider" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "contact_insights" (
	"id" uuid PRIMARY KEY NOT NULL,
	"contact_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"template_version" integer NOT NULL,
	"trigger_kind" "trigger_kind" NOT NULL,
	"status" "insight_status" DEFAULT 'queued' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"result" jsonb,
	"model_used" text,
	"prompt_tokens" integer,
	"completion_tokens" integer,
	"cost_usd" text,
	"last_error" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "imports" ADD COLUMN "analyze_on_complete" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "imports" ADD COLUMN "enrichment_template_id" uuid;--> statement-breakpoint
ALTER TABLE "contact_insights" ADD CONSTRAINT "contact_insights_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_insights" ADD CONSTRAINT "contact_insights_template_id_analysis_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."analysis_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_contact_insights_status" ON "contact_insights" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_contact_insights_contact_id" ON "contact_insights" USING btree ("contact_id");