import { TrippyTabs } from "@/src/navigation/trippy-tabs";
import { Text } from "react-native";

export default function TripDocumentsScreen() {
	return (
		<>
			<TrippyTabs.Screen
				options={{
					title: "Documents",
				}}
			/>
			<Text>Documents</Text>
		</>
	);
}
