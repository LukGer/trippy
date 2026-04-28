import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

/**
 * Shared scroll shell + title typography for plan-create steps.
 */
export function PlanCreateStepLayout({
	title,
	subtitle,
	children,
}: {
	title: string;
	subtitle?: string;
	children?: ReactNode;
}) {
	return (
		<ScrollView
			contentContainerStyle={planCreateStepStyles.scrollContent}
			contentInsetAdjustmentBehavior="automatic"
			keyboardShouldPersistTaps="handled"
			showsVerticalScrollIndicator={false}
			style={planCreateStepStyles.scroll}
		>
			<Text style={planCreateStepStyles.pageTitle}>{title}</Text>
			{subtitle ? (
				<Text style={planCreateStepStyles.pageSubtitle}>{subtitle}</Text>
			) : null}
			{children}
		</ScrollView>
	);
}

export const planCreateStepStyles = StyleSheet.create({
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
	bodyMuted: {
		color: Colors.ink.secondary,
		fontFamily: Fonts.serif.regular,
		fontSize: 16,
		lineHeight: 22,
	},
});
