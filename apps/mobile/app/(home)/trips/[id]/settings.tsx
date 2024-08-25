import { Stack } from "expo-router";
import { Text } from "react-native";

export default function TripSettingsPage() {
  return (
    <>
      <Stack.Screen options={{ title: "Settings" }} />
      <Text>Trip Settings</Text>
    </>
  );
}
