import { SPRING } from "@/src/utils/constants";
import { trpc } from "@/src/utils/trpc";
import { RouterOutputs } from "@trippy/api";
import dayjs from "dayjs";
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
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Trip = RouterOutputs["trips"]["getById"];

export default function TripDetailPage() {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{ id: string }>();
  const tripId = params.id;

  const contentHeight = windowHeight - 48 - insets.top - insets.bottom - 24;

  const { data } = trpc.trips.getById.useQuery(tripId);

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

  if (!data) {
    return null;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen
        options={{
          title: data?.name ?? "",
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
        }}
      >
        <TripRange trip={data} />
        <TabButtons tabs={tabs} setSelectedTab={setSelectedTab} />
        <View
          style={{
            paddingHorizontal: 18,
            height: contentHeight,
          }}
        >
          {tabs[selectedTab].content}
        </View>
      </ScrollView>
    </>
  );
}

function TripRange({ trip }: { trip: Trip }) {
  return (
    <View
      className="flex flex-row gap-2 h-6"
      style={{ paddingHorizontal: 18, alignItems: "center" }}
    >
      <Text style={styles.smallText}>
        {dayjs(trip.startDate).format("DD.MM.YYYY")}
      </Text>
      <Text style={styles.smallText}>-</Text>
      <Text style={styles.smallText}>
        {dayjs(trip.endDate).format("DD.MM.YYYY")}
      </Text>
    </View>
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

const styles = StyleSheet.create({
  smallText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
