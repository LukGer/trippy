import { DateInput } from "@/src/components/date-input";
import { Spinner } from "@/src/components/spinner";
import { useTrippyUser } from "@/src/hooks/useTrippyUser";
import { trpc } from "@/src/utils/trpc";
import { fromDateId, toDateId } from "@marceloterreiro/flash-calendar";
import { skipToken, useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { router, Stack } from "expo-router";
import React, { useRef, useState } from "react";
import {
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useDebounce } from "use-debounce";

export default function NewTripPage() {
	const user = useTrippyUser();

	const queryClient = useQueryClient();

	const input = useRef<TextInput>(null);

	const addTripMutation = trpc.trips.create.useMutation({
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getQueryKey(trpc.trips),
			});

			router.navigate("/(home)/");
		},
	});

	const [locationSearchShowing, setLocationSearchShowing] = useState(false);

	const [location, setLocation] = useState<string>("");
	const [startDate, setStartDate] = useState<string>(toDateId(new Date()));
	const [endDate, setEndDate] = useState<string>(toDateId(new Date()));

	const [debouncedLocation] = useDebounce(location, 300);

	const { data, isLoading } = trpc.places.searchForPlaces.useQuery(
		location.search.length > 0
			? {
					search: debouncedLocation,
					locale: "de",
				}
			: skipToken,
	);

	return (
		<>
			<Stack.Screen options={{ title: "Create new group trip" }} />
			<View
				style={{
					paddingHorizontal: 16,
					paddingTop: 16,
					flex: 1,
					gap: 24,
					alignItems: "center",
				}}
			>
				<View style={styles.container}>
					<View style={styles.item}>
						<Text style={styles.itemTitle}>Location</Text>

						<TextInput
							ref={input}
							style={{ flex: 1, textAlign: "right" }}
							value={location}
							onChangeText={setLocation}
							onFocus={() => setLocationSearchShowing(true)}
							onBlur={() => setLocationSearchShowing(false)}
							placeholder="Search for a location"
						/>
					</View>
				</View>

				{locationSearchShowing ? (
					<Animated.View
						entering={FadeInDown}
						exiting={FadeOutDown}
						style={styles.container}
					>
						{isLoading && (
							<View
								style={[
									styles.item,
									{ justifyContent: "center", paddingVertical: 16 },
								]}
							>
								<Spinner size={24} color="#0000ff" />
							</View>
						)}

						{data?.map((place) => (
							<TouchableOpacity
								onPress={() => {
									setLocation(place.description);
									input.current?.blur();
								}}
								key={place.placeId}
								style={styles.item}
							>
								<Text style={styles.itemTitle}>{place.description}</Text>
							</TouchableOpacity>
						))}
					</Animated.View>
				) : (
					<Animated.View
						entering={FadeInDown}
						exiting={FadeOutDown}
						style={styles.container}
					>
						<View style={styles.seperator} />
						<DateInput
							instanceId="start-date"
							label="Start date"
							date={startDate}
							setDate={setStartDate}
						/>
						<View style={styles.seperator} />
						<DateInput
							instanceId="end-date"
							label="End date"
							date={endDate}
							setDate={setEndDate}
							minDate={startDate}
						/>
					</Animated.View>
				)}

				<TouchableOpacity
					onPress={() => {
						addTripMutation.mutate({
							name: location,
							startDate: fromDateId(startDate),
							endDate: fromDateId(endDate),
							members: [{ userId: user.id, isAdmin: true }],
						});
					}}
					style={{
						backgroundColor: "#007AFF",
						paddingVertical: 12,
						paddingHorizontal: 24,
						borderRadius: 999,
						alignItems: "center",
					}}
				>
					<Text style={{ color: "white", fontWeight: "bold" }}>
						Create group trip
					</Text>
				</TouchableOpacity>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		backgroundColor: "white",
		borderRadius: 10,
		borderCurve: "continuous",
		overflow: "hidden",
	},
	seperator: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: "rgba(84, 84, 86, 0.33)",
		marginStart: 16,
	},
	item: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		height: 44,
		gap: 8,
	},
	itemTitle: {
		fontWeight: "500",
	},
	userItem: {
		width: "100%",
		backgroundColor: "white",
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 10,
		borderCurve: "continuous",
		gap: 12,
	},
	userImg: {
		width: 42,
		height: 42,
		borderRadius: 99,
	},
});
