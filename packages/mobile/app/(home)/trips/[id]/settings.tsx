import { DateInput } from "@/src/components/DateInput";
import { TripImageSelector } from "@/src/components/TripImageSelector";
import { UserContext } from "@/src/context/UserContext";
import { trpc } from "@/src/utils/trpc";
import { fromDateId, toDateId } from "@marceloterreiro/flash-calendar";
import { useQueryClient } from "@tanstack/react-query";
import { RouterOutputs } from "@trippy/api";
import { getQueryKey } from "@trpc/react-query";
import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Fragment, useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeOut, LinearTransition } from "react-native-reanimated";
import { useDebounce } from "use-debounce";

type Trip = RouterOutputs["trips"]["getById"];
type Member = Trip["members"][number];

export default function TripSettingsPage() {
  const params = useLocalSearchParams<{ id: string }>();
  const tripId = params.id;

  const utils = trpc.useUtils();

  const user = useContext(UserContext);

  const { data, isLoading } = trpc.trips.getById.useQuery(tripId);

  const updateTrip = trpc.trips.update.useMutation({
    onError: (error) => {
      console.error(error);
    },
    onSuccess: () => {
      utils.trips.invalidate();
    },
  });

  const removeMemberMutation = trpc.trips.removeMember.useMutation({
    onMutate: (variables) => {
      utils.trips.getById.setData(variables.tripId, (oldData) => ({
        ...oldData!,
        members: oldData!.members.filter((m) => m.id !== variables.userId),
      }));
    },
    onSuccess: () => {
      utils.trips.invalidate();
    },
  });

  const leaveTripMutation = trpc.trips.leaveTrip.useMutation({
    onSuccess: () => {
      utils.trips.invalidate();

      router.navigate("/(home)");
    },
  });

  const [name, setName] = useState(data?.name);
  const [startDate, setStartDate] = useState(
    toDateId(data?.startDate ?? new Date())
  );
  const [endDate, setEndDate] = useState(toDateId(data?.endDate ?? new Date()));

  if (isLoading) return null;

  const sortedMembers =
    data?.members.sort((a, b) => {
      if (a.id === user.id) return -1;
      if (b.id === user.id) return 1;
      return a.name.localeCompare(b.name);
    }) ?? [];

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerTintColor: "black",
          headerBackTitle: "Back",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                updateTrip.mutate({
                  id: tripId,
                  name: name ?? "",
                  startDate: fromDateId(startDate),
                  endDate: fromDateId(endDate),
                });
              }}
            >
              <Text style={{ color: "#007AFF", fontWeight: "bold" }}>Save</Text>
            </TouchableOpacity>
          ),
        }}
      />
      {!data ? (
        <ActivityIndicator />
      ) : (
        <ScrollView
          style={{
            paddingHorizontal: 16,
            paddingTop: 16,
          }}
          contentContainerStyle={{
            gap: 24,
            alignItems: "center",
          }}
        >
          <TripImageSelector trip={data} />

          <View style={styles.container}>
            <View style={styles.item}>
              <Text style={styles.itemTitle}>Name</Text>

              <TextInput
                style={{ flex: 1, textAlign: "right" }}
                value={name ?? ""}
                onChangeText={setName}
                blurOnSubmit
              />
            </View>
            <View style={styles.seperator} />
            <DateInput
              label="Start date"
              date={startDate}
              setDate={setStartDate}
            />
            <View style={styles.seperator} />
            <DateInput
              label="End date"
              date={endDate}
              setDate={setEndDate}
              minDate={startDate}
            />
          </View>

          <Text className="self-start font-bold text-gray-500">Members</Text>

          <View style={{ width: "100%" }}>
            <Animated.View
              layout={LinearTransition.duration(300)}
              style={styles.container}
            >
              <AddMemberButton tripId={tripId} />

              <View style={styles.seperator} />

              {sortedMembers.map((member, i) => (
                <Fragment key={member.id}>
                  <UserListItem
                    user={member}
                    mode={member.id === user.id ? "leave" : "remove"}
                    action={
                      member.id === user.id
                        ? () => {
                            Alert.alert(
                              "Leave trip",
                              "Are you sure you want to leave?",
                              [
                                {
                                  text: "Cancel",
                                  style: "cancel",
                                },
                                {
                                  text: "Leave",
                                  style: "destructive",
                                  onPress: () => {
                                    leaveTripMutation.mutate({
                                      tripId,
                                      userId: user.id,
                                    });
                                  },
                                },
                              ]
                            );
                          }
                        : () => {
                            Alert.alert(
                              "Remove member",
                              `Remove ${member.name}?`,
                              [
                                {
                                  text: "Cancel",
                                  style: "cancel",
                                },
                                {
                                  text: "Remove",
                                  style: "destructive",
                                  onPress: () => {
                                    removeMemberMutation.mutate({
                                      tripId,
                                      userId: member.id,
                                    });
                                  },
                                },
                              ]
                            );
                          }
                    }
                  />
                  {i !== data.members.length - 1 && (
                    <View style={styles.seperator} />
                  )}
                </Fragment>
              ))}
            </Animated.View>
          </View>
        </ScrollView>
      )}
    </>
  );
}

function AddMemberButton({ tripId }: { tripId: string }) {
  const queryClient = useQueryClient();

  const addMemberMutation = trpc.trips.addMember.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(trpc.trips.getById, tripId, "query"),
      });
    },
  });

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [debouncedSearch] = useDebounce(search, 300);

  const { isLoading, data } = trpc.users.getBySearchString.useQuery({
    search: debouncedSearch,
    tripId,
  });

  return (
    <>
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={isOpen}
        onRequestClose={() => {
          setIsOpen(!isOpen);
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: "rgba(84, 84, 86, 0.33)",
            flexDirection: "column",
            gap: 16,
            padding: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setIsOpen(false);
              }}
            >
              <SymbolView
                name="chevron.left"
                size={20}
                resizeMode="scaleAspectFit"
              />
            </TouchableOpacity>

            <View className="flex-1"></View>

            <Text style={{ fontWeight: "bold" }}>Members</Text>

            <View className="flex-1"></View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextInput
              style={{
                backgroundColor: "rgba(120, 120, 128, 0.12)",
                width: "100%",
                padding: 8,
                borderRadius: 8,
              }}
              autoComplete="off"
              autoCorrect={false}
              autoCapitalize="none"
              enterKeyHint="search"
              onChangeText={(t) => setSearch(t)}
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        <View className="p-4 bg-gray-100 gap-4 flex-1">
          <Text
            style={{
              fontWeight: "bold",
              color: "rgba(60, 60, 67, 0.6)",
            }}
          >
            Add members
          </Text>

          {isLoading ? (
            <ActivityIndicator />
          ) : (
            data?.map((user) => (
              <UserListItem
                key={user.id}
                user={{ ...user, isAdmin: false }}
                mode="add"
                action={() => {
                  addMemberMutation.mutate({
                    tripId,
                    userId: user.id,
                  });
                }}
              />
            ))
          )}
        </View>
      </Modal>
      <TouchableOpacity style={styles.item} onPress={() => setIsOpen(true)}>
        <View
          style={[
            styles.userImg,
            {
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <SymbolView
            name="person.badge.plus"
            size={24}
            tintColor="#6b7280"
            resizeMode="scaleAspectFit"
          />
        </View>

        <Text className="font-bold text-gray-500">Add new member</Text>
      </TouchableOpacity>
    </>
  );
}

function UserListItem({
  user,
  mode,
  action,
}: {
  user: Member;
  mode: "add" | "remove" | "leave";
  action: () => void;
}) {
  return (
    <Animated.View
      layout={LinearTransition.duration(300)}
      exiting={FadeOut.duration(300)}
      style={styles.userItem}
    >
      <Image source={{ uri: user.pictureUrl ?? "" }} style={styles.userImg} />

      <View className="flex flex-row items-center">
        {user.isAdmin && (
          <SymbolView
            name="shield.lefthalf.fill"
            resizeMode="scaleAspectFit"
            size={20}
            tintColor="#007AFF"
          />
        )}

        <Text>{user.name}</Text>
      </View>
      <View className="flex-1"></View>

      <TouchableOpacity onPress={() => action()}>
        <SymbolView
          name={
            mode === "add"
              ? "plus.circle.fill"
              : mode === "remove"
                ? "xmark.circle.fill"
                : "door.right.hand.open"
          }
          resizeMode="scaleAspectFit"
          size={20}
        />
      </TouchableOpacity>
    </Animated.View>
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
