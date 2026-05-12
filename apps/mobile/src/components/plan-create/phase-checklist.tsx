import { SymbolView } from "expo-symbols";
import { Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import type { PhaseRow } from "@/src/components/plan-create/itinerary-stream-parse";

type Props = {
	rows: PhaseRow[];
	streaming: boolean;
};


/** Live checklist while tools + itinerary JSON stream in */
export function PlanCreatePhaseChecklist({ rows, streaming }: Props) {
	if (!streaming && rows.length === 0) return null;

	return (
		<View className="mb-6 gap-3">
			{rows.length === 0 && streaming ? (
				<Text className="type-caption-1 font-serif text-ink-tertiary">
					Starting…
				</Text>
			) : null}
			{rows.map((row) => (
				<View key={row.id} className="flex-row items-center gap-3">
					<View className="h-6 w-6 items-center justify-center">

						<SymbolView
							animationSpec={{
								effect: { type: "scale" },
							}}
							name={
								row.status === "done"
									? "checkmark.circle.fill"
									: row.status === "active"
										? "ellipsis"
										: "circle"
							}
							size={16}
							tintColor={Colors.ink.primary}
						/>
					</View>
					<Text
						className={`type-body flex-1 font-serif ${
							row.status === "active"
								? "font-semibold text-ink-primary"
								: row.status === "done"
									? "text-ink-secondary"
									: "text-ink-tertiary"
						}`}
					>
						{row.label}
					</Text>
				</View>
			))}
		</View>
	);
}
