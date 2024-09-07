ALTER TABLE "trip_to_user" DROP CONSTRAINT "trip_to_user_trip_id_trips_id_fk";
--> statement-breakpoint
ALTER TABLE "trip_to_user" DROP CONSTRAINT "trip_to_user_user_id_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trip_to_user" ADD CONSTRAINT "trip_to_user_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trip_to_user" ADD CONSTRAINT "trip_to_user_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
