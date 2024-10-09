import type { Message } from "@trippy/core/src/message/message";
import type { ReactNode } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import * as Menu from "zeego/context-menu";
import { stringToColor } from "../utils/colored-name";

export function ChatMessage({
	index,
	messages,
	message,
	userId,
}: {
	index: number;
	messages: Message.Info[];
	message: Message.Info;
	userId: string;
}) {
	if (message.type === "system") {
		return <SystemMessage message={message} />;
	}

	if (message.type === "expense") {
		return <ExpenseMessage message={message} />;
	}

	const prevMessage = messages.at(index - 1);

	const isMe = message.userId === userId;

	const showName =
		message.userId !== userId ||
		(prevMessage &&
			prevMessage.type === "chat" &&
			prevMessage.userId !== message.userId);

	const usernameColor = stringToColor(message.user.name);

	return (
		<ChatMessageMenu>
			<View
				style={[
					styles.bubble,
					{
						alignSelf: isMe ? "flex-end" : "flex-start",
						backgroundColor: isMe ? "#ecfdf5" : "#f8fafc",
					},
				]}
			>
				{showName && (
					<Text style={[styles.messageUser, { color: usernameColor }]}>
						{message.user.name}
					</Text>
				)}
				<Text style={styles.message}>{message.content}</Text>
			</View>
		</ChatMessageMenu>
	);
}

function ChatMessageMenu({
	children,
	message,
}: { children: ReactNode; message: Message.UserMessage }) {
	return (
		<Menu.Root>
			<Menu.Trigger>{children}</Menu.Trigger>
			<Menu.Preview>
				{() => (
					<View
						style={[
							styles.bubble,
							{
								backgroundColor: "#ecfdf5",
							},
						]}
					>
						<Text style={styles.message}>{message.content}</Text>
					</View>
				)}
			</Menu.Preview>
			<Menu.Content>
				<Menu.Label>Trip Menu</Menu.Label>
				<Menu.Item
					key="delete"
					onSelect={() => Alert.alert("Left group")}
					destructive
				>
					<Menu.ItemIcon ios={{ name: "door.left.hand.open" }} />
					<Menu.ItemTitle>Leave</Menu.ItemTitle>
				</Menu.Item>
			</Menu.Content>
		</Menu.Root>
	);
}

function SystemMessage({ message }: { message: Message.SystemMessage }) {
	return (
		<View style={styles.systemBubble}>
			<Text style={styles.systemMessage}>{message.content}</Text>
		</View>
	);
}

function ExpenseMessage({ message }: { message: Message.ExpenseMessage }) {
	return (
		<View style={styles.bubble}>
			<Text style={styles.message}>{message.amount}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	bubble: {
		maxWidth: "85%",
		flexDirection: "column",
		gap: 4,
		backgroundColor: "white",
		marginVertical: 8,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 12,
		shadowColor: "black",
		shadowRadius: 4,
		shadowOpacity: 0.1,
		shadowOffset: {
			width: 0,
			height: 0,
		},
	},
	systemBubble: {
		alignSelf: "center",
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 99,
		backgroundColor: "#ececec",
		marginVertical: 8,
	},
	systemMessage: {
		fontSize: 12,
		color: "#666",
	},
	messageUser: {
		fontWeight: "bold",
		fontSize: 14,
	},
	message: {
		fontSize: 16,
	},
});
