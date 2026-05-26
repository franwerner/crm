CREATE TYPE "public"."contact_assignment_role" AS ENUM('Owner', 'Collaborator');--> statement-breakpoint
CREATE TABLE "contact_assignments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"contact_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "contact_assignment_role" NOT NULL,
	"assigned_by" uuid NOT NULL,
	"assigned_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contacts" DROP CONSTRAINT "contacts_assigned_to_users_id_fk";
--> statement-breakpoint
ALTER TABLE "contact_assignments" ADD CONSTRAINT "contact_assignments_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_assignments" ADD CONSTRAINT "contact_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_assignments" ADD CONSTRAINT "contact_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "contact_assignments_contact_user_uq" ON "contact_assignments" USING btree ("contact_id","user_id");--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "assigned_to";