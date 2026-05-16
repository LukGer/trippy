import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { PlanDetailCover } from "@/src/components/plan-detail/plan-detail-cover";
import { PlanDetailDocuments } from "@/src/components/plan-detail/plan-detail-documents";
import { PlanDetailItinerary } from "@/src/components/plan-detail/plan-detail-itinerary";
import { PlanDetailMeta } from "@/src/components/plan-detail/plan-detail-meta";
import { PlanDetailTravellingWith } from "@/src/components/plan-detail/plan-detail-travelling-with";
import { trpc } from "@/src/utils/trpc";

const DOC_TONE_BY_KIND: Record<string, string> = {
	flight: "#E0E4DA",
	id: "#EDE0CC",
	passport: "#EDE0CC",
	pdf: "#E8E2D6",
	image: "#E4DBC9",
};

function formatDateRange(startsOn: string | null, endsOn: string | null) {
	if (!startsOn) return null;
	const fmt = new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
	});
	const start = fmt.format(new Date(startsOn));
	if (!endsOn) return start;
	const end = fmt.format(new Date(endsOn));
	return `${start} – ${end}`;
}

function dayCountFromItinerary(
	itineraryLength: number,
	startsOn: string | null,
	endsOn: string | null,
) {
	if (itineraryLength > 0) return itineraryLength;
	if (!startsOn) return null;
	const s = new Date(startsOn).getTime();
	const e = endsOn ? new Date(endsOn).getTime() : s;
	return Math.max(1, Math.round((e - s) / 86400000) + 1);
}

export default function PlanDetailScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{ tripId: string }>();
	const tripId = typeof params.tripId === "string" ? params.tripId : "";
	const utils = trpc.useUtils();
	const tripQuery = trpc.trips.getById.useQuery(
		{ tripId },
		{ enabled: tripId.length > 0 },
	);
	const documentsQuery = trpc.documents.list.useQuery(
		{ tripId },
		{ enabled: tripId.length > 0 },
	);
	const deleteTrip = trpc.trips.delete.useMutation({
		onSuccess: () => {
			void utils.trips.list.invalidate();
			router.back();
		},
	});

	const confirmDelete = () => {
		Alert.alert(
			"Delete trip?",
			"This permanently removes the trip and its itinerary.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => deleteTrip.mutate({ tripId }),
				},
			],
		);
	};

	const trip = tripQuery.data;
	const itinerary = trip?.itinerary ?? [];

	const dateRangeLabel = trip
		? formatDateRange(trip.startsOn, trip.endsOn)
		: null;
	const dayCount = trip
		? dayCountFromItinerary(itinerary.length, trip.startsOn, trip.endsOn)
		: null;
	const dayCountLabel = dayCount
		? `${dayCount} day${dayCount === 1 ? "" : "s"}`
		: "—";

	const docs = (documentsQuery.data ?? []).map((d) => ({
		id: d.id,
		title: d.title,
		meta: d.mimeType ?? d.kind,
		ext: extLabel(d.mimeType, d.kind),
		tone: DOC_TONE_BY_KIND[d.kind] ?? "#E8E2D6",
	}));

	const toolbar = (
		<Stack.Toolbar placement="right">
			<Stack.Toolbar.Menu icon="ellipsis.circle">
				<Stack.Toolbar.MenuAction
					icon="trash"
					destructive
					disabled={deleteTrip.isPending || !trip}
					onPress={confirmDelete}
				>
					Delete trip
				</Stack.Toolbar.MenuAction>
			</Stack.Toolbar.Menu>
		</Stack.Toolbar>
	);

	if (tripQuery.isPending) {
		return (
			<>
				{toolbar}
				<View className="min-h-full flex-1 items-center justify-center bg-surface-canvas">
					<ActivityIndicator color={Colors.accent.orange} />
				</View>
			</>
		);
	}

	if (tripQuery.isError || !trip) {
		return (
			<>
				{toolbar}
				<View className="min-h-full flex-1 items-center justify-center bg-surface-canvas px-6">
					<Text className="type-body text-center font-serif text-ink-secondary">
						We could not find this trip.
					</Text>
				</View>
			</>
		);
	}

	const subtitle =
		trip.description
			?.split("·")
			.map((s) => s.trim())
			.filter(Boolean)
			.join(" · ") || distinctCities(itinerary);

	return (
		<>
			{toolbar}
			<ScrollView
				className="flex-1 bg-surface-canvas"
				contentContainerStyle={{ paddingBottom: 120 }}
				showsVerticalScrollIndicator={false}
				contentInsetAdjustmentBehavior="never"
			>
				<PlanDetailCover
					coverImageUrl={trip.coverImageUrl}
					paletteIndex={hashIndex(trip.id)}
				/>
				<PlanDetailMeta
					dateRangeLabel={dateRangeLabel}
					dayCount={dayCount}
					title={trip.name}
					subtitle={subtitle}
					description={null}
				/>
				<PlanDetailTravellingWith people={[]} />
				<PlanDetailDocuments documents={docs} />
				<PlanDetailItinerary days={itinerary} dayCountLabel={dayCountLabel} />
			</ScrollView>
		</>
	);
}

function hashIndex(id: string) {
	let h = 0;
	for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
	return Math.abs(h);
}

function extLabel(mimeType: string | null, kind: string) {
	if (mimeType?.includes("pdf")) return "PDF";
	if (mimeType?.startsWith("image/")) return "JPG";
	return kind.slice(0, 3).toUpperCase();
}

function distinctCities(
	itinerary: Array<{ locationLabel: string }>,
): string | null {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const day of itinerary) {
		const city = day.locationLabel.trim();
		if (city.length === 0 || seen.has(city)) continue;
		seen.add(city);
		out.push(city);
	}
	return out.length > 0 ? out.join(" · ") : null;
}
