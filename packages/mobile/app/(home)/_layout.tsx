import { UserContext } from "@/src/context/UserContext";
import { trpc } from "@/src/utils/trpc";
import { useAuth } from "@clerk/clerk-expo";
import { skipToken } from "@tanstack/react-query";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

export default function HomeLayout() {
  const { isSignedIn, userId } = useAuth();

  const { data, isLoading, isError, error } = trpc.users.getByClerkId.useQuery(
    !userId
      ? skipToken
      : {
          clerkId: userId!,
        }
  );

  if (!isSignedIn) {
    return <Redirect href="/login" />;
  }

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (!data) {
    return <Redirect href="/login" />;
  }

  if (isError) {
    return (
      <View style={{ flex: 1 }}>
        <Text>Error</Text>
        <Text>{error.message}</Text>
      </View>
    );
  }

  return (
    <UserContext.Provider value={data}>
      <Stack>
        <Stack.Screen
          name="trips/new"
          options={{
            presentation: "formSheet",
          }}
        />
      </Stack>
    </UserContext.Provider>
  );
}
