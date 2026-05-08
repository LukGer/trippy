import {  NativeTabs } from "expo-router/unstable-native-tabs";
import { Colors } from "@/constants/colors";

export default function TabsLayout() {
	return (
		<NativeTabs tintColor={Colors.accent.orange}>
			<NativeTabs.Trigger
				name="discover"
			>
				<NativeTabs.Trigger.Label>Discover</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf="location.north.line.fill" />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger
				name="plans"
			>
				<NativeTabs.Trigger.Label>Plans</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf="calendar" />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger
				name="documents"
			>
				<NativeTabs.Trigger.Label>Documents</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf="text.document" />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger
				name="you"
			>
				<NativeTabs.Trigger.Label>You</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf="person" />
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}
