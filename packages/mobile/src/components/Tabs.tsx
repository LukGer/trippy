import {
  createContext,
  ReactElement,
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SPRING } from "../utils/constants";

const TabContext = createContext<{
  tabs: { title: string }[];
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}>({
  tabs: [],
  selectedTab: "",
  setSelectedTab: () => {},
});

export default function Tab({
  children,
  tabs,
}: {
  children: ReactElement[];
  tabs: { title: string }[];
}) {
  const tabContext = useContext(TabContext);

  useEffect(() => {
    tabContext.tabs = tabs;
  }, [tabs]);

  return <View>{children.map((c) => c)}</View>;
}

Tab.TabButtons = function TabButtons() {
  const tabContext = useContext(TabContext);

  const scrollRef = useRef<ScrollView>(null);

  const { width: windowWidth } = useWindowDimensions();

  const left = useSharedValue(0);
  const width = useSharedValue(0);

  const sliderStyle = useAnimatedStyle(() => ({
    left: withSpring(left.value, SPRING.smooth),
    width: withSpring(width.value, SPRING.smooth),
  }));

  const measure = (
    x: number,
    _y: number,
    w: number,
    _height: number,
    pageX: number,
    _pageY: number
  ) => {
    left.value = x;
    width.value = w;

    if (pageX < 0) {
      scrollRef.current?.scrollTo({
        x: x + pageX,
        animated: true,
      });
    } else if (pageX + w > windowWidth) {
      scrollRef.current?.scrollTo({
        x: x + pageX + w - windowWidth,
        animated: true,
      });
    }
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 18,
      }}
      style={{
        flexGrow: 0,
      }}
    >
      {tabContext.tabs.map((tab, index) => (
        <Pressable
          onLayout={(e) => {
            if (index === 0) {
              left.value = e.nativeEvent.layout.x;
              width.value = e.nativeEvent.layout.width;
            }
          }}
          key={tab.title + index}
          style={{
            padding: 20,
          }}
          onPress={(e) => {
            e.currentTarget.measure(measure);

            tabContext.setSelectedTab(tab.title);
          }}
        >
          <Text className="font-bold text-xl">{tab.title}</Text>
        </Pressable>
      ))}
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 0,
            height: 4,
            backgroundColor: "black",
            borderRadius: 2,
          },
          sliderStyle,
        ]}
      ></Animated.View>
    </ScrollView>
  );
};

Tab.Tabs = function Tabs({ children }: { children: ReactElement[] }) {
  const tabContext = useContext(TabContext);
  const { width: windowWidth } = useWindowDimensions();

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const idx = tabContext.tabs.findIndex(
      (tab) => tab.title === tabContext.selectedTab
    );

    if (idx === -1) return;

    const x = idx * windowWidth;

    scrollRef.current?.scrollTo({
      x,
      animated: true,
    });
  }, [tabContext.selectedTab]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEnabled={false}
    >
      {children.map((child) => child)}
    </ScrollView>
  );
};

Tab.TabContent = function TabContent({ children }: { children: ReactElement }) {
  const { width: windowWidth } = useWindowDimensions();

  return <View style={{ width: windowWidth }}>{children}</View>;
};
