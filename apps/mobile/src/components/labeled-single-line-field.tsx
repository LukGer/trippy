import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from "react-native";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

export type LabeledSingleLineFieldProps = {
	label: string;
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	/** Wraps label + input (default bottom margin for stacked fields) */
	containerStyle?: StyleProp<ViewStyle>;
	inputStyle?: StyleProp<TextStyle>;
} & Omit<
	TextInputProps,
	"multiline" | "onChangeText" | "style" | "value"
>;

/**
 * Uppercase label + rounded card single-line field (plan-create / forms).
 */
export function LabeledSingleLineField({
	label,
	value,
	onChangeText,
	placeholder,
	containerStyle,
	inputStyle,
	...textInputProps
}: LabeledSingleLineFieldProps) {
	return (
		<View style={[styles.container, containerStyle]}>
			<Text style={styles.label}>{label}</Text>
			<TextInput
				{...textInputProps}
				multiline={false}
				placeholder={placeholder}
				placeholderTextColor={Colors.ink.tertiary}
				style={[styles.input, inputStyle]}
				value={value}
				onChangeText={onChangeText}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 24,
	},
	label: {
		color: Colors.ink.tertiary,
		fontFamily: Fonts.serif.semibold,
		fontSize: 11,
		letterSpacing: 1.2,
		marginBottom: 8,
		textTransform: "uppercase",
	},
	input: {
		backgroundColor: Colors.surface.card,
		borderRadius: 14,
		color: Colors.ink.primary,
		fontFamily: Fonts.serif.regular,
		fontSize: 18,
		paddingHorizontal: 16,
		paddingVertical: 14,
		...Platform.select({
			android: { includeFontPadding: false },
			default: {},
		}),
	},
});

/** Same typography as {@link LabeledSingleLineField}’s label — for custom sections (textarea, etc.) */
export const labeledSingleLineFieldLabelStyle = styles.label;
