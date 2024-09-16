import type { Trip } from "@trippy/core/src/trip/trip";
import { createContext, useContext } from "react";

export const TripContext = createContext<Trip.Info>(null!);

export const useTrip = () => {
	const trip = useContext(TripContext);
	return trip;
};
