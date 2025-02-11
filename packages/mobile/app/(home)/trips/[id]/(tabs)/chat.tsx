import { ChatMessage } from "@/src/components/chat-message";
import { FullscreenLoading } from "@/src/components/fullscreen-loading";
import { useChatMessages } from "@/src/hooks/useChatMessages";
import { useTrip } from "@/src/hooks/useTrip";
import { useTrippyUser } from "@/src/hooks/useTrippyUser";
import { TrippyTabs } from "@/src/navigation/trippy-tabs";
import { trpc } from "@/src/utils/trpc";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import React, { type ReactElement, useCallback, useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import Animated, {
	type SharedValue,
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";
import * as Menu from "zeego/dropdown-menu";

const INPUT_HEIGHT = 44;
const INPUT_PADDING = 8;
const DEFAULT_PADDING = 44;
const KEYBOARD_HEIGHT = 336;

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
						<ChatMessage message={item} userId={user.id} />
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
	const inputRef = useRef<TextInput>(null);

	const [isFocused, setIsFocused] = useState(false);

	const [message, setMessage] = useState("");

	const inputStyle = useAnimatedStyle(() => ({
		height: keyboardHeight.value + INPUT_HEIGHT + INPUT_PADDING * 2,
	}));

	const onSubmit = useCallback(() => {
		if (message.length === 0) {
			return;
		}

		onSend(message);
		setMessage("");
		inputRef.current?.blur();
	}, [message, onSend]);

	const onSendMenuClicked = useCallback((type: "expense") => {
		if (type === "expense") {
			console.log("Add expense");
		}
	}, []);

	return (
		<Animated.View style={[styles.inputContainer, inputStyle]}>
			<View
				style={{
					position: "relative",
					gap: 12,
					flexDirection: "row",
					alignItems: "center",
					marginHorizontal: 8,
				}}
			>
				<TextInput
					ref={inputRef}
					value={message}
					onChangeText={setMessage}
					style={styles.input}
					placeholder="Type a message"
					enterKeyHint="send"
					onSubmitEditing={onSubmit}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
				/>
				{isFocused ? (
					<TouchableOpacity onPress={onSubmit} style={styles.sendButton}>
						<SymbolView
							name="paperplane"
							size={20}
							resizeMode="scaleAspectFit"
							tintColor="white"
						/>
					</TouchableOpacity>
				) : (
					<SendMenu onClick={(type) => onSendMenuClicked(type)}>
						<TouchableOpacity style={styles.sendButton}>
							<SymbolView
								name="plus"
								size={20}
								resizeMode="scaleAspectFit"
								tintColor="white"
							/>
						</TouchableOpacity>
					</SendMenu>
				)}
			</View>
		</Animated.View>
	);
}

const SendMenu = ({ children }: { children: ReactElement }) => {
	const onClick = (type: "expense") => {
		router.navigate("/(home)/trips/[id]/addExpense/");
	};

	return (
		<Menu.Root>
			<Menu.Trigger>{children}</Menu.Trigger>
			<Menu.Content>
				<Menu.Item key={"expense"} onSelect={() => onClick("expense")}>
					<Menu.ItemIcon ios={{ name: "banknote.fill" }} />
					<Menu.ItemTitle>Add expense</Menu.ItemTitle>
				</Menu.Item>
			</Menu.Content>
		</Menu.Root>
	);
};

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
		backgroundColor: "blue",
		height: 36,
		width: 36,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	input: {
		flex: 1,
		height: INPUT_HEIGHT,
		paddingHorizontal: 16,
		backgroundColor: "white",
		borderRadius: 99,
	},
});
