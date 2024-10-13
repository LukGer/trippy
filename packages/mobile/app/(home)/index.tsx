import { FullscreenLoading } from "@/src/components/fullscreen-loading";
import { GlobeIcon } from "@/src/components/globe-icon";
import { TripCard, TripCardPreview } from "@/src/components/trip-card";
import { useTrippyUser } from "@/src/hooks/useTrippyUser";
import { trpc } from "@/src/utils/trpc";
import type { RouterOutputs } from "@trippy/api";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { Link, Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import type { ReactElement } from "react";
import React from "react";
import {
	PlatformColor,
	RefreshControl,
	ScrollView,
	StatusBar,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Animated, {
	FadeIn,
	LinearTransition,
	ZoomOut,
} from "react-native-reanimated";
import * as Menu from "zeego/context-menu";

type Trips = RouterOutputs["trips"]["getTripsByUserId"];

export default function HomePage() {
	const user = useTrippyUser();

	const { isLoading, data, refetch } = trpc.trips.getTripsByUserId.useQuery(
		user.id,
	);

	if (isLoading) {
		return <FullscreenLoading />;
	}

	return (
		<>
			<StatusBar barStyle="dark-content" />
			<Stack.Screen
				options={{
					title: "Trippy",
					headerShown: true,
					headerTransparent: true,
					headerLargeTitle: true,
					headerBlurEffect: "prominent",
					headerShadowVisible: true,
					headerLargeTitleShadowVisible: false,
					headerStyle: {
						backgroundColor: "rgba(255,255,255,0.01)",
					},
					headerLargeStyle: {
						backgroundColor: PlatformColor("systemGroupedBackgroundColor"),
					},

					headerTintColor: "black",
					headerLeft: () => (
						<GlobeIcon
							style={{
								width: 24,
								height: 24,
								transform: [{ scale: 1.25 }],
							}}
						/>
					),
					headerRight: () => (
						<Link href="/(home)/settings" asChild>
							<TouchableOpacity>
								<Image
									source={{ uri: user.pictureUrl ?? "" }}
									style={{
										width: 30,
										height: 30,
										borderRadius: 99,
									}}
								/>
							</TouchableOpacity>
						</Link>
					),
				}}
			/>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerStyle={{
					paddingHorizontal: 20,
					paddingTop: 20,
				}}
				refreshControl={
					<RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
				}
			>
				{data && <TripList trips={data} userId={user.id} />}
			</ScrollView>
		</>
	);
}

function TripList({ trips, userId }: { trips: Trips; userId: string }) {
	const sorted = trips.sort((a, b) =>
		dayjs(b.startDate).isBefore(dayjs(a.startDate)) ? 1 : -1,
	);

	const upcomingTrips = sorted.filter((trip) =>
		dayjs(trip.startDate).isAfter(dayjs()),
	);

	const pastTrips = sorted.filter((trip) =>
		dayjs(trip.startDate).isBefore(dayjs()),
	);

	return (
		<Animated.View layout={LinearTransition} style={{ gap: 20 }}>
			<View className="flex flex-row items-center">
				<Text className="font-bold text-xl">Upcoming trips</Text>

				<View className="flex-1" />

				<Link href="/(home)/trips/new" asChild>
					<TouchableOpacity>
						<SymbolView
							name="plus.circle.fill"
							tintColor="black"
							size={20}
							resizeMode="scaleAspectFill"
						/>
					</TouchableOpacity>
				</Link>
			</View>
			{upcomingTrips.map((trip) => (
				<Animated.View key={trip.id} entering={FadeIn} exiting={ZoomOut}>
					<TripCardMenu trip={trip} userId={userId}>
						<TripCard trip={trip} />
					</TripCardMenu>
				</Animated.View>
			))}

			{pastTrips.length > 0 && (
				<Text className="font-bold text-xl">Past trips</Text>
			)}

			{pastTrips.map((trip) => (
				<Animated.View key={trip.id} entering={FadeIn} exiting={ZoomOut}>
					<TripCardMenu trip={trip} userId={userId}>
						<TripCard trip={trip} />
					</TripCardMenu>
				</Animated.View>
			))}
		</Animated.View>
	);
}

function TripCardMenu({
	children,
	trip,
	userId,
}: { children: ReactElement; trip: Trips[number]; userId: string }) {
	const utils = trpc.useUtils();
	const leaveGroupMutation = trpc.trips.leaveTrip.useMutation({
		onSuccess: () => {
			utils.trips.invalidate();
		},
	});

	const leaveTrip = () => {
		leaveGroupMutation.mutate({
			tripId: trip.id,
			userId,
		});
	};

	return (
		<Menu.Root>
			<Menu.Trigger>{children}</Menu.Trigger>
			<Menu.Content>
				<Menu.Preview borderRadius={20}>
					{() => <TripCardPreview trip={trip} />}
				</Menu.Preview>
				<Menu.Label>Trip Menu</Menu.Label>
				<Menu.Item key="leave" onSelect={() => leaveTrip()} destructive>
					<Menu.ItemIcon ios={{ name: "door.left.hand.open" }} />
					<Menu.ItemTitle>Leave</Menu.ItemTitle>
				</Menu.Item>
			</Menu.Content>
		</Menu.Root>
	);
}
