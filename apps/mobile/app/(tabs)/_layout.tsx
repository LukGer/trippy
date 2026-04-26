import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { Colors } from "@/constants/colors";

export default function TabsLayout() {
	return (
		<NativeTabs tintColor={Colors.accent.orange}>
			<NativeTabs.Trigger
				name="discover"
			>
				<Label>Discover</Label>
				<Icon sf="safari" />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger
				name="plans"
			>
				<Label>Plans</Label>
				<Icon sf="map" />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger
				name="documents"
			>
				<Label>Documents</Label>
				<Icon sf="text.document" />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger
				name="you"
			>
				<Label>You</Label>
				<Icon sf="person" />
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}
