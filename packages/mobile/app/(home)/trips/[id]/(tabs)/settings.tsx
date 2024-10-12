import { DateInput } from "@/src/components/date-input";
import { FullscreenLoading } from "@/src/components/fullscreen-loading";
import { useTrip } from "@/src/hooks/useTrip";
import { useTrippyUser } from "@/src/hooks/useTrippyUser";
import { TrippyTabs } from "@/src/navigation/trippy-tabs";
import { trpc } from "@/src/utils/trpc";
import { toDateId } from "@marceloterreiro/flash-calendar";
import { useQueryClient } from "@tanstack/react-query";
import type { RouterOutputs } from "@trippy/api";
import { getQueryKey } from "@trpc/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import React, { Fragment, useState } from "react";
import {
	Alert,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import Animated, {
	FadeOut,
	LinearTransition,
	useAnimatedStyle,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { useDebounce } from "use-debounce";

type Trip = RouterOutputs["trips"]["getById"];
type Member = Trip["members"][number];

export default function TripSettingsPage() {
	const trip = useTrip();
	const user = useTrippyUser();

	const utils = trpc.useUtils();

	const updateTrip = trpc.trips.update.useMutation({
		onError: (error) => {
			console.error(error);
		},
		onSuccess: () => {
			utils.trips.invalidate();
		},
	});

	const removeMemberMutation = trpc.trips.removeMember.useMutation({
		onMutate: (variables) => {
			utils.trips.getById.setData(variables.tripId, (oldData) => ({
				...oldData!,
				members: oldData!.members.filter((m) => m.id !== variables.userId),
			}));
		},
		onSuccess: () => {
			utils.trips.invalidate();
		},
	});

	const leaveTripMutation = trpc.trips.leaveTrip.useMutation({
		onSuccess: () => {
			utils.trips.invalidate();

			router.navigate("/(home)");
		},
	});

	const [name, setName] = useState(trip.name);
	const [startDate, setStartDate] = useState(
		toDateId(trip.startDate ?? new Date()),
	);
	const [endDate, setEndDate] = useState(toDateId(trip.endDate ?? new Date()));

	const hasChanges =
		name !== trip.name ||
		startDate !== toDateId(trip.startDate) ||
		endDate !== toDateId(trip.endDate);

	const sortedMembers = trip.members.sort((a, b) => {
		if (a.id === user.id) return -1;
		if (b.id === user.id) return 1;
		return a.name.localeCompare(b.name);
	});

	const animatedSaveButtonStyle = useAnimatedStyle(() => ({
		opacity: withTiming(hasChanges ? 1 : 0),
		transform: [
			{
				translateY: withSpring(hasChanges ? -50 : 50),
			},
		],
	}));

	const saveTrip = () => {
		updateTrip.mutate(
			{
				id: trip.id,
				name,
				startDate: new Date(startDate),
				endDate: new Date(endDate),
			},
			{
				onSuccess: () => {
					utils.trips.getById.invalidate(trip.id);
				},
			},
		);
	};

	return (
		<>
			<TrippyTabs.Screen
				options={{
					title: "Settings",
				}}
			/>
			<ScrollView
				style={{
					paddingHorizontal: 16,
					paddingTop: 16,
				}}
				contentContainerStyle={{
					gap: 24,
					alignItems: "center",
				}}
			>
				<View style={styles.container}>
					<View style={styles.item}>
						<Text style={styles.itemTitle}>Name</Text>

						<TextInput
							style={{ flex: 1, textAlign: "right" }}
							value={name ?? ""}
							onChangeText={setName}
							blurOnSubmit
						/>
					</View>
					<View style={styles.seperator} />
					<DateInput
						label="Start date"
						date={startDate}
						setDate={setStartDate}
					/>
					<View style={styles.seperator} />
					<DateInput
						label="End date"
						date={endDate}
						setDate={setEndDate}
						minDate={startDate}
					/>
				</View>

				<Text className="self-start font-bold text-gray-500">Members</Text>

				<View style={{ width: "100%" }}>
					<Animated.View
						layout={LinearTransition.duration(300)}
						style={styles.container}
					>
						<AddMemberButton tripId={trip.id} />

						<View style={styles.seperator} />

						{sortedMembers.map((member, i) => (
							<Fragment key={member.id}>
								<UserListItem
									user={member}
									mode={member.id === user.id ? "leave" : "remove"}
									action={
										member.id === user.id
											? () => {
													Alert.alert(
														"Leave trip",
														"Are you sure you want to leave?",
														[
															{
																text: "Cancel",
																style: "cancel",
															},
															{
																text: "Leave",
																style: "destructive",
																onPress: () => {
																	leaveTripMutation.mutate({
																		tripId: trip.id,
																		userId: user.id,
																	});
																},
															},
														],
													);
												}
											: () => {
													Alert.alert(
														"Remove member",
														`Remove ${member.name}?`,
														[
															{
																text: "Cancel",
																style: "cancel",
															},
															{
																text: "Remove",
																style: "destructive",
																onPress: () => {
																	removeMemberMutation.mutate({
																		tripId: trip.id,
																		userId: member.id,
																	});
																},
															},
														],
													);
												}
									}
								/>
								{i !== trip.members.length - 1 && (
									<View style={styles.seperator} />
								)}
							</Fragment>
						))}
					</Animated.View>
				</View>

				<View
					style={{
						position: "relative",
						height: 24,
						width: "100%",
						alignItems: "center",
					}}
				>
					<Animated.View
						style={[
							{
								position: "absolute",
								top: 0,
							},
							animatedSaveButtonStyle,
						]}
					>
						<TouchableOpacity
							activeOpacity={0.66}
							onPress={() => saveTrip()}
							style={styles.saveButtonStyle}
						>
							<Text style={styles.saveButtonTitle}>Save changes</Text>
						</TouchableOpacity>
					</Animated.View>
				</View>
			</ScrollView>
		</>
	);
}

function AddMemberButton({ tripId }: { tripId: string }) {
	const queryClient = useQueryClient();

	const addMemberMutation = trpc.trips.addMember.useMutation({
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getQueryKey(trpc.trips.getById, tripId, "query"),
			});
		},
	});

	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState("");

	const [debouncedSearch] = useDebounce(search, 300);

	const { isLoading, data } = trpc.users.getBySearchString.useQuery({
		search: debouncedSearch,
		tripId,
	});

	if (isLoading) {
		return <FullscreenLoading />;
	}

	return (
		<>
			<Modal
				animationType="slide"
				presentationStyle="pageSheet"
				visible={isOpen}
				onRequestClose={() => {
					setIsOpen(!isOpen);
				}}
			>
				<View
					style={{
						backgroundColor: "white",
						borderBottomWidth: StyleSheet.hairlineWidth,
						borderBottomColor: "rgba(84, 84, 86, 0.33)",
						flexDirection: "column",
						gap: 16,
						padding: 16,
					}}
				>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
						}}
					>
						<TouchableOpacity
							onPress={() => {
								setIsOpen(false);
							}}
						>
							<SymbolView
								name="chevron.left"
								size={20}
								resizeMode="scaleAspectFit"
							/>
						</TouchableOpacity>

						<View className="flex-1" />

						<Text style={{ fontWeight: "bold" }}>Members</Text>

						<View className="flex-1" />
					</View>

					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<TextInput
							style={{
								backgroundColor: "rgba(120, 120, 128, 0.12)",
								width: "100%",
								padding: 8,
								borderRadius: 8,
							}}
							autoComplete="off"
							autoCorrect={false}
							autoCapitalize="none"
							enterKeyHint="search"
							onChangeText={(t) => setSearch(t)}
							clearButtonMode="while-editing"
						/>
					</View>
				</View>

				<View className="flex-1 gap-4 bg-gray-100 p-4">
					<Text
						style={{
							fontWeight: "bold",
							color: "rgba(60, 60, 67, 0.6)",
						}}
					>
						Add members
					</Text>

					{data?.map((user) => (
						<UserListItem
							key={user.id}
							user={{ ...user, isAdmin: false }}
							mode="add"
							action={() => {
								addMemberMutation.mutate({
									tripId,
									userId: user.id,
								});
							}}
						/>
					))}
				</View>
			</Modal>
			<TouchableOpacity style={styles.item} onPress={() => setIsOpen(true)}>
				<View
					style={[
						styles.userImg,
						{
							justifyContent: "center",
							alignItems: "center",
						},
					]}
				>
					<SymbolView
						name="person.badge.plus"
						size={24}
						tintColor="#6b7280"
						resizeMode="scaleAspectFit"
					/>
				</View>

				<Text className="font-bold text-gray-500">Add new member</Text>
			</TouchableOpacity>
		</>
	);
}

function UserListItem({
	user,
	mode,
	action,
}: {
	user: Member;
	mode: "add" | "remove" | "leave";
	action: () => void;
}) {
	return (
		<Animated.View
			layout={LinearTransition.duration(300)}
			exiting={FadeOut.duration(300)}
			style={styles.userItem}
		>
			<Image source={{ uri: user.pictureUrl ?? "" }} style={styles.userImg} />

			<View className="flex flex-row items-center">
				{user.isAdmin && (
					<SymbolView
						name="shield.lefthalf.fill"
						resizeMode="scaleAspectFit"
						size={20}
						tintColor="#007AFF"
					/>
				)}

				<Text>{user.name}</Text>
			</View>

			<View className="flex-1" />

			<TouchableOpacity onPress={() => action()}>
				<SymbolView
					name={
						mode === "add"
							? "plus.circle.fill"
							: mode === "remove"
								? "xmark.circle.fill"
								: "door.right.hand.open"
					}
					resizeMode="scaleAspectFit"
					size={20}
				/>
			</TouchableOpacity>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
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
	saveButtonStyle: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#DDF1FF",
		borderRadius: 99,
		borderCurve: "continuous",
		paddingVertical: 12,
		paddingHorizontal: 36,
	},
	saveButtonTitle: {
		color: "#25AAF6",
		fontWeight: "bold",
		fontSize: 16,
	},
});
