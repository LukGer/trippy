import { ChatMessage } from "@/src/components/chat-message";
import { FullscreenLoading } from "@/src/components/fullscreen-loading";
import { useChatMessages } from "@/src/hooks/useChatMessages";
import { useTrip } from "@/src/hooks/useTrip";
import { useTrippyUser } from "@/src/hooks/useTrippyUser";
import { TrippyTabs } from "@/src/navigation/trippy-tabs";
import { trpc } from "@/src/utils/trpc";
import { FlashList } from "@shopify/flash-list";
import { SymbolView } from "expo-symbols";
import React, { useCallback, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import Animated, {
	type SharedValue,
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";

const INPUT_HEIGHT = 50;
const INPUT_PADDING = 8;
const DEFAULT_PADDING = 64;

const useKeyboardHeight = () => {
	const height = useSharedValue(DEFAULT_PADDING);

	useKeyboardHandler({
		onMove: (e) => {
			"worklet";
			height.value = Math.max(e.height, DEFAULT_PADDING);
		},
		onEnd: (e) => {
			"worklet";
			height.value = Math.max(e.height, DEFAULT_PADDING);
		},
	});

	return height;
};

export default function TripMessagesPage() {
	const trip = useTrip();
	const user = useTrippyUser();
	const utils = trpc.useUtils();

	const keyboardHeight = useKeyboardHeight();

	const { data, isLoading, hasNextPage, fetchNextPage } =
		trpc.chats.getByTripId.useInfiniteQuery(
			{
				tripId: trip.id,
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			},
		);

	const addMessageMutation = trpc.chats.addMessage.useMutation({
		onSuccess: () => {
			utils.chats.invalidate();
		},
	});

	const messages = useChatMessages(
		data?.pages.flatMap((page) => page.data) ?? [],
	);

	const onEndReached = useCallback(() => {
		hasNextPage && fetchNextPage();
	}, [hasNextPage, fetchNextPage]);

	if (isLoading) {
		return <FullscreenLoading />;
	}

	return (
		<>
			<TrippyTabs.Screen
				options={{
					title: "Chat",
				}}
			/>

			<View
				style={{
					flex: 1,
				}}
			>
				<FlashList
					data={messages}
					onEndReached={onEndReached}
					onEndReachedThreshold={0.5}
					estimatedItemSize={58}
					contentContainerStyle={{
						paddingHorizontal: 16,
					}}
					keyExtractor={(item) => item.id}
					inverted
					renderItem={({ item, index }) => (
						<ChatMessage
							index={index}
							messages={messages}
							message={item}
							userId={user.id}
						/>
					)}
				/>
				<ChatInput
					keyboardHeight={keyboardHeight}
					onSend={(message) => {
						addMessageMutation.mutate({
							tripId: trip.id,
							userId: user.id,
							content: message,
						});
					}}
				/>
			</View>
		</>
	);
}

function ChatInput({
	keyboardHeight,
	onSend,
}: {
	keyboardHeight: SharedValue<number>;
	onSend: (message: string) => void;
}) {
	const [message, setMessage] = useState("");

	const inputStyle = useAnimatedStyle(() => ({
		height: keyboardHeight.value + INPUT_HEIGHT + INPUT_PADDING * 2,
	}));

	const onSubmit = useCallback(() => {
		onSend(message);
		setMessage("");
	}, [message, onSend]);

	return (
		<Animated.View style={[styles.inputContainer, inputStyle]}>
			<View style={{ position: "relative" }}>
				<TextInput
					value={message}
					onChangeText={setMessage}
					style={styles.input}
					placeholder="Type a message"
					enterKeyHint="send"
					onSubmitEditing={onSubmit}
				/>
				<TouchableOpacity onPress={onSubmit} style={styles.sendButton}>
					<SymbolView
						name="paperplane"
						size={24}
						resizeMode="scaleAspectFit"
						tintColor="white"
					/>
				</TouchableOpacity>
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	inputContainer: {
		backgroundColor: "#e5e7eb",
		width: "100%",
		paddingHorizontal: 8,
		paddingTop: 8,
		borderTopWidth: 1,
		borderTopColor: "#d1d5db",
	},
	sendButton: {
		position: "absolute",
		right: 5,
		top: 5,
		backgroundColor: "blue",
		height: 40,
		width: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	input: {
		height: INPUT_HEIGHT,
		paddingHorizontal: 16,
		backgroundColor: "white",
		borderRadius: 99,
	},
});
