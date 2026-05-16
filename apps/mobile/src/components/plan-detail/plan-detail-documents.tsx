import { ScrollView, Text, View } from "react-native";
import { MONO_FONT } from "@/src/components/plan-detail/mono";

type Doc = {
	id: string;
	title: string;
	meta: string;
	ext: string;
	tone: string;
};

type Props = {
	documents: Doc[];
	onSeeAll?: () => void;
};

function DocThumb({ ext, tone }: { ext: string; tone: string }) {
	return (
		<View
			style={{
				width: 34,
				height: 34,
				borderRadius: 7,
				backgroundColor: tone,
				justifyContent: "flex-end",
				paddingLeft: 5,
				paddingBottom: 5,
				borderWidth: 0.5,
				borderColor: "rgba(0,0,0,0.08)",
				position: "relative",
			}}
		>
			<View
				style={{
					position: "absolute",
					top: 5,
					left: 5,
					right: 11,
					height: 1.5,
					borderRadius: 1,
					backgroundColor: "rgba(0,0,0,0.18)",
				}}
			/>
			<View
				style={{
					position: "absolute",
					top: 10,
					left: 5,
					right: 16,
					height: 1.5,
					borderRadius: 1,
					backgroundColor: "rgba(0,0,0,0.12)",
				}}
			/>
			<Text
				className="text-ink-secondary"
				style={{
					fontFamily: MONO_FONT,
					fontSize: 8,
					fontWeight: "600",
					letterSpacing: 0.4,
				}}
			>
				{ext}
			</Text>
		</View>
	);
}

function DocumentCard({ title, meta, ext, tone }: Doc) {
	return (
		<View
			className="bg-surface-card"
			style={{
				width: 118,
				borderRadius: 12,
				padding: 10,
				shadowColor: "#000",
				shadowOpacity: 0.04,
				shadowRadius: 12,
				shadowOffset: { width: 0, height: 2 },
			}}
		>
			<DocThumb ext={ext} tone={tone} />
			<View className="mt-2">
				<Text
					className="font-serif text-ink-primary"
					style={{ fontSize: 13, lineHeight: 15.5 }}
					numberOfLines={2}
				>
					{title}
				</Text>
				<Text
					className="mt-0.5 text-ink-tertiary"
					numberOfLines={1}
					style={{ fontSize: 10 }}
				>
					{meta}
				</Text>
			</View>
		</View>
	);
}

/** Horizontal-scrolling docs row; empty state hides the carousel and shows a hint instead. */
export function PlanDetailDocuments({ documents, onSeeAll }: Props) {
	return (
		<View className="mt-6 border-line-soft border-t pt-4">
			<View className="flex-row items-baseline justify-between pr-6 pl-6">
				<Text
					className="text-ink-tertiary uppercase"
					style={{
						fontFamily: MONO_FONT,
						fontSize: 10,
						letterSpacing: 1.2,
					}}
				>
					Documents · {String(documents.length).padStart(2, "0")}
				</Text>
				{documents.length > 0 && onSeeAll ? (
					<Text
						className="type-footnote text-ink-secondary"
						onPress={onSeeAll}
						suppressHighlighting
					>
						See all
					</Text>
				) : null}
			</View>
			{documents.length === 0 ? (
				<Text className="mt-2 px-6 font-serif text-ink-secondary italic" style={{ fontSize: 14 }}>
					Drop in flights, bookings, or IDs to keep them at hand.
				</Text>
			) : (
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{
						paddingHorizontal: 24,
						paddingTop: 12,
						paddingBottom: 4,
						gap: 12,
					}}
				>
					{documents.map((d) => (
						<DocumentCard key={d.id} {...d} />
					))}
				</ScrollView>
			)}
		</View>
	);
}
