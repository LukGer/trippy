import { useTrip } from "@/src/hooks/useTrip";
import { Text } from "react-native";
import { TrippyTopTabs } from "./_layout";

export default function TripMessagesPage() {
  const trip = useTrip();

  return (
    <>
      <TrippyTopTabs.Screen
        options={{
          title: "Chat",
        }}
      />
      <Text>{trip.name}</Text>
    </>
  );
}
