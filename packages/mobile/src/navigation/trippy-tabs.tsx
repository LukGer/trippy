import {
	createMaterialTopTabNavigator,
	type MaterialTopTabNavigationEventMap,
	type MaterialTopTabNavigationOptions,
	type MaterialTopTabNavigationProp,
} from "@react-navigation/material-top-tabs";
import type {
	Descriptor,
	NavigationHelpers,
	ParamListBase,
	RouteProp,
	TabNavigationState,
} from "@react-navigation/native";
import { withLayoutContext } from "expo-router";
import type { SceneRendererProps } from "react-native-tab-view";

const { Navigator } = createMaterialTopTabNavigator();

export type TrippyTabsNavigationOptions = MaterialTopTabNavigationOptions & {
	enabled?: boolean;
};

export const TrippyTabs = withLayoutContext<
	TrippyTabsNavigationOptions,
	typeof Navigator,
	TabNavigationState<ParamListBase>,
	MaterialTopTabNavigationEventMap
>(Navigator);

export type TrippyTabDescriptor = Descriptor<
	TrippyTabsNavigationOptions,
	MaterialTopTabNavigationProp<ParamListBase>,
	RouteProp<ParamListBase>
>;

type TrippyTabDescriptorMap = Record<string, TrippyTabDescriptor>;

export type TrippyTabBarProps = SceneRendererProps & {
	state: TabNavigationState<ParamListBase>;
	navigation: NavigationHelpers<
		ParamListBase,
		MaterialTopTabNavigationEventMap
	>;
	descriptors: TrippyTabDescriptorMap;
};
