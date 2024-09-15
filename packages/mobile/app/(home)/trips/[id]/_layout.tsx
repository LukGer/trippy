import { TripContext } from "@/src/hooks/useTrip";
import { trpc } from "@/src/utils/trpc";
import { Stack, useLocalSearchParams } from "expo-router";
import { StatusBar, Text } from "react-native";

export default function TripLayout() {
  const params = useLocalSearchParams<{ id: string }>();
  const tripId = params.id;

  const { data, isLoading } = trpc.trips.getById.useQuery(tripId);

  if (isLoading || !data) {
    return <Text>Loading...</Text>;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      <TripContext.Provider value={data}>
        <Stack />
      </TripContext.Provider>
    </>
  );
}
