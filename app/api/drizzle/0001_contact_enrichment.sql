CREATE TYPE "public"."contact_type" AS ENUM('Person', 'Company');--> statement-breakpoint
CREATE TYPE "public"."sex" AS ENUM('Male', 'Female', 'Other', 'Unspecified');--> statement-breakpoint
CREATE TYPE "public"."channel_type" AS ENUM('Phone', 'Email', 'WhatsApp', 'Instagram', 'Website', 'Other');--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "contact_type" "contact_type" DEFAULT 'Person' NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "sex" "sex";--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "address_street" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "address_number" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "address_postal_code" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "address_city" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "address_province" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "address_country" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "assigned_to" uuid;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "tags" text[];--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "notes" text;--> statement-breakpoint
CREATE TABLE "contact_channels" (
	"id" uuid PRIMARY KEY NOT NULL,
	"contact_id" uuid NOT NULL,
	"channel_type" "channel_type" NOT NULL,
	"value" text NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_channels" ADD CONSTRAINT "contact_channels_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
