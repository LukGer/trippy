import { Text } from "react-native";
import { TrippyTopTabs } from "./_layout";

export default function TripDocumentsScreen() {
  return (
    <>
      <TrippyTopTabs.Screen
        options={{
          title: "Documents",
        }}
      />
      <Text>Documents</Text>
    </>
  );
}
