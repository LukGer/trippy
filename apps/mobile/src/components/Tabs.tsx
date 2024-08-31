import { SPRING } from "@/utils/constants";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export type TabProps = {
  tabs: {
    title: string;
    content: React.ReactNode;
  }[];
};

export function TrippyTabs(props: TabProps) {
  const { tabs } = props;

  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <View style={{ gap: 20 }}>
      <TabButtons
        tabs={tabs}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
      <View
        style={{
          paddingHorizontal: 18,
        }}
      >
        {tabs[selectedTab].content}
      </View>
    </View>
  );
}

function TabButtons({
  tabs,
  selectedTab,
  setSelectedTab,
}: {
  tabs: { title: string }[];
  selectedTab: number;
  setSelectedTab: (index: number) => void;
}) {
  const left = useSharedValue(0);
  const width = useSharedValue(0);

  const sliderStyle = useAnimatedStyle(() => ({
    left: withSpring(left.value, SPRING.smooth),
    width: withSpring(width.value, SPRING.smooth),
  }));

  const measure = useCallback(
    (x: number, _: number, w: number) => {
      left.value = x;
      width.value = w;
    },
    [selectedTab]
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 18,
      }}
    >
      {tabs.map((tab, index) => (
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

            setSelectedTab(index);
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
}
