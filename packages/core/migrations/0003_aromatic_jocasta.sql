DO $$ BEGIN
 CREATE TYPE "public"."message_type" AS ENUM('chat', 'expense', 'system');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "type" "message_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "deeplink" text;