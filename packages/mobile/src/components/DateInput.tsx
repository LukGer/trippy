import { fromDateId, toDateId } from "@marceloterreiro/flash-calendar";
import dayjs from "dayjs";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { SPRING } from "../utils/constants";
import { TrippyCalendar } from "./TrippyCalendar";

export function DateInput({
  label,
  date,
  setDate,
}: {
  label: string;
  date: string;
  setDate: (date: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(date);

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
        <TrippyCalendar
          onNextMonthPress={() => {
            setCurrentMonth(
              toDateId(dayjs(fromDateId(currentMonth)).add(1, "month").toDate())
            );
          }}
          onPreviousMonthPress={() => {
            setCurrentMonth(
              toDateId(
                dayjs(fromDateId(currentMonth)).subtract(1, "month").toDate()
              )
            );
          }}
          onResetMonthPress={() => setCurrentMonth(toDateId(new Date()))}
          calendarFirstDayOfWeek="monday"
          key={label}
          calendarActiveDateRanges={[
            {
              startId: date,
              endId: date,
            },
          ]}
          calendarMonthId={currentMonth}
          onCalendarDayPress={setDate}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
});
