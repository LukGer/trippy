import type { ReactNode } from "react";
import type { TextInputProps } from "react-native";
import { Platform, Text, TextInput, View } from "react-native";

export type LabeledSingleLineFieldProps = {
	label: string;
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	/** Extra container classes (e.g. mb override) */
	className?: string;
	/** Extra input classes */
	inputClassName?: string;
} & Omit<
	TextInputProps,
	"multiline" | "onChangeText" | "style" | "value" | "className"
>;

/** Uppercase small label — matches {@link LabeledSingleLineField} label typography (e.g. section headers above textarea). */
export function LabeledFieldLabel({ children }: { children: ReactNode }) {
	return (
		<Text className="type-caption-2 mb-2 font-serif-semibold text-ink-tertiary uppercase tracking-[1.2px]">
			{children}
		</Text>
	);
}

/**
 * Uppercase label + rounded card single-line field (plan-create / forms).
 */
export function LabeledSingleLineField({
	label,
	value,
	onChangeText,
	placeholder,
	...textInputProps
}: LabeledSingleLineFieldProps) {
	return (
		<View className="mb-6">
			<LabeledFieldLabel>{label}</LabeledFieldLabel>
			<TextInput
				{...textInputProps}
				multiline={false}
				className="type-body rounded-[14px] bg-surface-card px-4 py-3.5 font-serif text-ink-primary"
				placeholder={placeholder}
				placeholderTextColorClassName="accent-ink-tertiary"
				style={
					Platform.OS === "android" ? { includeFontPadding: false } : undefined
				}
				value={value}
				onChangeText={onChangeText}
			/>
		</View>
	);
}
