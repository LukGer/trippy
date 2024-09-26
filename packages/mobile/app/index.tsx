import { Link } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native";

const STATES = ["loading", "error", "loading", "success"] as const;

export default function IndexPage() {
	const [state, setState] = useState(0);

	return (
		<SafeAreaView style={{ flex: 1, gap: 50, marginHorizontal: 20 }}>
			<Link href="/(home)">Home</Link>
			<Link href="/onboarding" replace>
				Login
			</Link>

			<Link href="/onboarding">Onboarding</Link>
		</SafeAreaView>
	);
}
