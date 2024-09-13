import { ExpensesPage } from "@/src/components/ExpensesPage";
import { MessagesPage } from "@/src/components/MessagesPage";
import { SPRING } from "@/src/utils/constants";
import { trpc } from "@/src/utils/trpc";
import { Image } from "expo-image";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TripDetailPage() {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{ id: string }>();
  const tripId = params.id;

  const { data, isLoading } = trpc.trips.getById.useQuery(tripId);

  const [currentTab, setCurrentTab] = useState(0);

  if (isLoading || !data) {
    return null;
  }

  const tabs = [
    {
      title: "Chat",
      content: <MessagesPage />,
    },
    {
      title: "Expenses",
      content: <ExpensesPage trip={data} />,
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
      <StatusBar barStyle="light-content" />
      <Stack.Screen
        options={{
          title: data?.name ?? "",
          headerTintColor: "#FFF",
          headerBackTitle: "Home",
          headerShadowVisible: true,
          headerBackground: () => (
            <View style={{ width: "100%", height: "100%" }}>
              <View
                style={{
                  backgroundColor: "#000",
                  opacity: 0.4,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1,
                }}
              />

              <Image
                source={{ uri: data?.imageUrl ?? "" }}
                style={StyleSheet.absoluteFill}
                cachePolicy="none"
              />
            </View>
          ),

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
                  name="gear"
                  size={24}
                  tintColor="white"
                  resizeMode="scaleAspectFit"
                />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
      <View
        style={{
          height: windowHeight - insets.top - 2 * insets.bottom,
        }}
      >
        <TabButtons tabs={tabs} setSelectedTab={setCurrentTab} />
        <Animated.View
          key={currentTab}
          entering={FadeIn}
          exiting={FadeOut}
          style={{
            paddingHorizontal: 18,
            flex: 1,
          }}
        >
          {tabs[currentTab].content}
        </Animated.View>
      </View>
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
        height: 48,
        alignItems: "center",
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
            paddingHorizontal: 20,
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
