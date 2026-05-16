import type { Db } from "../db/client";
import { DocumentsRepo } from "./documents/documents.repo";
import { DocumentsService } from "./documents/documents.service";
import { TripsRepo } from "./trips/trips.repo";
import { TripsService } from "./trips/trips.service";

export type Services = ReturnType<typeof buildServices>;

export function buildServices(db: Db) {
	return {
		trips: new TripsService(new TripsRepo(db)),
		documents: new DocumentsService(new DocumentsRepo(db)),
	};
}
