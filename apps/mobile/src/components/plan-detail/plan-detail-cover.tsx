import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { PLAN_CARD_PALETTES } from "@/src/components/plans/plan-card-palettes";

type Props = {
	coverImageUrl: string | null;
	paletteIndex: number;
};

const COVER_HEIGHT = 360;

/** Edge-to-edge cover; falls back to the same striped tinted gradient used on plan cards. */
export function PlanDetailCover({ coverImageUrl, paletteIndex }: Props) {
	const { width } = useWindowDimensions();
	const palette = PLAN_CARD_PALETTES[paletteIndex % PLAN_CARD_PALETTES.length];
	const uri = coverImageUrl?.trim();
	return (
		<View style={{ width, height: COVER_HEIGHT, overflow: "hidden" }}>
			{uri ? (
				<Image
					source={{ uri }}
					style={StyleSheet.absoluteFill}
					contentFit="cover"
					transition={240}
				/>
			) : (
				<>
					<View
						className="absolute inset-0"
						style={{ backgroundColor: palette.bg }}
					/>
					<LinearGradient
						colors={["transparent", palette.stripe, "transparent"]}
						end={{ x: 1, y: 0.35 }}
						locations={[0.2, 0.5, 0.85]}
						start={{ x: 0, y: 0.65 }}
						style={StyleSheet.absoluteFill}
					/>
				</>
			)}
			{/* Soft top scrim so the back button stays legible on light covers. */}
			<LinearGradient
				colors={["rgba(0,0,0,0.28)", "transparent"]}
				end={{ x: 0.5, y: 1 }}
				locations={[0, 1]}
				pointerEvents="none"
				start={{ x: 0.5, y: 0 }}
				style={[StyleSheet.absoluteFill, { height: 140 }]}
			/>
		</View>
	);
}
