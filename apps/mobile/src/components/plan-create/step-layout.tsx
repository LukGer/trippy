import { Stack } from "expo-router";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import {
	PLAN_CREATE_FOOTER_FADE_PX,
	usePlanCreateScrollInset,
} from "@/src/components/plan-create/scroll-inset-context";

/** Shared scroll shell; each step passes `title` through `<Stack.Screen options={{ title }} />`. */
export function PlanCreateStepLayout({
	title,
	subtitle,
	children,
}: {
	title: string;
	subtitle?: string;
	children?: ReactNode;
}) {
	const { scrollPaddingBottom, footerBlockHeight } = usePlanCreateScrollInset();

	return (
		<>
			<Stack.Screen options={{ title, headerLargeTitleEnabled: true, headerTransparent: true, headerBlurEffect: "systemChromeMaterial" }} />
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
