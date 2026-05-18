CREATE TYPE "public"."event_type" AS ENUM('FirstContact', 'MessageSent', 'ResponseReceived', 'MeetingCall', 'ProposalSent', 'ProposalWon', 'ProposalRejected', 'FollowUpPending', 'Note');--> statement-breakpoint
CREATE TYPE "public"."interest_level" AS ENUM('Cold', 'Warm', 'Hot');--> statement-breakpoint
CREATE TYPE "public"."pipeline_state" AS ENUM('Contact', 'Lead', 'Customer', 'Discarded');--> statement-breakpoint
CREATE TYPE "public"."source_channel" AS ENUM('Instagram', 'WhatsApp', 'Referral', 'Email', 'Other');--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"handle" text,
	"phone" text,
	"pipeline_state" "pipeline_state" DEFAULT 'Contact' NOT NULL,
	"state_locked" boolean DEFAULT false NOT NULL,
	"source_channel" "source_channel",
	"interest_level" "interest_level",
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"contact_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"event_type" "event_type" NOT NULL,
	"detail" text DEFAULT '' NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "state_changes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"contact_id" uuid NOT NULL,
	"previous_state" "pipeline_state" NOT NULL,
	"next_state" "pipeline_state" NOT NULL,
	"caused_by_event_id" uuid,
	"caused_by_user_id" uuid,
	"changed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "state_changes" ADD CONSTRAINT "state_changes_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "state_changes" ADD CONSTRAINT "state_changes_caused_by_event_id_events_id_fk" FOREIGN KEY ("caused_by_event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "state_changes" ADD CONSTRAINT "state_changes_caused_by_user_id_users_id_fk" FOREIGN KEY ("caused_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;