import { Stack } from "expo-router";
import { Text } from "react-native";

export default function SettingsPage() {
  return (
    <>
      <Stack.Screen options={{ headerTintColor: "black" }} />
      <Text>Settings</Text>
    </>
  );
}
