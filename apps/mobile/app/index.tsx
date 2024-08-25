import { Link } from "expo-router";
import { SafeAreaView } from "react-native";

export default function IndexPage() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Link href="/(home)">Home</Link>
    </SafeAreaView>
  );
}
