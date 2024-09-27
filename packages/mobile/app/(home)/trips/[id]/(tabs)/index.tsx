import { useTrip } from "@/src/hooks/useTrip";
import { useTrippyUser } from "@/src/hooks/useTrippyUser";
import { TrippyTabs } from "@/src/navigation/trippy-tabs";
import { stringToColor } from "@/src/utils/colored-name";
import { trpc } from "@/src/utils/trpc";
import { FlashList } from "@shopify/flash-list";
import type { RouterOutputs } from "@trippy/api";
import { useCallback, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ChatMessage = RouterOutputs["chats"]["getByTripId"]["data"][number];

export default function TripMessagesPage() {
	const { bottom } = useSafeAreaInsets();

	const trip = useTrip();
	const user = useTrippyUser();

	const { data, isLoading, hasNextPage, fetchNextPage } =
		trpc.chats.getByTripId.useInfiniteQuery(
			{
				tripId: trip.id,
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			},
		);

	const flattenData = useMemo(() => {
		return (data?.pages.flatMap((page) => page.data) ?? []).reverse();
	}, [data?.pages]);

	const onEndReached = useCallback(() => {
		hasNextPage && fetchNextPage();
	}, [hasNextPage, fetchNextPage]);

	return (
		<>
			<TrippyTabs.Screen
				options={{
					title: "Chat",
				}}
			/>
			{isLoading ? (
				<Text>Loading...</Text>
			) : (
				<View
					style={{
						flex: 1,
						marginBottom: bottom,
						marginHorizontal: 16,
					}}
				>
					<FlashList
						data={flattenData}
						onEndReached={onEndReached}
						onEndReachedThreshold={0.5}
						estimatedItemSize={58}
						keyExtractor={(item) => item.id}
						inverted
						renderItem={({ item }) => (
							<ChatMessage message={item} userId={user.id} />
						)}
					/>
					<View style={styles.input} />
				</View>
			)}
		</>
	);
}

function ChatMessage({
	message,
	userId,
}: { message: ChatMessage; userId: string }) {
	const isMe = message.userId === userId;
	const usernameColor = stringToColor(message.user.name);

	return (
		<View
			style={[
				styles.bubble,
				{
					alignSelf: isMe ? "flex-end" : "flex-start",
					backgroundColor: isMe ? "#ecfdf5" : "#f0f9ff",
				},
			]}
		>
			{!isMe && (
				<Text style={[styles.messageUser, { color: usernameColor }]}>
					{message.user.name}
				</Text>
			)}
			<Text style={styles.message}>{message.content}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	input: {
		height: 50,
		width: "100%",
		backgroundColor: "white",
		borderRadius: 99,
	},
	bubbleContainer: {
		width: "100%",
		flexDirection: "row",
	},
	bubble: {
		flexDirection: "column",
		gap: 4,
		backgroundColor: "white",
		marginTop: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 12,
		shadowColor: "black",
		shadowRadius: 4,
		shadowOpacity: 0.1,
		shadowOffset: {
			width: 0,
			height: 0,
		},
	},
	messageUser: {
		fontWeight: "bold",
		fontSize: 14,
	},
	message: {
		fontSize: 16,
	},
});
