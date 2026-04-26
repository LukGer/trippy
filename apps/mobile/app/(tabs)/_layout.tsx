import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabsLayout() {
	return (
		<NativeTabs tintColor="#0a7ea4">
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
