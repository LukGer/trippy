import { TrippyTabs } from "@/src/components/Tabs";
import { trpc } from "@/utils/trpc";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TripDetailPage() {
  const params = useLocalSearchParams<{ id: string }>();
  const tripId = params.id;

  const { isLoading, data } = trpc.trips.getById.useQuery(tripId);

  const tabs = [
    {
      title: "Chat",
      content: <Text>Chat</Text>,
    },
    {
      title: "Expenses",
      content: <Text>Expenses</Text>,
    },
    {
      title: "Travel",
      content: <Text>Travel</Text>,
    },
    {
      title: "Documents",
      content: <Text>Documents</Text>,
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: data?.trip?.name ?? "",
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: "systemUltraThinMaterial",
          headerBackTitle: "Home",
          headerRight: () => (
            <Link
              href={{
                pathname: "/(home)/trips/[id]/settings",
                params: { id: tripId },
              }}
              asChild
            >
              <TouchableOpacity>
                <SymbolView
                  name="ellipsis"
                  size={24}
                  tintColor="black"
                  resizeMode="scaleAspectFit"
                />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          gap: 20,
        }}
      >
        {isLoading && (
          <View className="w-full h-full items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        )}
        <TrippyTabs tabs={tabs} />
      </ScrollView>
    </>
  );
}
