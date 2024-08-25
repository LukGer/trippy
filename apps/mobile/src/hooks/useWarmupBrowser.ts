import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);
};
