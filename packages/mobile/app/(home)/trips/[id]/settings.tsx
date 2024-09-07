import { UserContext } from "@/src/context/UserContext";
import { SPRING } from "@/src/utils/constants";
import { trpc } from "@/src/utils/trpc";
import {
  Calendar,
  fromDateId,
  toDateId,
} from "@marceloterreiro/flash-calendar";
import { useQueryClient } from "@tanstack/react-query";
import { RouterOutputs } from "@trippy/api";
import { getQueryKey } from "@trpc/react-query";
import dayjs from "dayjs";
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
import Animated, {
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useDebounce } from "use-debounce";

type Trip = RouterOutputs["trips"]["getById"];
type Member = Trip["members"][number];

export default function TripSettingsPage() {
  const params = useLocalSearchParams<{ id: string }>();
  const tripId = params.id;

  const queryClient = useQueryClient();
  const user = useContext(UserContext);

  const { data, isLoading } = trpc.trips.getById.useQuery(tripId);

  const updateTrip = trpc.trips.update.useMutation({
    onError: (error) => {
      console.error(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(trpc.trips.getById, tripId, "query"),
      });

      router.back();
    },
  });

  const removeMemberMutation = trpc.trips.removeMember.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(trpc.trips.getById, tripId, "query"),
      });
    },
  });

  const [imageUrl, setImageUrl] = useState(data?.imageUrl ?? "");
  const [name, setName] = useState(data?.name);
  const [startDate, setStartDate] = useState(
    toDateId(data?.startDate ?? new Date())
  );
  const [endDate, setEndDate] = useState(toDateId(data?.endDate ?? new Date()));

  if (isLoading) return null;

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
                  name: name!,
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
          <TripImage imageUrl={imageUrl} setImageUrl={setImageUrl} />

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
            <DateInput label="End date" date={endDate} setDate={setEndDate} />
          </View>

          <Text className="self-start font-bold text-gray-500">Members</Text>

          <View style={styles.container}>
            <AddMemberButton tripId={tripId} />

            <View style={styles.seperator} />

            {data.members.map((member, i) => (
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
                                  // TODO: add leave mutation

                                  router.replace("/(home)/");
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
          </View>
        </ScrollView>
      )}
    </>
  );
}

function TripImage({
  imageUrl,
  setImageUrl,
}: {
  imageUrl: string;
  setImageUrl: (url: string) => void;
}) {
  return (
    <View
      style={{
        width: 275,
        aspectRatio: 2,
        borderRadius: 16,
        borderCurve: "continuous",
        overflow: "hidden",
      }}
    >
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: "100%",
          height: "100%",
        }}
      />

      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        }}
      />

      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <SymbolView
          name="camera"
          size={24}
          tintColor="white"
          resizeMode="scaleAspectFill"
        />
      </View>
    </View>
  );
}

function DateInput({
  label,
  date,
  setDate,
}: {
  label: string;
  date: string;
  setDate: (date: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const itemStyle = useAnimatedStyle(() => ({
    height: withSpring(isOpen ? 340 : 44, SPRING.smooth),
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: withSpring(isOpen ? "-180deg" : "0deg", SPRING.smooth),
      },
    ],
  }));

  return (
    <Animated.View
      style={[{ flexDirection: "column", overflow: "hidden" }, itemStyle]}
    >
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.item}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.itemTitle}>{label}</Text>

        <View className="flex-1"></View>

        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            backgroundColor: "rgba(120, 120, 128, 0.12)",
            borderRadius: 6,
          }}
        >
          <Text
            style={{
              color: "#007AFF",
              fontWeight: "semibold",
            }}
          >
            {dayjs(date).format("MMM D, YYYY")}
          </Text>
        </View>

        <Animated.View style={iconStyle}>
          <SymbolView name="chevron.up" size={16} resizeMode="scaleAspectFit" />
        </Animated.View>
      </TouchableOpacity>
      <View className="px-4">
        <Calendar
          key={label}
          calendarActiveDateRanges={[
            {
              startId: date,
              endId: date,
            },
          ]}
          calendarMonthId={date}
          onCalendarDayPress={setDate}
        />
      </View>
    </Animated.View>
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
                user={user}
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
      <Text>{user.name}</Text>

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
