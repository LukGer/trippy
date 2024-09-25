import { useTrip } from "@/src/hooks/useTrip";
import { TrippyTabs } from "@/src/navigation/TrippyTabs";
import { trpc } from "@/src/utils/trpc";
import { Text } from "react-native";

export default function TripMessagesPage() {
	const trip = useTrip();

	const { data, isLoading } = trpc.messages.getByTripId.useQuery(trip.id);

	return (
		<>
			<TrippyTabs.Screen
				options={{
					title: "Chat",
				}}
			/>
			{isLoading ? (
				<Text>Loading...</Text>
			) : (
				<Text>{data?.length ?? 0} messages</Text>
			)}
		</>
	);
}
