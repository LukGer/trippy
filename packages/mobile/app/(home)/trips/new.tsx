import { DateInput } from "@/src/components/date-input";
import { Spinner } from "@/src/components/spinner";
import { useTrippyUser } from "@/src/hooks/useTrippyUser";
import { trpc } from "@/src/utils/trpc";
import { fromDateId, toDateId } from "@marceloterreiro/flash-calendar";
import { skipToken, useQueryClient } from "@tanstack/react-query";
import type { Place } from "@trippy/core/src/place/place";
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
import Animated, {
	FadeInUp,
	FadeOutUp,
	LinearTransition,
	useAnimatedStyle,
	withTiming,
	ZoomIn,
	ZoomOut,
} from "react-native-reanimated";
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

	const [search, setSearch] = useState("");
	const [location, setLocation] = useState<
		Place.PlaceAutocompleteResult | undefined
	>(undefined);
	const [startDate, setStartDate] = useState<string>(toDateId(new Date()));
	const [endDate, setEndDate] = useState<string>(toDateId(new Date()));

	const [debouncedSearch] = useDebounce(search, 300);

	const { data, isLoading: placesLoading } =
		trpc.places.searchForPlaces.useQuery(
			debouncedSearch.length > 0
				? {
						search: debouncedSearch,
						locale: "de",
					}
				: skipToken,
		);

	const addTrip = () => {
		if (!location) return;

		addTripMutation.mutate({
			name: location.description,
			placeId: location.placeId,
			startDate: fromDateId(startDate),
			endDate: fromDateId(endDate),
			members: [{ userId: user.id, isAdmin: true }],
		});
	};

	const saveDisabled = !location || !startDate || !endDate;

	return (
		<>
			<Stack.Screen
				options={{
					title: "Create new group trip",
					headerRight: () => (
						<CreateButton
							onPress={addTrip}
							isLoading={addTripMutation.isPending}
							disabled={saveDisabled}
						/>
					),
				}}
			/>
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
							value={search}
							onChangeText={setSearch}
							onFocus={() => setLocationSearchShowing(true)}
							onBlur={() => setLocationSearchShowing(false)}
							placeholder="Search for a location"
						/>
					</View>
				</View>

				{locationSearchShowing && (
					<Animated.View
						entering={FadeInUp}
						exiting={FadeOutUp}
						style={styles.container}
					>
						{placesLoading && (
							<View
								style={{
									width: "100%",
									justifyContent: "center",
									flexDirection: "row",
									paddingVertical: 16,
								}}
							>
								<Spinner size={24} color="#0000ff" />
							</View>
						)}

						{!placesLoading && (data?.length ?? 0) === 0 && (
							<Text style={{ color: "gray" }}>Search for a city above</Text>
						)}

						{data?.map((place) => (
							<TouchableOpacity
								onPress={() => {
									setLocation(place);
									setSearch(place.description);
									input.current?.blur();
								}}
								key={place.placeId}
								style={styles.item}
							>
								<Text style={styles.itemTitle}>{place.description}</Text>
							</TouchableOpacity>
						))}
					</Animated.View>
				)}

				<Animated.View layout={LinearTransition}>
					<View style={styles.container}>
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
					</View>
				</Animated.View>
			</View>
		</>
	);
}

const CreateButton = ({
	onPress,
	isLoading,
	disabled,
}: { onPress: () => void; isLoading: boolean; disabled: boolean }) => {
	const textStyle = useAnimatedStyle(() => ({
		opacity: withTiming(disabled ? 0.5 : 1),
	}));

	return (
		<TouchableOpacity
			disabled={disabled}
			onPress={onPress}
			style={{
				width: 50,
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			{isLoading ? (
				<Animated.View entering={ZoomIn}>
					<Spinner size={24} color="#0000ff" />
				</Animated.View>
			) : (
				<Animated.Text
					exiting={ZoomOut}
					style={[{ color: "#007AFF", fontWeight: "bold" }, textStyle]}
				>
					Create
				</Animated.Text>
			)}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		width: "100%",
		minHeight: 44,
		backgroundColor: "white",
		borderRadius: 10,
		borderCurve: "continuous",
		overflow: "hidden",
		alignItems: "center",
		justifyContent: "center",
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
