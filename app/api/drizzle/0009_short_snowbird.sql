CREATE TYPE "public"."contact_verification_status" AS ENUM('unverified', 'valid', 'invalid');--> statement-breakpoint
CREATE TYPE "public"."import_stage" AS ENUM('counting', 'ingesting', 'finalizing');--> statement-breakpoint
CREATE TYPE "public"."import_status" AS ENUM('awaiting_mapping', 'pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "imports" (
	"id" uuid PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"file_key" text NOT NULL,
	"status" "import_status" NOT NULL,
	"stage" "import_stage",
	"column_headers" jsonb NOT NULL,
	"mapping" jsonb,
	"template_id" uuid,
	"total_rows" integer,
	"processed_rows" integer DEFAULT 0 NOT NULL,
	"ok_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"duplicated_count" integer DEFAULT 0 NOT NULL,
	"rejected_csv_key" text,
	"created_by" uuid NOT NULL,
	"started_at" timestamp with time zone,
	"last_row_number" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_channels" ADD COLUMN "verification_status" "contact_verification_status" DEFAULT 'unverified' NOT NULL;--> statement-breakpoint
ALTER TABLE "contact_channels" ADD COLUMN "verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contact_channels" ADD COLUMN "verification_detail" jsonb;--> statement-breakpoint
ALTER TABLE "imports" ADD CONSTRAINT "imports_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_imports_status" ON "imports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_imports_created_by" ON "imports" USING btree ("created_by");