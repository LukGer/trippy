import { DateInput } from "@/src/components/DateInput";
import { UserContext } from "@/src/context/UserContext";
import { trpc } from "@/src/utils/trpc";
import { fromDateId, toDateId } from "@marceloterreiro/flash-calendar";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { router, Stack } from "expo-router";
import { useContext, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function NewTripPage() {
  const user = useContext(UserContext);

  const queryClient = useQueryClient();

  const input = useRef<TextInput>(null);

  const addTripMutation = trpc.trips.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(trpc.trips),
      });

      router.navigate("/(home)/");
    },
  });

  const [name, setName] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(toDateId(new Date()));
  const [endDate, setEndDate] = useState<string>(toDateId(new Date()));

  const dismissInput = () => {
    input.current?.blur();
  };

  return (
    <>
      <Stack.Screen options={{ title: "Create new group trip" }} />
      <TouchableWithoutFeedback onPress={dismissInput}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 16,
            flex: 1,
            gap: 24,
            alignItems: "center",
          }}
        >
          <View style={styles.container}>
            <View style={styles.item}>
              <Text style={styles.itemTitle}>Name</Text>

              <TextInput
                ref={input}
                style={{ flex: 1, textAlign: "right" }}
                value={name ?? ""}
                onChangeText={setName}
                blurOnSubmit
                placeholder="Name"
              />
            </View>
            <View style={styles.seperator} />
            <DateInput
              label="Start date"
              date={startDate}
              setDate={setStartDate}
            />
            <View style={styles.seperator} />
            <DateInput label="End date" date={endDate} setDate={setEndDate} />
          </View>

          <KeyboardAvoidingView behavior="padding">
            <TouchableOpacity
              onPress={() => {
                addTripMutation.mutate({
                  name: name ?? "",
                  startDate: fromDateId(startDate),
                  endDate: fromDateId(endDate),
                  imageUrl: "",
                  memberIds: [user.id],
                });
              }}
              style={{
                backgroundColor: "#007AFF",
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 999,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Create group trip
              </Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 10,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  seperator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(84, 84, 86, 0.33)",
    marginStart: 16,
  },
  item: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 44,
    gap: 8,
  },
  itemTitle: {
    fontWeight: "500",
  },
  userItem: {
    width: "100%",
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderCurve: "continuous",
    gap: 12,
  },
  userImg: {
    width: 42,
    height: 42,
    borderRadius: 99,
  },
});
