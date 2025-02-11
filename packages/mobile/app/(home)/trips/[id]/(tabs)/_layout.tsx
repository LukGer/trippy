import { useTrip } from "@/src/hooks/useTrip";
import { useTrippyUser } from "@/src/hooks/useTrippyUser";
import { TrippyTabBar } from "@/src/navigation/trippy-tab-bar";
import { TrippyTabs } from "@/src/navigation/trippy-tabs";
import { Link, Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

export default function TripTabsLayout() {
	const user = useTrippyUser();
	const trip = useTrip();

	const isAdmin =
		trip.members.find((member) => member.id === user.id)?.isAdmin ?? false;

	return (
		<>
			<Stack.Screen
				options={{
					title: trip.name,
					headerBackTitle: "Home",
					headerShadowVisible: false,
					headerTitleStyle: {
						fontSize: 18,
						fontWeight: "bold",
					},
					headerLeft: () => (
						<Link
							href={{
								pathname: "/(home)/",
							}}
							asChild
						>
							<TouchableOpacity
								style={{ flexDirection: "row", alignItems: "center" }}
							>
								<SymbolView
									name="chevron.left"
									size={24}
									tintColor="black"
									resizeMode="scaleAspectFit"
								/>
								<Text className="text-white text-xl">Home</Text>
							</TouchableOpacity>
						</Link>
					),
				}}
			/>
			<TrippyTabs tabBar={TrippyTabBar}>
				<TrippyTabs.Screen name="chat" />
				<TrippyTabs.Screen name="expenses" />
				<TrippyTabs.Screen name="documents" />
				<TrippyTabs.Screen name="settings" options={{ enabled: isAdmin }} />
			</TrippyTabs>
		</>
	);
}
