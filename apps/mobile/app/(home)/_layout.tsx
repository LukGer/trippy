import { UserContext } from "@/src/context/UserContext";
import { trpc } from "@/utils/trpc";
import { useAuth } from "@clerk/clerk-expo";
import { skipToken } from "@tanstack/react-query";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator } from "react-native";

export default function HomeLayout() {
  const { isSignedIn, userId } = useAuth();

  const { data } = trpc.user.getByClerkId.useQuery(
    !userId
      ? skipToken
      : {
          clerkId: userId!,
        }
  );

  if (!isSignedIn) {
    return <Redirect href="/login" />;
  }

  if (!data?.user) {
    return <ActivityIndicator />;
  }

  return (
    <UserContext.Provider value={data.user}>
      <Stack>
        <Stack.Screen
          name="trips/[id]/members"
          options={{ presentation: "formSheet" }}
        />
      </Stack>
    </UserContext.Provider>
  );
}
