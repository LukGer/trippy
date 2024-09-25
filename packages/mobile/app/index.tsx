import { Link } from "expo-router";
import { SafeAreaView } from "react-native";

export default function IndexPage() {
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
