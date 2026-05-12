import { Stack } from "expo-router";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Colors } from "@/constants/colors";
import {
	PLAN_CREATE_FOOTER_FADE_PX,
	usePlanCreateScrollInset,
} from "@/src/components/plan-create/scroll-inset-context";

/** Shared scroll shell; each step passes `title` through `<Stack.Screen options={{ title }} />`. */
export function PlanCreateStepLayout({
	title,
	subtitle,
	headerLargeTitle = true,
	children,
}: {
	title: string;
	subtitle?: string;
	/** Steps that render their own hero (Reading, Review) suppress the native large title. */
	headerLargeTitle?: boolean;
	children?: ReactNode;
}) {
	const { scrollPaddingBottom, footerBlockHeight } = usePlanCreateScrollInset();

	return (
		<>
			<Stack.Screen
				options={{
					title,
					headerLargeTitleEnabled: headerLargeTitle,
					headerTitleStyle: {
						color: Colors.ink.primary,
						fontFamily: "Newsreader",
						fontWeight: "600",
					},
					headerLargeTitleStyle: {
						color: Colors.ink.primary,
						fontFamily: "Newsreader",
						fontWeight: "600",
					},
				}}
			/>
			<KeyboardAwareScrollView
				bottomOffset={footerBlockHeight + PLAN_CREATE_FOOTER_FADE_PX}
				className="flex-1"
				collapsable={false}
				contentContainerClassName="px-4"
				contentContainerStyle={{ paddingBottom: scrollPaddingBottom }}
				contentInsetAdjustmentBehavior="automatic"
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				{subtitle ? (
					<Text className="type-body mb-7 font-serif text-ink-body italic">
						{subtitle}
					</Text>
				) : null}
				{children}
			</KeyboardAwareScrollView>
		</>
	);
}
