import { StateIndicator } from "@/src/components/StateIndicator";
import { Link } from "expo-router";
import { useState } from "react";
import { Button, SafeAreaView } from "react-native";

export default function IndexPage() {
	const [state, setState] = useState<"loading" | "error" | "success">(
		"loading",
	);

	return (
		<SafeAreaView style={{ flex: 1, gap: 50, marginHorizontal: 20 }}>
			<Link href="/(home)">Home</Link>
			<Link href="/onboarding" replace>
				Login
			</Link>

			<Link href="/onboarding">Onboarding</Link>

			<StateIndicator state={state} size="small" />

			<Button onPress={() => setState("loading")} title="Loading" />
			<Button onPress={() => setState("error")} title="Error" />
			<Button onPress={() => setState("success")} title="Success" />
		</SafeAreaView>
	);
}
