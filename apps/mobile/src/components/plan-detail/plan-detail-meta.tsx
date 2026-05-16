import { Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { MONO_FONT } from "@/src/components/plan-detail/mono";

type Props = {
	dateRangeLabel: string | null;
	dayCount: number | null;
	title: string;
	subtitle: string | null;
	description: string | null;
};

/** Date eyebrow + serif title + system subtitle + italic description block. */
export function PlanDetailMeta({
	dateRangeLabel,
	dayCount,
	title,
	subtitle,
	description,
}: Props) {
	const eyebrowParts = [
		dateRangeLabel,
		dayCount !== null ? `${dayCount} day${dayCount === 1 ? "" : "s"}` : null,
	].filter((s): s is string => Boolean(s));
	return (
		<View className="px-6 pt-6">
			{eyebrowParts.length > 0 ? (
				<Text
					className="text-ink-tertiary uppercase"
					style={{
						fontFamily: MONO_FONT,
						fontSize: 10,
						letterSpacing: 1.2,
					}}
				>
					{eyebrowParts.join(" · ")}
				</Text>
			) : null}
			<Text
				className="mt-1.5 font-serif text-ink-primary"
				style={{
					fontSize: 36,
					lineHeight: 38,
					letterSpacing: -0.5,
					color: Colors.ink.primary,
				}}
			>
				{title}
			</Text>
			{subtitle ? (
				<Text className="type-footnote mt-1 text-ink-secondary">
					{subtitle}
				</Text>
			) : null}
			{description ? (
				<Text
					className="mt-4 font-serif text-ink-body italic"
					style={{ fontSize: 16, lineHeight: 23 }}
				>
					{description}
				</Text>
			) : null}
		</View>
	);
}
