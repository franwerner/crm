CREATE TYPE "public"."project_responsible_role" AS ENUM('Lead', 'Member');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('Draft', 'Active', 'Closed', 'Cancelled');--> statement-breakpoint
CREATE TABLE "project_responsibles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "project_responsible_role" NOT NULL,
	"assigned_by" uuid NOT NULL,
	"assigned_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_state_changes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"previous_state" "project_status" NOT NULL,
	"next_state" "project_status" NOT NULL,
	"cause_kind" text NOT NULL,
	"caused_by_user_id" uuid,
	"cause_reason" text,
	"changed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"contact_id" uuid NOT NULL,
	"currency" varchar(3) NOT NULL,
	"status" "project_status" DEFAULT 'Draft' NOT NULL,
	"start_date" date NOT NULL,
	"planned_end_date" date NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "projects_currency_format" CHECK (char_length("projects"."currency") = 3 AND "projects"."currency" = upper("projects"."currency")),
	CONSTRAINT "projects_date_order" CHECK ("projects"."planned_end_date" >= "projects"."start_date")
);
--> statement-breakpoint
ALTER TABLE "project_responsibles" ADD CONSTRAINT "project_responsibles_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_responsibles" ADD CONSTRAINT "project_responsibles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_responsibles" ADD CONSTRAINT "project_responsibles_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_state_changes" ADD CONSTRAINT "project_state_changes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_state_changes" ADD CONSTRAINT "project_state_changes_caused_by_user_id_users_id_fk" FOREIGN KEY ("caused_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "project_responsibles_project_user_uq" ON "project_responsibles" USING btree ("project_id","user_id");--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "tags";