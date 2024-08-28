import { trpc } from "@/utils/trpc";
import { DbTrip } from "@trippy/api";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function TripSettingsPage() {
  const params = useLocalSearchParams<{ id: string }>();
  const tripId = params.id;

  const { data, isLoading } = trpc.trips.getById.useQuery(tripId);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerRight: () => (
            <Link href=".." asChild>
              <TouchableOpacity>
                <Text className="font-bold text-blue-800">Close</Text>
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
      {isLoading || !data?.trip ? (
        <ActivityIndicator />
      ) : (
        <Settings trip={data.trip} />
      )}
    </>
  );
}

function Settings({ trip }: { trip: DbTrip }) {
  return <View className="flex flex-col px-6 pt-6 gap-4"></View>;
}
