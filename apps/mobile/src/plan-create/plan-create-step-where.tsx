import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { useCallback, useState } from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
	type ViewStyle,
} from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

type StartOptionId = "paste" | "attach" | "blank";

const OPTIONS = [
	{
		id: "paste" as const,
		title: "Paste anything",
		description: "Booking emails, lists, links — we'll figure it out",
		icon: "doc.text" as const,
	},
	{
		id: "attach" as const,
		title: "Attach receipts & PDFs",
		description: "Flights, hotel confirmations, screenshots",
		icon: "paperclip" as const,
	},
	{
		id: "blank" as const,
		title: "Start blank",
		description: "Build the itinerary by hand",
		icon: "plus" as const,
	},
] as const;

export function PlanCreateStepWhere() {
	const [tripName, setTripName] = useState("Japan, two weeks");
	const [startOption, setStartOption] = useState<StartOptionId>("paste");

	const onSelect = useCallback((id: StartOptionId) => {
		setStartOption(id);
		void Haptics.selectionAsync();
	}, []);

	return (
		<ScrollView
			style={styles.scroll}
			contentContainerStyle={styles.scrollContent}
			contentInsetAdjustmentBehavior="automatic"
			keyboardShouldPersistTaps="handled"
			showsVerticalScrollIndicator={false}
		>
			<Text style={styles.pageTitle}>Where to next?</Text>
			<Text style={styles.pageSubtitle}>
				Drop in anything — emails, receipts, a list of places. We&apos;ll turn it into
				a real itinerary.
			</Text>

			<View style={styles.field}>
				<Text style={styles.fieldLabel}>Trip name</Text>
				<TextInput
					value={tripName}
					onChangeText={setTripName}
					placeholder="Untitled trip"
					placeholderTextColor={Colors.ink.tertiary}
					style={styles.tripInput}
				/>
			</View>

			<Text style={styles.sectionLabel}>How would you like to start</Text>

			<View style={styles.optionList}>
				{OPTIONS.map((opt) => (
					<StartOptionCard
						key={opt.id}
						description={opt.description}
						icon={opt.icon}
						selected={startOption === opt.id}
						title={opt.title}
						onPress={() => onSelect(opt.id)}
					/>
				))}
			</View>
		</ScrollView>
	);
}

function StartOptionCard({
	title,
	description,
	icon,
	selected,
	onPress,
}: {
	title: string;
	description: string;
	icon: (typeof OPTIONS)[number]["icon"];
	selected: boolean;
	onPress: () => void;
}) {
	const cardStyle: ViewStyle[] = [
		styles.optionCard,
		selected ? styles.optionCardSelected : styles.optionCardIdle,
	];

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ selected }}
			onPress={onPress}
			style={({ pressed }) => [cardStyle, pressed && styles.optionCardPressed]}
		>
			<View style={styles.optionIconWrap}>
				<SymbolView name={icon} size={22} tintColor={Colors.ink.primary} />
			</View>
			<View style={styles.optionTextCol}>
				<Text style={styles.optionTitle}>{title}</Text>
				<Text style={styles.optionDescription}>{description}</Text>
			</View>
			{selected ? (
				<View style={styles.check}>
					<SymbolView name="checkmark" size={14} tintColor={Colors.ink.inverse} />
				</View>
			) : (
				<View style={styles.checkPlaceholder} />
			)}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	scroll: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 32,
		paddingHorizontal: 24,
	},
	pageTitle: {
		color: Colors.ink.primary,
		fontFamily: Fonts.serif.bold,
		fontSize: 32,
		letterSpacing: -0.5,
		lineHeight: 38,
		marginBottom: 8,
	},
	pageSubtitle: {
		color: Colors.ink.body,
		fontFamily: Fonts.serif.regular,
		fontSize: 16,
		fontStyle: "italic",
		lineHeight: 24,
		marginBottom: 28,
	},
	field: {
		marginBottom: 28,
	},
	fieldLabel: {
		color: Colors.ink.tertiary,
		fontFamily: Fonts.serif.semibold,
		fontSize: 11,
		letterSpacing: 1.2,
		marginBottom: 8,
		textTransform: "uppercase",
	},
	tripInput: {
		backgroundColor: Colors.surface.card,
		borderRadius: 14,
		color: Colors.ink.primary,
		fontFamily: Fonts.serif.regular,
		fontSize: 18,
		lineHeight: 24,
		overflow: "hidden",
		paddingHorizontal: 16,
		paddingVertical: 14,
	},
	sectionLabel: {
		color: Colors.ink.tertiary,
		fontFamily: Fonts.serif.semibold,
		fontSize: 11,
		letterSpacing: 1.2,
		marginBottom: 12,
		textTransform: "uppercase",
	},
	optionList: {
		gap: 12,
	},
	optionCard: {
		alignItems: "center",
		backgroundColor: Colors.surface.card,
		borderRadius: 14,
		flexDirection: "row",
		gap: 14,
		paddingHorizontal: 14,
		paddingVertical: 14,
	},
	optionCardIdle: {
		borderColor: "transparent",
		borderWidth: 1,
	},
	optionCardSelected: {
		borderColor: Colors.ink.primary,
		borderWidth: 1,
	},
	optionCardPressed: {
		opacity: 0.92,
	},
	optionIconWrap: {
		alignItems: "center",
		backgroundColor: Colors.surface.timelineBandA,
		borderRadius: 10,
		height: 44,
		justifyContent: "center",
		width: 44,
	},
	optionTextCol: {
		flex: 1,
		gap: 4,
	},
	optionTitle: {
		color: Colors.ink.primary,
		fontFamily: Fonts.serif.bold,
		fontSize: 17,
	},
	optionDescription: {
		color: Colors.ink.secondary,
		fontFamily: Fonts.serif.regular,
		fontSize: 14,
		fontStyle: "italic",
		lineHeight: 20,
	},
	check: {
		alignItems: "center",
		backgroundColor: Colors.ink.primary,
		borderRadius: 999,
		height: 26,
		justifyContent: "center",
		width: 26,
	},
	checkPlaceholder: {
		height: 26,
		width: 26,
	},
});
