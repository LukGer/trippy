import { SPRING } from "@/utils/constants";
import { trpc } from "@/utils/trpc";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export default function TripDetailPage() {
  const params = useLocalSearchParams<{ id: string }>();
  const tripId = params.id;

  const { isLoading, data } = trpc.trips.getById.useQuery(tripId);

  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    {
      title: "Chat",
      content: <Text>Chat</Text>,
    },
    {
      title: "Expenses",
      content: <Text>Expenses</Text>,
    },
    {
      title: "Travel",
      content: <Text>Travel</Text>,
    },
    {
      title: "Documents",
      content: <Text>Documents</Text>,
    },
  ];

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen
        options={{
          title: data?.trip?.name ?? "",
          headerLargeTitle: true,
          headerTransparent: true,
          headerTintColor: "black",
          headerBlurEffect: "systemUltraThinMaterial",
          headerBackTitle: "Home",
          headerStyle: {
            backgroundColor: "#FFF",
          },

          headerRight: () => (
            <Link
              href={{
                pathname: "/(home)/trips/[id]/settings",
                params: { id: tripId },
              }}
              asChild
            >
              <TouchableOpacity>
                <SymbolView
                  name="ellipsis"
                  size={24}
                  tintColor="black"
                  resizeMode="scaleAspectFit"
                />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          backgroundColor: "#FFF",
          gap: 20,
          flex: 1,
        }}
      >
        {isLoading && (
          <View className="w-full h-full items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        )}
        <TabButtons tabs={tabs} setSelectedTab={setSelectedTab} />
        <View
          style={{
            paddingHorizontal: 18,
            flex: 1,
          }}
        >
          {tabs[selectedTab].content}
        </View>
      </ScrollView>
    </>
  );
}

function TabButtons({
  tabs,
  setSelectedTab,
}: {
  tabs: { title: string }[];
  setSelectedTab: (index: number) => void;
}) {
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
