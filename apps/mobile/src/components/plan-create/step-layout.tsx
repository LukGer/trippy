import type { ReactNode } from "react";
import { Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import {
	PLAN_CREATE_FOOTER_FADE_PX,
	usePlanCreateScrollInset,
} from "@/src/components/plan-create/scroll-inset-context";

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
	const { scrollPaddingBottom, footerBlockHeight } =
		usePlanCreateScrollInset();

	return (
		<KeyboardAwareScrollView
			bottomOffset={footerBlockHeight + PLAN_CREATE_FOOTER_FADE_PX}
			className="flex-1"
			contentContainerClassName="px-6"
			contentContainerStyle={{ paddingBottom: scrollPaddingBottom }}
			contentInsetAdjustmentBehavior="automatic"
			keyboardShouldPersistTaps="handled"
			showsVerticalScrollIndicator={false}
		>
			<Text className="type-large-title mb-2 font-serif-bold text-ink-primary tracking-[-0.5px]">
				{title}
			</Text>
			{subtitle ? (
				<Text className="type-body mb-7 font-serif text-ink-body italic">
					{subtitle}
				</Text>
			) : null}
			{children}
		</KeyboardAwareScrollView>
	);
}
