import { TrippyTabs } from "@/src/navigation/TrippyTabs";
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
