import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Pressable,
	Text,
	View,
} from "react-native";
import { authClient } from "@/src/utils/auth";

export default function UnauthedWelcomeScreen() {
	const [busy, setBusy] = useState(false);

	async function signInWithGoogle() {
		setBusy(true);
		try {
			const { error } = await authClient.signIn.social({
				provider: "google",
				callbackURL: "/(authed)/(tabs)/discover",
			});
			if (error) {
				Alert.alert(
					"Sign-in failed",
					error.message ?? "Something went wrong. Try again.",
				);
				return;
			}
			router.replace("/(authed)/(tabs)/discover");
		} finally {
			setBusy(false);
		}
	}

	return (
		<View className="flex-1 justify-center bg-surface-canvas px-6">
			<Text className="type-large-title font-serif-bold text-ink-primary">
				Trippy
			</Text>
			<Text className="type-callout mt-2 text-ink-secondary">
				Sign in to plan trips and keep everything in sync.
			</Text>
			<Pressable
				accessibilityRole="button"
				disabled={busy}
				onPress={() => void signInWithGoogle()}
				className="mt-10 flex-row items-center justify-center gap-3 rounded-2xl border border-line-hairline bg-surface-card py-4 active:opacity-80"
			>
				{busy ?
					<ActivityIndicator color="#1A1A1A" />
				:	<>
						<Ionicons name="logo-google" size={22} color="#1A1A1A" />
						<Text className="type-body font-medium text-ink-primary">
							Continue with Google
						</Text>
					</>
				}
			</Pressable>
		</View>
	);
}
