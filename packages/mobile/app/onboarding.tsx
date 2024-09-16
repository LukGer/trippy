import { usePathProgress } from "@/src/hooks/usePathProgress";
import {
	Canvas,
	LinearGradient,
	Rect,
	Skia,
	Image as SkiaImage,
	useImage,
} from "@shopify/react-native-skia";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
	Image,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	useWindowDimensions,
} from "react-native";
import Animated, {
	Easing,
	interpolate,
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
	withTiming,
	type SharedValue,
} from "react-native-reanimated";

const AppIconImg = require("../assets/images/icon_prd.png");
const Memoji01 = require("../assets/images/memoji_01.png");
const Memoji02 = require("../assets/images/memoji_02.png");
const Memoji03 = require("../assets/images/memoji_03.png");
const Memoji04 = require("../assets/images/memoji_04.png");
const Europe = require("../assets/images/europe.png");

export default function OnboardingPage() {
	const [run, setRun] = useState(false);

	const { width: windowWidth, height: windowHeight } = useWindowDimensions();

	const progress = useSharedValue(0);

	useEffect(() => {
		progress.value = withTiming(run ? 1 : 0, {
			duration: 500,
			easing: Easing.out(Easing.quad),
		});
	}, [run]);

	return (
		<>
			<StatusBar barStyle="dark-content" />
			<Stack.Screen options={{ headerShown: false }} />
			<View style={{ flex: 1, alignItems: "center" }}>
				<Image source={Europe} style={styles.backgroundImage} />
				<Canvas style={styles.backgroundImage}>
					<Rect x={0} y={0} width={windowWidth} height={windowHeight}>
						<LinearGradient
							start={Skia.Point(0, 0)}
							end={Skia.Point(0, windowHeight)}
							colors={["#00000000", "#000000"]}
						/>
					</Rect>

					<FirstMemoji
						progress={progress}
						windowWidth={windowWidth}
						windowHeight={windowHeight}
					/>
					<SecondMemoji
						progress={progress}
						windowWidth={windowWidth}
						windowHeight={windowHeight}
					/>
					<ThirdMemoji
						progress={progress}
						windowWidth={windowWidth}
						windowHeight={windowHeight}
					/>
					<FourthMemoji
						progress={progress}
						windowWidth={windowWidth}
						windowHeight={windowHeight}
					/>
				</Canvas>

				<AppIcon progress={progress} />

				<Title progress={progress} />

				<SubTitle progress={progress} />

				<TouchableOpacity style={styles.button} onPress={() => setRun(!run)}>
					<Text>Lets go</Text>
				</TouchableOpacity>
			</View>
		</>
	);
}

const FirstMemoji = ({
	progress,
	windowWidth,
	windowHeight,
}: {
	progress: SharedValue<number>;
	windowWidth: number;
	windowHeight: number;
}) => {
	const center = Skia.Point(100, 320);

	const path = Skia.Path.Make();
	path.moveTo(center.x, center.y);
	path.lineTo(windowWidth / 2, windowHeight / 2);

	const pathProgress = usePathProgress(path, progress);

	const img = useImage(Memoji01);

	const transform = useDerivedValue(() => {
		const point = pathProgress.value;

		return [
			{ translateX: point.x },
			{ translateY: point.y },
			{ scale: interpolate(progress.value, [0, 1], [1, 0.5]) },
			{ rotate: (-15 * Math.PI) / 180 },
		];
	});

	return (
		<SkiaImage
			transform={transform}
			rect={{
				x: 0,
				y: 0,
				width: 100,
				height: 100,
			}}
			image={img}
		/>
	);
};

const SecondMemoji = ({
	progress,
	windowWidth,
	windowHeight,
}: {
	progress: SharedValue<number>;
	windowWidth: number;
	windowHeight: number;
}) => {
	const img = useImage(Memoji02);
	const center = Skia.Point(60, 440);

	const path = Skia.Path.Make();
	path.moveTo(center.x, center.y);
	path.lineTo(windowWidth / 2, windowHeight / 2);

	const pathProgress = usePathProgress(path, progress);

	const transform = useDerivedValue(() => {
		const point = pathProgress.value;

		return [
			{ translateX: point.x },
			{ translateY: point.y },
			{ scale: interpolate(progress.value, [0, 1], [1, 0.5]) },
			{ rotate: (-20 * Math.PI) / 180 },
		];
	});

	return (
		<SkiaImage
			transform={transform}
			rect={{
				x: 0,
				y: 0,
				width: 120,
				height: 120,
			}}
			image={img}
		/>
	);
};

const ThirdMemoji = ({
	progress,
	windowWidth,
	windowHeight,
}: {
	progress: SharedValue<number>;
	windowWidth: number;
	windowHeight: number;
}) => {
	const img = useImage(Memoji03);
	const center = Skia.Point(230, 360);

	const path = Skia.Path.Make();
	path.moveTo(center.x, center.y);
	path.lineTo(windowWidth / 2, windowHeight / 2);

	const pathProgress = usePathProgress(path, progress);

	const transform = useDerivedValue(() => {
		const point = pathProgress.value;

		return [
			{ translateX: point.x },
			{ translateY: point.y },
			{ scale: interpolate(progress.value, [0, 1], [1, 0.5]) },
			{ rotate: (15 * Math.PI) / 180 },
		];
	});

	return (
		<SkiaImage
			transform={transform}
			rect={{
				x: 0,
				y: 0,
				width: 130,
				height: 130,
			}}
			image={img}
		/>
	);
};

const FourthMemoji = ({
	progress,
	windowWidth,
	windowHeight,
}: {
	progress: SharedValue<number>;
	windowWidth: number;
	windowHeight: number;
}) => {
	const img = useImage(Memoji04);
	const center = Skia.Point(220, 250);

	const path = Skia.Path.Make();
	path.moveTo(center.x, center.y);
	path.lineTo(windowWidth / 2, windowHeight / 2);

	const pathProgress = usePathProgress(path, progress);

	const transform = useDerivedValue(() => {
		const point = pathProgress.value;

		return [
			{ translateX: point.x },
			{ translateY: point.y },
			{ scale: interpolate(progress.value, [0, 1], [1, 0.5]) },
			{ rotate: (5 * Math.PI) / 180 },
		];
	});

	return (
		<SkiaImage
			transform={transform}
			rect={{
				x: 0,
				y: 0,
				width: 100,
				height: 100,
			}}
			image={img}
		/>
	);
};

const AppIcon = ({ progress }: { progress: SharedValue<number> }) => {
	const animatedStyle = useAnimatedStyle(() => {
		return {
			opacity: interpolate(progress.value, [0, 1], [0, 1]),
			transform: [{ scale: interpolate(progress.value, [0, 1], [1.2, 1]) }],
		};
	});

	return (
		<Animated.View style={[styles.appIconContainer, animatedStyle]}>
			<Image source={AppIconImg} style={styles.appIcon} />
		</Animated.View>
	);
};

const Title = ({ progress }: { progress: SharedValue<number> }) => {
	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{ translateY: interpolate(progress.value, [0, 1], [0, -50]) },
			],
		};
	});

	return (
		<Animated.Text style={[styles.title, animatedStyle]}>Trippy</Animated.Text>
	);
};

const SubTitle = ({ progress }: { progress: SharedValue<number> }) => {
	const animatedStyle = useAnimatedStyle(() => {
		return {
			opacity: interpolate(progress.value, [0, 1], [0, 1]),
			transform: [
				{ translateY: interpolate(progress.value, [0, 1], [0, -50]) },
			],
		};
	});

	return (
		<Animated.View style={[styles.subtitles, animatedStyle]}>
			<Text style={styles.subtitle}>Your new travel buddy</Text>
			<Text style={styles.subtitle}>Everything in one place</Text>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	backgroundImage: {
		...StyleSheet.absoluteFillObject,
		zIndex: -10,
	},
	button: {
		width: 150,
		backgroundColor: "white",
		padding: 10,
		borderRadius: 10,
		position: "absolute",
		bottom: 50,
		alignItems: "center",
		justifyContent: "center",
	},
	title: {
		fontSize: 56,
		fontWeight: "bold",
		color: "white",
		position: "absolute",
		bottom: 200,
	},

	subtitles: {
		flexDirection: "column",
		gap: 8,
		position: "absolute",
		bottom: 120,
	},
	subtitle: {
		fontSize: 24,
		color: "white",
	},
	appIconContainer: {
		position: "absolute",
		bottom: 340,
	},
	appIcon: {
		width: 150,
		height: 150,
		borderRadius: 24,
		borderCurve: "continuous",
	},
});
