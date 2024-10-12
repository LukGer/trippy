import { Canvas, LinearGradient, Rect } from "@shopify/react-native-skia";
import type { RouterOutputs } from "@trippy/api";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { trpc } from "../utils/trpc";

type Trips = RouterOutputs["trips"]["getTripsByUserId"];

const URGENCY_THRESHOLD = 7;

export function TripCard({ trip }: { trip: Trips[number] }) {
	const utils = trpc.useUtils();

	const isUrgent =
		!dayjs(trip.endDate).isBefore(dayjs()) &&
		dayjs(trip.startDate).diff(dayjs(), "days") < URGENCY_THRESHOLD;

	return (
		<Link
			href={{ pathname: "/(home)/trips/[id]", params: { id: trip.id } }}
			asChild
		>
			<TouchableOpacity
				activeOpacity={0.8}
				onPress={() => {
					utils.trips.getById.setData(trip.id, trip);
				}}
			>
				<Animated.View
					layout={LinearTransition}
					style={{
						borderRadius: 20,
						borderCurve: "continuous",
						height: 200,
						overflow: "hidden",
						minWidth: 350,
					}}
				>
					<Image
						source={{ uri: trip.imageUrl }}
						style={{
							position: "absolute",
							width: "100%",
							height: "100%",
							zIndex: 0,
						}}
						cachePolicy="none"
					/>

					<Canvas
						style={{
							position: "absolute",
							width: "100%",
							height: "100%",
							zIndex: 1,
						}}
					>
						<Rect width={500} height={200}>
							<LinearGradient
								colors={["#00000000", "#000000AA"]}
								start={{ x: 0, y: 0 }}
								end={{ x: 0, y: 200 }}
							/>
						</Rect>
					</Canvas>

					<View className="flex-1" />

					<View className="flex flex-row p-5" style={{ zIndex: 10 }}>
						<View className="flex flex-1 flex-col">
							<Text
								numberOfLines={1}
								className="mb-2 font-bold text-4xl text-white"
							>
								{trip.name}
							</Text>

							<View className="flex w-full flex-row items-center gap-2">
								{isUrgent && (
									<SymbolView
										name="alarm.fill"
										tintColor="white"
										size={16}
										resizeMode="scaleAspectFill"
									/>
								)}

								<Text className="font-bold text-white">
									{dayjs(trip.startDate).fromNow()}
								</Text>

								<View className="flex-1" />

								<MembersList members={trip.members} />
							</View>
						</View>
					</View>
				</Animated.View>
			</TouchableOpacity>
		</Link>
	);
}

export function TripCardPreview({ trip }: { trip: Trips[number] }) {
	const isUrgent =
		!dayjs(trip.endDate).isBefore(dayjs()) &&
		dayjs(trip.startDate).diff(dayjs(), "days") < URGENCY_THRESHOLD;

	return (
		<View
			style={{
				height: 200,
				minWidth: 350,
			}}
		>
			<Image
				source={{ uri: trip.imageUrl }}
				style={{
					position: "absolute",
					width: "100%",
					height: "100%",
					zIndex: 0,
				}}
				cachePolicy="none"
			/>

			<Canvas
				style={{
					position: "absolute",
					width: "100%",
					height: "100%",
					zIndex: 1,
				}}
			>
				<Rect width={500} height={200}>
					<LinearGradient
						colors={["#00000000", "#000000AA"]}
						start={{ x: 0, y: 0 }}
						end={{ x: 0, y: 200 }}
					/>
				</Rect>
			</Canvas>

			<View className="flex-1" />

			<View className="flex flex-row p-5" style={{ zIndex: 10 }}>
				<View className="flex flex-1 flex-col">
					<Text
						numberOfLines={1}
						className="mb-2 font-bold text-4xl text-white"
					>
						{trip.name}
					</Text>

					<View className="flex w-full flex-row items-center gap-2">
						{isUrgent && (
							<SymbolView
								name="alarm.fill"
								tintColor="white"
								size={16}
								resizeMode="scaleAspectFill"
							/>
						)}

						<Text className="font-bold text-white">
							{dayjs(trip.startDate).fromNow()}
						</Text>

						<View className="flex-1" />

						<MembersList members={trip.members} />
					</View>
				</View>
			</View>
		</View>
	);
}

const MAX_CIRCLES = 3;

function MembersList({ members }: { members: Trips[number]["members"] }) {
	const visibleMembers = members.slice(0, MAX_CIRCLES);

	const remainingMembers = members.length - MAX_CIRCLES;

	return (
		<View className="flex flex-row-reverse">
			{visibleMembers.map((member, i) => (
				<Image
					key={member.id}
					source={{ uri: member.pictureUrl ?? "" }}
					style={{
						width: 36,
						height: 36,
						borderRadius: 99,
						alignSelf: "flex-end",
						borderWidth: 1,
						borderColor: "#FFF",
						marginRight: i === 0 ? 0 : -10,
						zIndex: members.length - i,
					}}
				/>
			))}
			{remainingMembers > 0 && (
				<View
					style={{
						width: 36,
						height: 36,
						borderRadius: 99,
						alignSelf: "flex-end",
						backgroundColor: "white",
						justifyContent: "center",
						alignItems: "center",
						marginRight: -10,
						zIndex: 0,
					}}
				>
					<Text className="font-bold">+{remainingMembers}</Text>
				</View>
			)}
		</View>
	);
}
