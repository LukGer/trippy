import { TabBar } from "@/src/components/TabBar";
import { useTrip } from "@/src/hooks/useTrip";
import {
	createMaterialTopTabNavigator,
	type MaterialTopTabNavigationEventMap,
	type MaterialTopTabNavigationOptions,
} from "@react-navigation/material-top-tabs";
import type {
	ParamListBase,
	TabNavigationState,
} from "@react-navigation/native";
import { Image } from "expo-image";
import { Link, Stack, withLayoutContext } from "expo-router";
import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { Navigator } = createMaterialTopTabNavigator();

export const TrippyTopTabs = withLayoutContext<
	MaterialTopTabNavigationOptions,
	typeof Navigator,
	TabNavigationState<ParamListBase>,
	MaterialTopTabNavigationEventMap
>(Navigator);

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
					headerRight: () => (
						<Link
							href={{
								pathname: "/(home)/trips/[id]/settings",
								params: { id: trip.id },
							}}
							asChild
						>
							<TouchableOpacity>
								<SymbolView
									name="gear"
									size={24}
									tintColor="white"
									resizeMode="scaleAspectFit"
								/>
							</TouchableOpacity>
						</Link>
					),
				}}
			/>
			<TrippyTopTabs tabBar={TabBar}>
				<TrippyTopTabs.Screen name="index" />
				<TrippyTopTabs.Screen name="expenses" />
				<TrippyTopTabs.Screen name="documents" />
			</TrippyTopTabs>
		</>
	);
}
