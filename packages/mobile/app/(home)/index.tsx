import { GlobeIcon } from "@/src/components/GlobeIcon";
import { useTrippyUser } from "@/src/hooks/useTrippyUser";
import { trpc } from "@/src/utils/trpc";
import { Canvas, LinearGradient, Rect } from "@shopify/react-native-skia";
import { RouterOutputs } from "@trippy/api";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { Link, Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import { ReactElement } from "react";
import {
  ActivityIndicator,
  Alert,
  PlatformColor,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeOut, LinearTransition } from "react-native-reanimated";
import * as Menu from "zeego/context-menu";

type Trips = RouterOutputs["trips"]["getTripsByUserId"];

export default function HomePage() {
  const user = useTrippyUser();

  const { isLoading, data, refetch } = trpc.trips.getTripsByUserId.useQuery(
    user.id
  );

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen
        options={{
          title: "Trippy",
          headerTransparent: true,
          headerLargeTitle: true,
          headerBlurEffect: "prominent",
          headerShadowVisible: true,
          headerLargeTitleShadowVisible: false,
          headerStyle: {
            backgroundColor: "rgba(255,255,255,0.01)",
          },
          headerLargeStyle: {
            backgroundColor: PlatformColor("systemGroupedBackgroundColor"),
          },

          headerTintColor: "black",
          headerLeft: () => (
            <GlobeIcon
              style={{
                width: 24,
                height: 24,
                transform: [{ scale: 1.25 }],
              }}
            />
          ),
          headerRight: () => (
            <Link href="/(home)/settings" asChild>
              <TouchableOpacity>
                <Image
                  source={{ uri: user.pictureUrl ?? "" }}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 99,
                  }}
                />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
      <Animated.ScrollView
        layout={LinearTransition.duration(300)}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          gap: 20,
        }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
        }
      >
        {isLoading && (
          <View className="w-full h-full items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        )}

        {data && <TripList trips={data} />}
      </Animated.ScrollView>
    </>
  );
}

function TripList({ trips }: { trips: Trips }) {
  const sorted = trips.sort((a, b) =>
    dayjs(b.startDate).isBefore(dayjs(a.startDate)) ? 1 : -1
  );

  const upcomingTrips = sorted.filter((trip) =>
    dayjs(trip.startDate).isAfter(dayjs())
  );

  const pastTrips = sorted.filter((trip) =>
    dayjs(trip.startDate).isBefore(dayjs())
  );

  return (
    <>
      <View className="flex flex-row items-center">
        <Text className="font-bold text-xl">Upcoming trips</Text>

        <View className="flex-1"></View>

        <Link href="/(home)/trips/new" asChild>
          <TouchableOpacity>
            <SymbolView
              name="plus.circle.fill"
              tintColor="black"
              size={20}
              resizeMode="scaleAspectFill"
            />
          </TouchableOpacity>
        </Link>
      </View>
      {upcomingTrips.map((trip) => (
        <Animated.View exiting={FadeOut.duration(300)} key={trip.id}>
          <TripCardMenu>
            <TripCard trip={trip} />
          </TripCardMenu>
        </Animated.View>
      ))}

      {pastTrips.length > 0 && (
        <Text className="font-bold text-xl">Past trips</Text>
      )}
      {pastTrips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </>
  );
}

function TripCardMenu({ children }: { children: ReactElement }) {
  return (
    <Menu.Root>
      <Menu.Trigger>{children}</Menu.Trigger>
      <Menu.Content
        loop={false}
        alignOffset={0}
        avoidCollisions={true}
        collisionPadding={0}
      >
        <Menu.Label>Trip Menu</Menu.Label>
        <Menu.Item
          key="leave"
          onSelect={() => Alert.alert("Left group")}
          destructive
        >
          <Menu.ItemIcon ios={{ name: "door.left.hand.open" }} />
          <Menu.ItemTitle>Leave</Menu.ItemTitle>
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  );
}

const URGENCY_THRESHOLD = 7;

function TripCard({ trip }: { trip: Trips[number] }) {
  const utils = trpc.useUtils();

  const isUrgent =
    !dayjs(trip.endDate).isBefore(dayjs()) &&
    dayjs(trip.startDate).diff(dayjs(), "days") < URGENCY_THRESHOLD;

  return (
    <Link
      href={{ pathname: "/(home)/trips/[id]", params: { id: trip.id } }}
      asChild
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          utils.trips.getById.setData(trip.id, trip);
        }}
      >
        <View
          style={{
            borderRadius: 20,
            borderCurve: "continuous",
            height: 200,
            overflow: "hidden",
            minWidth: 350,
          }}
        >
          <Image
            source={{ uri: trip.imageUrl }}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              zIndex: 0,
            }}
            cachePolicy="none"
          />

          <Canvas
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              zIndex: 1,
            }}
          >
            <Rect width={500} height={200}>
              <LinearGradient
                colors={["#00000000", "#000000AA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 200 }}
              />
            </Rect>
          </Canvas>

          <View className="flex-1"></View>

          <View className="flex flex-row p-5" style={{ zIndex: 10 }}>
            <View className="flex flex-col">
              <Text className="mb-2 text-4xl text-white font-bold">
                {trip.name}
              </Text>

              <View className="flex flex-row items-center gap-2">
                {isUrgent && (
                  <SymbolView
                    name="alarm.fill"
                    tintColor="white"
                    size={16}
                    resizeMode="scaleAspectFill"
                  />
                )}

                <Text className="text-white font-bold">
                  {dayjs(trip.startDate).fromNow()}
                </Text>
              </View>
            </View>

            <View className="flex-1"></View>

            <MembersList members={trip.members} />
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const MAX_CIRCLES = 3;

function MembersList({ members }: { members: Trips[number]["members"] }) {
  const visibleMembers = members.slice(0, MAX_CIRCLES);

  const remainingMembers = members.length - MAX_CIRCLES;

  return (
    <View className="flex flex-row-reverse">
      {visibleMembers.map((member, i) => (
        <Image
          key={member.id}
          source={{ uri: member.pictureUrl ?? "" }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 99,
            alignSelf: "flex-end",
            borderWidth: 1,
            borderColor: "#FFF",
            marginRight: i === 0 ? 0 : -10,
            zIndex: members.length - i,
          }}
        />
      ))}
      {remainingMembers > 0 && (
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 99,
            alignSelf: "flex-end",
            backgroundColor: "white",
            justifyContent: "center",
            alignItems: "center",
            marginRight: -10,
            zIndex: 0,
          }}
        >
          <Text className="font-bold">+{remainingMembers}</Text>
        </View>
      )}
    </View>
  );
}
