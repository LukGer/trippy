CREATE TABLE IF NOT EXISTS "expense_recipients" (
	"expense_id" char(30) NOT NULL,
	"user_id" char(30) NOT NULL,
	"amount" integer NOT NULL,
	CONSTRAINT "expense_recipients_expense_id_user_id_pk" PRIMARY KEY("expense_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "expenses" (
	"id" char(30) PRIMARY KEY NOT NULL,
	"trip_id" char(30) NOT NULL,
	"payer_id" char(30) NOT NULL,
	"amount" integer NOT NULL,
	"description" text,
	"created_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "trips" ALTER COLUMN "image_url" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expense_recipients" ADD CONSTRAINT "expense_recipients_expense_id_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expense_recipients" ADD CONSTRAINT "expense_recipients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expenses" ADD CONSTRAINT "expenses_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expenses" ADD CONSTRAINT "expenses_payer_id_users_id_fk" FOREIGN KEY ("payer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
