import { usePathProgress } from "@/src/hooks/usePathProgress";
import {
	Canvas,
	LinearGradient,
	Rect,
	Skia,
	Image as SkiaImage,
	useImage,
	type DataSourceParam,
	type SkPoint,
} from "@shopify/react-native-skia";
import * as AppleAuthentication from "expo-apple-authentication";
import { useEffect } from "react";
import {
	Image,
	StatusBar,
	StyleSheet,
	Text,
	View,
	useWindowDimensions,
} from "react-native";
import Animated, {
	Easing,
	interpolate,
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
	withDelay,
	withTiming,
	type SharedValue,
} from "react-native-reanimated";

const AppIconImg = require("../../assets/images/icon_prd.png");
const Memoji01 = require("../../assets/images/memoji_01.png");
const Memoji02 = require("../../assets/images/memoji_02.png");
const Memoji03 = require("../../assets/images/memoji_03.png");
const Memoji04 = require("../../assets/images/memoji_04.png");
const Europe = require("../../assets/images/europe.png");

export default function OnboardingPage() {
	const { width: windowWidth, height: windowHeight } = useWindowDimensions();

	const progress = useSharedValue(0);

	useEffect(() => {
		progress.value = withDelay(
			1000,
			withTiming(1, {
				duration: 500,
				easing: Easing.out(Easing.quad),
			}),
		);
	}, []);

	return (
		<>
			<StatusBar barStyle="dark-content" />
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

					<Memoji
						src={Memoji01}
						start={Skia.Point(40, 180)}
						d={100}
						deg={-10}
						progress={progress}
						windowWidth={windowWidth}
						windowHeight={windowHeight}
					/>
					<Memoji
						src={Memoji02}
						start={Skia.Point(0, 290)}
						d={120}
						deg={-20}
						progress={progress}
						windowWidth={windowWidth}
						windowHeight={windowHeight}
					/>
					<Memoji
						src={Memoji03}
						start={Skia.Point(140, 220)}
						d={130}
						deg={10}
						progress={progress}
						windowWidth={windowWidth}
						windowHeight={windowHeight}
					/>
					<Memoji
						src={Memoji04}
						start={Skia.Point(150, 90)}
						d={100}
						deg={5}
						progress={progress}
						windowWidth={windowWidth}
						windowHeight={windowHeight}
					/>
				</Canvas>

				<AppIcon progress={progress} />

				<Title progress={progress} />

				<SubTitle progress={progress} />

				<SocialButtons progress={progress} />
			</View>
		</>
	);
}

const Memoji = ({
	src,
	progress,
	windowWidth,
	windowHeight,
	start,
	d,
	deg,
}: {
	src: DataSourceParam;
	progress: SharedValue<number>;
	windowWidth: number;
	windowHeight: number;
	start: SkPoint;
	d: number;
	deg: number;
}) => {
	const path = Skia.Path.Make();
	path.moveTo(start.x + d / 2, start.y + d / 2);
	path.quadTo(
		windowWidth / 2 - d / 2,
		start.y + d / 2,
		windowWidth / 2 - d / 2,
		windowHeight / 2 - d / 2,
	);

	const pathProgress = usePathProgress(path, progress);

	const img = useImage(src);

	const transform = useDerivedValue(() => {
		const point = pathProgress.value;

		return [
			{ translateX: point.x },
			{ translateY: point.y },
			{ scale: interpolate(progress.value, [0, 1], [1, 0.5]) },
			{ rotate: (deg * Math.PI) / 180 },
		];
	});

	return (
		<SkiaImage
			origin={Skia.Point(d / 2, d / 2)}
			transform={transform}
			rect={{
				x: 0,
				y: 0,
				width: d,
				height: d,
			}}
			image={img}
		/>
	);
};

const AppIcon = ({ progress }: { progress: SharedValue<number> }) => {
	const animatedStyle = useAnimatedStyle(() => {
		return {
			opacity: interpolate(progress.value, [0, 1], [0, 1]),
			transform: [
				{ translateY: interpolate(progress.value, [0, 1], [200, 0]) },
			],
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

const SocialButtons = ({ progress }: { progress: SharedValue<number> }) => {
	const animatedStyle = useAnimatedStyle(() => {
		return {
			opacity: interpolate(progress.value, [0, 1], [0, 1]),
			transform: [
				{ translateY: interpolate(progress.value, [0, 1], [0, -50]) },
			],
		};
	});

	return (
		<Animated.View style={[styles.socialButtons, animatedStyle]}>
			<AppleAuthentication.AppleAuthenticationButton
				buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
				buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
				cornerRadius={5}
				style={styles.button}
				onPress={async () => {
					try {
						const credential = await AppleAuthentication.signInAsync({
							requestedScopes: [
								AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
								AppleAuthentication.AppleAuthenticationScope.EMAIL,
							],
						});
						// signed in
					} catch (e: unknown) {
						console.error("Error during Apple authentication:", e);
					}
				}}
			/>
		</Animated.View>
	);
};

function getUsername(
	credential: AppleAuthentication.AppleAuthenticationCredential,
): string {
	return `${credential.fullName?.givenName} ${credential.fullName?.middleName} ${credential.fullName?.familyName}`.trim();
}

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
		fontFamily: "Quiny",
		fontSize: 72,
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
	socialButtons: {
		position: "absolute",
		bottom: 100,
		flexDirection: "column",
		gap: 8,
	},
});
