import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";

const SUGGESTIONS = [
	"Japan, two weeks",
	"Lisbon weekend",
	"Patagonia trek",
	"Tokyo to Kyoto",
	"Iceland ring road",
	"Bali honeymoon",
	"Italy by train",
	"Morocco road trip",
] as const;

const ROTATION_MS = 3000;
const ENTER_MS = 500;
const EXIT_MS = 500;
const CHAR_STAGGER_MS = 8;

/**
 * Cycles through trip-idea suggestions as an animated placeholder.
 * Each character mounts/unmounts with a per-index delay for a cascading wave on both enter and swap.
 */
export function AnimatedTripNamePlaceholder() {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		const id = setInterval(() => {
			setIndex((i) => (i + 1) % SUGGESTIONS.length);
		}, ROTATION_MS);
		return () => clearInterval(id);
	}, []);

	const text = SUGGESTIONS[index];

	return (
		<View className="flex-row">
			{Array.from(text).map((char, i) => (
				<Animated.Text
					// biome-ignore lint/suspicious/noArrayIndexKey: positional key intentional — pairs old/new chars at the same index across swaps
					key={`${index}-${i}`}
					entering={FadeInUp.springify()
						.duration(ENTER_MS)
						.delay(i * CHAR_STAGGER_MS)}
					exiting={FadeOutDown.springify()
						.duration(EXIT_MS)
						.delay(i * CHAR_STAGGER_MS)}
					className="type-body font-serif text-ink-tertiary"
				>
					{char}
				</Animated.Text>
			))}
		</View>
	);
}
