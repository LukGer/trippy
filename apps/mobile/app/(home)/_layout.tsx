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
    return (
      <View style={{ flex: 1 }}>
        <ActivityIndicator />;
      </View>
    );
  }

  if (!data?.user) {
    return <Redirect href="/login" />;
  }

  if (isError) {
    return (
      <View style={{ flex: 1 }}>
        <Text className="text-red-600">{error.message}</Text>
      </View>
    );
  }

  return (
    <UserContext.Provider value={data.user}>
      <Stack></Stack>
    </UserContext.Provider>
  );
}
