import type { ReactNode } from "react";
import type { TextInputProps } from "react-native";
import { Platform, Text, TextInput, View } from "react-native";

export type LabeledSingleLineFieldProps = {
	label: string;
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	/** Custom node rendered as the placeholder while `value` is empty. Suppresses the native `placeholder` string. */
	placeholderNode?: ReactNode;
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
		<Text className="type-caption-2 mb-2 px-4 font-serif-semibold text-ink-tertiary uppercase tracking-[1.2px]">
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
	placeholderNode,
	...textInputProps
}: LabeledSingleLineFieldProps) {
	const showPlaceholderNode = placeholderNode != null && value.length === 0;
	return (
		<View>
			<LabeledFieldLabel>{label}</LabeledFieldLabel>
			<View>
				<TextInput
					{...textInputProps}
					multiline={false}
					className="type-body h-12 rounded-2xl bg-surface-card px-4 font-serif text-ink-primary"
					placeholder={placeholderNode != null ? undefined : placeholder}
					placeholderTextColorClassName="accent-ink-tertiary"
					style={
						Platform.OS === "android"
							? { includeFontPadding: false }
							: undefined
					}
					value={value}
					onChangeText={onChangeText}
				/>
				{showPlaceholderNode ? (
					<View
						pointerEvents="none"
						className="absolute inset-0 justify-center overflow-hidden px-4"
					>
						{placeholderNode}
					</View>
				) : null}
			</View>
		</View>
	);
}
