import { UserContext } from "@/src/context/UserContext";
import { trpc } from "@/utils/trpc";
import { useAuth } from "@clerk/clerk-expo";
import { skipToken } from "@tanstack/react-query";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

export default function HomeLayout() {
  const { isSignedIn, userId } = useAuth();

  const { data, isLoading, isError, error } = trpc.user.getByClerkId.useQuery(
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

  if (!data?.user) {
    return (
      <View style={{ flex: 1 }}>
        <Text>No user found</Text>
      </View>
    );
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
    <UserContext.Provider value={data.user}>
      <Stack />
    </UserContext.Provider>
  );
}
