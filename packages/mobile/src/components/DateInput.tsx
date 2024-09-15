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

interface DateInputProps {
	label: string;
	date: string;
	minDate?: string;
	setDate: (date: string) => void;
}

export function DateInput(props: DateInputProps) {
	const { date, minDate } = props;

	const validDate = minDate
		? fromDateId(minDate) >= fromDateId(date)
			? minDate
			: date
		: date;

	if (fromDateId(validDate) === fromDateId(date)) {
		props.setDate(validDate);
	}

	const [isOpen, setIsOpen] = useState(false);
	const [currentMonth, setCurrentMonth] = useState(validDate);

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
				<Text style={styles.itemTitle}>{props.label}</Text>

				<View className="flex-1" />

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
						{dayjs(validDate).format("MMM D, YYYY")}
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
							toDateId(
								dayjs(fromDateId(currentMonth)).add(1, "month").toDate(),
							),
						);
					}}
					onPreviousMonthPress={() => {
						setCurrentMonth(
							toDateId(
								dayjs(fromDateId(currentMonth)).subtract(1, "month").toDate(),
							),
						);
					}}
					onResetMonthPress={() => setCurrentMonth(toDateId(new Date()))}
					calendarFirstDayOfWeek="monday"
					key={props.label}
					calendarActiveDateRanges={[
						{
							startId: validDate,
							endId: validDate,
						},
					]}
					calendarMonthId={currentMonth}
					onCalendarDayPress={props.setDate}
					calendarMinDateId={props.minDate}
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
