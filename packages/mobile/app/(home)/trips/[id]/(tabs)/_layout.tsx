import { useTrip } from "@/src/hooks/useTrip";
import { TrippyTabBar } from "@/src/navigation/TrippyTabBar";
import { TrippyTabs } from "@/src/navigation/TrippyTabs";
import { Image } from "expo-image";
import { Link, Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TripTabsLayout() {
	const trip = useTrip();

	return (
		<>
			<Stack.Screen
				options={{
					title: trip.name,
					headerTintColor: "#FFF",
					headerBackTitle: "Home",
					headerShadowVisible: true,
					headerTitleStyle: {
						fontSize: 18,
						fontWeight: "bold",
					},
					headerBackground: () => (
						<View style={{ width: "100%", height: "100%" }}>
							<View
								style={{
									backgroundColor: "#000",
									opacity: 0.4,
									position: "absolute",
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									zIndex: 1,
								}}
							/>

							<Image
								source={{ uri: trip.imageUrl ?? "" }}
								style={StyleSheet.absoluteFill}
								cachePolicy="none"
							/>
						</View>
					),
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
									tintColor="white"
									resizeMode="scaleAspectFit"
								/>
								<Text className="text-white text-xl">Home</Text>
							</TouchableOpacity>
						</Link>
					),
				}}
			/>
			<TrippyTabs tabBar={TrippyTabBar}>
				<TrippyTabs.Screen name="index" />
				<TrippyTabs.Screen name="expenses" />
				<TrippyTabs.Screen name="documents" />
			</TrippyTabs>
		</>
	);
}
