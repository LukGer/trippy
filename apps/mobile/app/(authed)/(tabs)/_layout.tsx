import { useSegments } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Colors } from "@/constants/colors";

const ROOT_TABS = new Set(["discover", "plans", "documents", "you"]);

/**
 * Hide the tab bar whenever the active route is deeper than a root tab page.
 * Example: `/plans` stays visible, `/plans/<tripId>` hides.
 *
 * Note: dynamically flipping NativeTabs `hidden` remounts the navigator, so
 * inner-stack state resets across each transition — acceptable here since
 * detail screens load their own data and don't carry transient state.
 */
function useTabBarHidden() {
	const segments = useSegments();
	for (let i = 0; i < segments.length; i++) {
		if (!ROOT_TABS.has(segments[i] ?? "")) continue;
		return i < segments.length - 1;
	}
	return false;
}

export default function TabsLayout() {
	const hidden = useTabBarHidden();
	return (
		<NativeTabs tintColor={Colors.accent.orange} hidden={hidden}>
			<NativeTabs.Trigger name="discover">
				<NativeTabs.Trigger.Label>Discover</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf="location.north.line.fill" />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="plans">
				<NativeTabs.Trigger.Label>Plans</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf="calendar" />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="documents">
				<NativeTabs.Trigger.Label>Documents</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf="text.document" />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="you">
				<NativeTabs.Trigger.Label>You</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf="person" />
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}
