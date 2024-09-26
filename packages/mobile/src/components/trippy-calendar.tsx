import {
	Calendar,
	type CalendarProps,
	type CalendarTheme,
	useCalendar,
} from "@marceloterreiro/flash-calendar";
import { SymbolView } from "expo-symbols";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const DAY_HEIGHT = 25;
const MONTH_HEADER_HEIGHT = 40;
const WEEK_DAYS_HEIGHT = 25;

const calendarTheme: CalendarTheme = {
	rowMonth: {
		container: {
			height: MONTH_HEADER_HEIGHT,
		},
		content: {
			color: "#000",
			fontSize: 17,
			width: 200,
			textAlign: "center",
		},
	},
	itemWeekName: {
		content: { color: "#000", fontSize: 12 },
		container: { marginBottom: 12 },
	},
	rowWeek: {
		container: {
			marginVertical: 2,
		},
	},
	itemDay: {
		base: () => ({
			container: {
				padding: 0,
				borderRadius: 12,
			},
		}),
		today: () => ({
			container: {
				backgroundColor: "#DDD",
			},
		}),
		idle: ({ isDifferentMonth }) => ({
			content: isDifferentMonth
				? {
						color: "#BBB",
					}
				: undefined,
		}),
		active: () => ({
			container: {
				backgroundColor: "#000",
			},
			content: {
				color: "#FFF",
			},
		}),
	},
};

interface TrippyCalendarProps extends CalendarProps {
	onPreviousMonthPress: () => void;
	onNextMonthPress: () => void;
	onResetMonthPress: () => void;
}

export const TrippyCalendar = memo((props: TrippyCalendarProps) => {
	const { calendarRowMonth, weekDaysList, weeksList } = useCalendar(props);

	return (
		<View style={styles.calendarContainer}>
			<Calendar.VStack spacing={props.calendarRowVerticalSpacing}>
				{/* Replaces `Calendar.Row.Month` with a custom implementation */}
				<Calendar.HStack
					alignItems="center"
					justifyContent="space-around"
					style={calendarTheme.rowMonth?.container}
					width="100%"
				>
					<TouchableOpacity onPress={props.onPreviousMonthPress}>
						<SymbolView
							name="chevron.left"
							size={20}
							tintColor="#000"
							resizeMode="scaleAspectFit"
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={props.onResetMonthPress}>
						<Text style={calendarTheme.rowMonth?.content}>
							{calendarRowMonth}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={props.onNextMonthPress}>
						<SymbolView
							name="chevron.right"
							size={20}
							tintColor="#000"
							resizeMode="scaleAspectFit"
						/>
					</TouchableOpacity>
				</Calendar.HStack>

				<Calendar.Row.Week spacing={4}>
					{weekDaysList.map((day, i) => (
						<Calendar.Item.WeekName
							height={WEEK_DAYS_HEIGHT}
							key={i}
							theme={calendarTheme.itemWeekName}
						>
							{day}
						</Calendar.Item.WeekName>
					))}
				</Calendar.Row.Week>

				{weeksList.map((week, i) => (
					<Calendar.Row.Week key={i} theme={calendarTheme.rowWeek}>
						{week.map((day) => (
							<Calendar.Item.Day.Container
								dayHeight={DAY_HEIGHT}
								daySpacing={4}
								isStartOfWeek={day.isStartOfWeek}
								key={day.id}
							>
								<Calendar.Item.Day
									height={DAY_HEIGHT}
									metadata={day}
									onPress={props.onCalendarDayPress}
									theme={calendarTheme.itemDay}
								>
									{day.displayLabel}
								</Calendar.Item.Day>
							</Calendar.Item.Day.Container>
						))}
					</Calendar.Row.Week>
				))}
			</Calendar.VStack>
		</View>
	);
});

const styles = StyleSheet.create({
	calendarContainer: {
		backgroundColor: "white",
		borderRadius: 8,
		padding: 8,
	},
});
