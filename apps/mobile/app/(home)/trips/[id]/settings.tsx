import { trpc } from "@/utils/trpc";
import { Calendar, toDateId } from "@marceloterreiro/flash-calendar";
import { DbTrip } from "@trippy/api";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

export default function TripSettingsPage() {
  const params = useLocalSearchParams<{ id: string }>();
  const tripId = params.id;

  const { data, isLoading } = trpc.trips.getById.useQuery(tripId);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerTintColor: "black",
          headerBackTitle: "Back",
        }}
      />
      {isLoading || !data?.trip ? (
        <ActivityIndicator />
      ) : (
        <Settings trip={data.trip} />
      )}
    </>
  );
}

function Settings({ trip }: { trip: DbTrip }) {
  const [name, setName] = useState(trip.name);
  const [startDate, setStartDate] = useState(toDateId(trip.startDate));
  const [endDate, setEndDate] = useState(toDateId(trip.endDate));

  return (
    <View className="flex flex-col px-4 pt-4 gap-6 items-center">
      <TripImage trip={trip} />

      <View style={styles.container}>
        <View style={styles.item}>
          <Text>Name</Text>

          <View className="flex-1"></View>

          <TextInput value={name ?? ""} onChangeText={setName} />
        </View>
        <View style={styles.seperator} />
        <DateInput label="Start date" date={startDate} setDate={setStartDate} />
        <View style={styles.seperator} />
        <DateInput label="End date" date={endDate} setDate={setEndDate} />
      </View>
    </View>
  );
}

function TripImage({ trip }: { trip: DbTrip }) {
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
        source={{ uri: trip.imageUrl ?? "" }}
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
    height: withSpring(isOpen ? 340 : 44, {
      duration: 1000,
      dampingRatio: 1,
    }),
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: withSpring(isOpen ? "-180deg" : "0deg", {
          duration: 1000,
          dampingRatio: 1,
        }),
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
        <Text>{label}</Text>

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
});
