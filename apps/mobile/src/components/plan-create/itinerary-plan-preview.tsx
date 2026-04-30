import type {
	ItineraryDay,
	ItineraryItem,
	ItineraryPlanWithCover,
} from "@trippy/contracts/itinerary";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { Pressable, ScrollView, Text, View } from "react-native";

type AttachmentRef = { id: string; name: string };

function sourceLabel(
	sourceAttachmentId: string | undefined,
	attachments?: AttachmentRef[],
): string | null {
	const id = sourceAttachmentId?.trim();
	if (!id) return null;
	const hit = attachments?.find((a) => a.id === id);
	return hit?.name ?? null;
}

function DayCard({
	day,
	index,
	attachments,
}: {
	day: ItineraryDay;
	index: number;
	attachments?: AttachmentRef[];
}) {
	return (
		<View className="mb-6 rounded-[14px] border border-line-soft bg-surface-card p-4">
			<View className="mb-4 flex-row flex-wrap items-baseline justify-between gap-3">
				<View className="min-w-0 flex-1 flex-row flex-wrap items-baseline gap-x-1">
					<Text className="type-body font-serif text-ink-primary">
						{day.dateLabel ?? "…"}
					</Text>
					{day.locationLabel ?
						<Text className="type-body font-serif text-ink-secondary italic">
							· {day.locationLabel}
						</Text>
					:	null}
				</View>
				<Text className="type-caption-2 shrink-0 font-semibold text-ink-tertiary uppercase tracking-wide">
					{day.dayIndexLabel ?? `DAY ${String(index + 1).padStart(2, "0")}`}
				</Text>
			</View>

			{(day.items ?? []).map((item, i) => (
				<ItemRow
					key={`${day.dayIndexLabel ?? index}-${i}-${item.title ?? String(i)}`}
					item={item}
					attachments={attachments}
				/>
			))}
		</View>
	);
}

function ItemRow({
	item,
	attachments,
}: {
	item: ItineraryItem;
	attachments?: AttachmentRef[];
}) {
	const src = sourceLabel(item.sourceAttachmentId, attachments);
	return (
		<View className="mb-4">
			<Text className="type-caption-2 mb-1 font-semibold text-ink-tertiary uppercase tracking-wide">
				{item.type ?? "Other"}
			</Text>
			<Text className="type-subhead mb-0.5 font-serif-semibold text-ink-primary">
				{item.title ?? "…"}
			</Text>
			{item.subtitle ?
				<Text className="type-footnote font-serif text-ink-secondary italic">
					{item.subtitle}
				</Text>
			:	null}
			{src ?
				<Text className="type-caption-2 mt-1 font-serif text-ink-tertiary">
					Source: {src}
				</Text>
			:	null}
		</View>
	);
}

type Props = {
	plan: ItineraryPlanWithCover | null;
	attachments?: AttachmentRef[];
	maxHeightClass?: string;
};

/** Lightweight timeline-ish preview until pixel-perfect design lands. */
export function ItineraryPlanPreview({
	plan,
	attachments,
	maxHeightClass,
}: Props) {
	if (!plan) {
		return (
			<Text className="type-body font-serif text-ink-tertiary">{"—"}</Text>
		);
	}

	const hasTitle = Boolean(plan.generatedTripTitle?.trim());
	const hasDays = (plan.days?.length ?? 0) > 0;
	const hasTips = Boolean(plan.tips?.trim());
	const hasCover = Boolean(plan.coverImageUrl?.trim());

	if (!hasTitle && !hasDays && !hasTips && !hasCover) {
		return (
			<Text className="type-body font-serif text-ink-tertiary">{"—"}</Text>
		);
	}

	return (
		<ScrollView className={maxHeightClass ?? "max-h-[520px]"}>
			{hasCover ? (
				<View className="mb-4 overflow-hidden rounded-[14px] border border-line-soft">
					<Image
						source={{ uri: plan.coverImageUrl }}
						style={{ width: "100%", aspectRatio: 16 / 9 }}
						contentFit="cover"
						transition={200}
					/>
					{plan.coverPhotographerName && plan.coverPhotographerPageUrl ? (
						<Pressable
							onPress={() =>
								void Linking.openURL(plan.coverPhotographerPageUrl!)
							}
							className="px-3 py-2"
						>
							<Text className="type-caption-2 font-serif text-ink-tertiary">
								Photo by {plan.coverPhotographerName} on Unsplash
							</Text>
						</Pressable>
					) :	null}
				</View>
			) :	null}
			{plan.generatedTripTitle ?
				<Text className="type-subhead mb-4 font-serif-semibold text-ink-primary">
					{plan.generatedTripTitle}
				</Text>
			:	null}
			{(plan.days ?? []).map((day, idx) => (
				<DayCard
					key={`${day.dateLabel}-${idx}`}
					day={day}
					index={idx}
					attachments={attachments}
				/>
			))}
			{plan.tips ?
				<View className="rounded-[14px] bg-surface-timeline-a/60 px-4 py-3">
					<Text className="type-caption-2 mb-1 font-semibold text-ink-tertiary uppercase">
						Tips
					</Text>
					<Text className="type-footnote font-serif text-ink-secondary">
						{plan.tips}
					</Text>
				</View>
			:	null}
		</ScrollView>
	);
}
