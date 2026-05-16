import type { Db } from "../db/client";
import { DocumentsRepo } from "./documents/documents.repo";
import { DocumentsService } from "./documents/documents.service";
import { ItineraryRepo } from "./itinerary/itinerary.repo";
import { ItineraryService } from "./itinerary/itinerary.service";
import { TripsRepo } from "./trips/trips.repo";
import { TripsService } from "./trips/trips.service";

export type Services = ReturnType<typeof buildServices>;

export function buildServices(db: Db) {
	const itinerary = new ItineraryService(new ItineraryRepo(db));
	return {
		trips: new TripsService(new TripsRepo(db), itinerary),
		documents: new DocumentsService(new DocumentsRepo(db)),
		itinerary,
	};
}
