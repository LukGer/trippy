import { SPRING } from "@/utils/constants";
import { trpc } from "@/utils/trpc";
import { Calendar, toDateId } from "@marceloterreiro/flash-calendar";
import { DbUser } from "@trippy/api";
import { RouterOutputs } from "@trippy/api/src/router";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

type Trip = RouterOutputs["trips"]["getById"]["trip"];

export default function TripSettingsPage() {
  const params = useLocalSearchParams<{ id: string }>();
  const tripId = params.id;

  const { data, isLoading } = trpc.trips.getById.useQuery(tripId);

  if (isLoading) return null;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerTintColor: "black",
          headerBackTitle: "Back",
        }}
      />
      {!data?.trip ? <ActivityIndicator /> : <Settings trip={data.trip} />}
    </>
  );
}

function Settings({ trip }: { trip: Trip }) {
  const [imageUrl, setImageUrl] = useState(trip.imageUrl ?? "");
  const [name, setName] = useState(trip.name);
  const [startDate, setStartDate] = useState(toDateId(trip.startDate));
  const [endDate, setEndDate] = useState(toDateId(trip.endDate));
  const [members, setMembers] = useState(trip.tripsToUsers.map((t) => t.user));

  return (
    <View className="flex flex-col px-4 pt-4 gap-6 items-center">
      <TripImage imageUrl={imageUrl} setImageUrl={setImageUrl} />

      <View style={styles.container}>
        <View style={styles.item}>
          <Text style={styles.itemTitle}>Name</Text>

          <TextInput
            style={{ flex: 1, textAlign: "right" }}
            value={name ?? ""}
            onChangeText={setName}
          />
        </View>
        <View style={styles.seperator} />
        <DateInput label="Start date" date={startDate} setDate={setStartDate} />
        <View style={styles.seperator} />
        <DateInput label="End date" date={endDate} setDate={setEndDate} />
        <View style={styles.seperator} />
        <MembersInput members={members} setMembers={setMembers} />
      </View>
    </View>
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

function MembersInput({
  members,
  setMembers,
}: {
  members: DbUser[];
  setMembers: (members: DbUser[]) => void;
}) {
  const [toEdit, setToEdit] = useState(members);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = toEdit.filter((user) => {
    return (
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
    );
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

            <TouchableOpacity
              onPress={() => {
                setMembers(toEdit);
                setIsOpen(false);
              }}
            >
              <Text style={{ color: "#007AFF", fontWeight: "bold" }}>Save</Text>
            </TouchableOpacity>
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
            Current members
          </Text>
          {filtered.map((user) => (
            <UserListItem
              key={user.id}
              user={user}
              mode="remove"
              action={() => {
                setToEdit((prev) => prev.filter((u) => u.id !== user.id));
              }}
            />
          ))}

          <Text
            style={{
              fontWeight: "bold",
              color: "rgba(60, 60, 67, 0.6)",
            }}
          >
            Add members
          </Text>
        </View>
      </Modal>
      <TouchableOpacity style={styles.item} onPress={() => setIsOpen(true)}>
        <Text style={styles.itemTitle}>Members</Text>

        <View className="flex-1"></View>

        <Text>{members.length}</Text>

        <SymbolView
          name="chevron.right"
          size={16}
          resizeMode="scaleAspectFit"
        />
      </TouchableOpacity>
    </>
  );
}

function UserListItem({
  user,
  mode,
  action,
}: {
  user: DbUser;
  mode: "add" | "remove";
  action: () => void;
}) {
  return (
    <Animated.View
      exiting={FadeOutUp}
      entering={FadeInUp}
      style={styles.userItem}
    >
      <Image source={{ uri: user.pictureUrl ?? "" }} style={styles.userImg} />
      <Text>{user.name}</Text>

      <View className="flex-1"></View>

      <TouchableOpacity onPress={() => action()}>
        <SymbolView
          name={mode === "add" ? "plus.circle.fill" : "x.circle.fill"}
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
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
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
