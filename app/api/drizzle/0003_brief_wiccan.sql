ALTER TYPE "public"."event_type" ADD VALUE 'Discarded';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'Reopened';--> statement-breakpoint
ALTER TYPE "public"."pipeline_state" ADD VALUE 'AtRisk' BEFORE 'Customer';--> statement-breakpoint
ALTER TABLE "state_changes" DROP CONSTRAINT "state_changes_caused_by_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "state_changes" ALTER COLUMN "caused_by_event_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "state_locked";--> statement-breakpoint
ALTER TABLE "state_changes" DROP COLUMN "caused_by_user_id";