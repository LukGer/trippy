import type { Trip } from "@trippy/contracts/trips";

export type PlansRow =
	| { kind: "intro"; id: "intro"; total: number }
	| {
			kind: "section";
			id: string;
			title: string;
			count: number;
			topPad: boolean;
	  }
	| {
			kind: "card";
			id: string;
			trip: Trip;
			paletteIndex: number;
			showNextUp: boolean;
	  }
	| { kind: "empty"; id: "empty" };

export type PlansRowKind = PlansRow["kind"];

function startOfDay(d: Date) {
	const x = new Date(d);
	x.setHours(0, 0, 0, 0);
	return x;
}

function isTripUpcoming(trip: Trip): boolean {
	if (!trip.startsOn) return false;
	const start = startOfDay(new Date(trip.startsOn));
	const today = startOfDay(new Date());
	if (!trip.endsOn) return start.getTime() >= today.getTime();
	const end = startOfDay(new Date(trip.endsOn));
	return end.getTime() >= today.getTime();
}

function partitionTrips(trips: Trip[]) {
	const upcoming: Trip[] = [];
	const planning: Trip[] = [];
	for (const t of trips) {
		if (isTripUpcoming(t)) upcoming.push(t);
		else planning.push(t);
	}
	upcoming.sort((a, b) => {
		const ta = a.startsOn ? new Date(a.startsOn).getTime() : 0;
		const tb = b.startsOn ? new Date(b.startsOn).getTime() : 0;
		return ta - tb;
	});
	planning.sort(
		(a, b) =>
			new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);
	return { upcoming, planning };
}

/** Flattens partitioned trips into a typed list of rows for `LegendList`. */
export function buildPlansRows(trips: Trip[]): PlansRow[] {
	const { upcoming, planning } = partitionTrips(trips);
	const total = trips.length;
	const rows: PlansRow[] = [{ kind: "intro", id: "intro", total }];

	if (total === 0) {
		rows.push({ kind: "empty", id: "empty" });
		return rows;
	}

	const firstUpcomingIsFuture =
		Boolean(upcoming[0]?.startsOn) &&
		startOfDay(new Date(upcoming[0]!.startsOn!)).getTime() >=
			startOfDay(new Date()).getTime();

	if (upcoming.length > 0) {
		rows.push({
			kind: "section",
			id: "section-upcoming",
			title: "Upcoming",
			count: upcoming.length,
			topPad: false,
		});
		for (let i = 0; i < upcoming.length; i++) {
			const trip = upcoming[i]!;
			rows.push({
				kind: "card",
				id: trip.id,
				trip,
				paletteIndex: i,
				showNextUp: firstUpcomingIsFuture && i === 0,
			});
		}
	}

	if (planning.length > 0) {
		rows.push({
			kind: "section",
			id: "section-planning",
			title: "Planning",
			count: planning.length,
			topPad: upcoming.length > 0,
		});
		for (let i = 0; i < planning.length; i++) {
			const trip = planning[i]!;
			rows.push({
				kind: "card",
				id: trip.id,
				trip,
				paletteIndex: i + upcoming.length,
				showNextUp: false,
			});
		}
	}

	return rows;
}
