import Constants from "expo-constants";

const defaultApiUrl = "http://localhost:8787";

export function getApiUrl() {
  return Constants.expoConfig?.extra?.apiUrl ?? defaultApiUrl;
}
