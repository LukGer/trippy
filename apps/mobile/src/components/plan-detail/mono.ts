import { Platform } from "react-native";

/** Single PostScript name per platform — RN can't fall back inside a stacked fontFamily. */
export const MONO_FONT = Platform.select({
	ios: "Menlo",
	android: "monospace",
	default: "monospace",
});
