import { trpc } from "@/utils/trpc";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function IndexPage() {
  const userQuery = trpc.hello.useQuery({
    text: "world",
  });

  return (
    <View className="flex flex-col gap-4">
      <TouchableOpacity
        className="p-4 bg-red-500 rounded-lg flex items-center"
        onPress={() => userQuery.refetch()}
      >
        <Text className="text-white font-bold">Reload</Text>
      </TouchableOpacity>

      {userQuery.isLoading ? (
        <ActivityIndicator />
      ) : (
        <Text>{userQuery.data?.greeting}</Text>
      )}

      {userQuery.error && (
        <Text className="text-red-600">{userQuery.error.message}</Text>
      )}
    </View>
  );
}
