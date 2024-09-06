import { Link } from "expo-router";
import { SafeAreaView } from "react-native";

export default function IndexPage() {
  return (
    <SafeAreaView style={{ flex: 1, gap: 50, marginHorizontal: 20 }}>
      <Link href="/(home)">Home</Link>
      <Link href="/login">Login</Link>
    </SafeAreaView>
  );
}
