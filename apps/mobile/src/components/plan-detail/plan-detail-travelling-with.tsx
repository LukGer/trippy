import { Text, TouchableOpacity, View } from "react-native";
import { MONO_FONT } from "@/src/components/plan-detail/mono";

type Person = { id: string; name: string };

type Props = {
	people: Person[];
	onInvitePress?: () => void;
};

const AVATAR_TONES = [
	"#E8D5C4",
	"#C4D8E8",
	"#D8E8C4",
	"#E8C4D8",
	"#E0C8A8",
	"#B8C8B8",
];

function Avatar({
	name,
	tone,
	size = 28,
}: {
	name: string;
	tone: string;
	size?: number;
}) {
	const initial = name.slice(0, 1).toUpperCase();
	return (
		<View
			style={{
				width: size,
				height: size,
				borderRadius: size / 2,
				backgroundColor: tone,
				alignItems: "center",
				justifyContent: "center",
				borderWidth: 2,
				borderColor: "#FAFAF7",
			}}
		>
			<Text
				className="font-serif-semibold text-ink-secondary"
				style={{ fontSize: size * 0.42 }}
			>
				{initial}
			</Text>
		</View>
	);
}

/** Travelling-with row + Invite pill; centred state shows just the pill when nobody is added. */
export function PlanDetailTravellingWith({ people, onInvitePress }: Props) {
	return (
		<View className="mt-6 border-line-soft border-t px-6 pt-4">
			<View className="flex-row items-end justify-between">
				<View className="flex-1 pr-3">
					<Text
						className="text-ink-tertiary uppercase"
						style={{
							fontFamily: MONO_FONT,
							fontSize: 10,
							letterSpacing: 1.2,
						}}
					>
						Travelling with
					</Text>
					{people.length === 0 ? (
						<Text className="type-subhead mt-2 font-serif text-ink-secondary italic">
							Just you, for now
						</Text>
					) : (
						<View className="mt-2 flex-row items-center gap-2.5">
							<View className="flex-row items-center">
								{people.slice(0, 4).map((p, i) => (
									<View
										key={p.id}
										style={{ marginLeft: i === 0 ? 0 : -9 }}
									>
										<Avatar
											name={p.name}
											tone={AVATAR_TONES[i % AVATAR_TONES.length] ?? "#E8D5C4"}
										/>
									</View>
								))}
							</View>
							<Text className="type-footnote font-serif text-ink-primary">
								{people.map((p) => p.name).join(", ")}
							</Text>
						</View>
					)}
				</View>
				<TouchableOpacity
					accessibilityRole="button"
					activeOpacity={0.8}
					onPress={onInvitePress}
					className="rounded-full border border-ink-tertiary/40 px-3.5 py-1.5"
				>
					<Text className="type-footnote font-serif-semibold text-ink-primary">
						Invite
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}
