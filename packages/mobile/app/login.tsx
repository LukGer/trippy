import { useWarmUpBrowser } from "@/src/hooks/useWarmupBrowser";
import { trpc } from "@/src/utils/trpc";
import { useOAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	SafeAreaView,
	Text,
	View,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";

WebBrowser.maybeCompleteAuthSession();

export default function LoginPage() {
	useWarmUpBrowser();

	const [googleLoading, setGoogleLoading] = useState(false);
	const { isLoaded, isSignedIn, user } = useUser();
	const google = useOAuth({ strategy: "oauth_google" });
	const createUserMutation = trpc.users.create.useMutation();

	const onGooglePressed = useCallback(async () => {
		setGoogleLoading(true);

		try {
			const { createdSessionId, signIn, setActive } =
				await google.startOAuthFlow();

			if (createdSessionId) {
				setActive?.({ session: createdSessionId });
			} else {
				await signIn?.create({});
			}
		} catch (err) {
			console.error("OAuth error", err);
		} finally {
			setGoogleLoading(false);
		}
	}, [google]);

	useEffect(() => {
		if (!isLoaded) return;

		if (isSignedIn) {
			createUserMutation.mutate({
				email: user.emailAddresses[0].emailAddress,
				name: user.fullName ?? user.username ?? "",
				clerkId: user.id,
				pictureUrl: user.imageUrl,
			});

			router.replace("/(home)/");
		}
	}, [isLoaded, isSignedIn]);

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<SafeAreaView style={{ flex: 1 }}>
				<View className="relative flex flex-1 flex-col items-center p-12">
					<View className="flex-1" />

					<View className="flex w-full flex-col gap-6">
						<LoginButton
							text="Login with Google"
							icon={<Ionicons name="logo-google" size={16} color="#000" />}
							loading={googleLoading}
							onPress={onGooglePressed}
						/>
					</View>
				</View>
			</SafeAreaView>
		</>
	);
}

function LoginButton({
	icon,
	text,
	loading,
	onPress,
}: {
	icon: React.ReactNode;
	text: string;
	loading: boolean;
	onPress: () => void;
}) {
	const isLoading = useSharedValue(true);

	const loadingStyle = useAnimatedStyle(() => ({
		transform: [
			{
				translateY: withSpring(isLoading.value ? 42 : 0, {
					mass: 1,
					damping: 15,
					stiffness: 200,
				}),
			},
		],
	}));

	useEffect(() => {
		isLoading.value = loading;
	}, [loading, isLoading]);

	return (
		<Pressable
			className="relative flex h-12 flex-row items-center justify-center gap-2 overflow-hidden rounded-lg bg-white transition-colors active:bg-purple-100"
			onPress={onPress}
		>
			<Animated.View
				style={[
					loadingStyle,
					{
						bottom: 0,
						position: "absolute",
						display: "flex",
						flexDirection: "column",
					},
				]}
			>
				<ActivityIndicator className="h-12" size="small" />
				<View className="flex h-12 flex-row items-center gap-2">
					{icon}
					<Text style={{ fontWeight: "bold" }}>{text}</Text>
				</View>
			</Animated.View>
		</Pressable>
	);
}
