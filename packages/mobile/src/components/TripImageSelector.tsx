import { useQueryClient } from "@tanstack/react-query";
import { RouterOutputs } from "@trippy/api";
import { getQueryKey } from "@trpc/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { convertToBase64 } from "../utils/images";
import { trpc } from "../utils/trpc";

type Trip = RouterOutputs["trips"]["getById"];

export function TripImageSelector({ trip }: { trip: Trip }) {
  const [imageUrl, setImageUrl] = useState(trip.imageUrl ?? "");

  const queryClient = useQueryClient();

  const uploadImage = trpc.trips.uploadImage.useMutation({
    onError: (error) => {
      console.error(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(trpc.trips),
      });
    },
  });

  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      selectionLimit: 1,
    });
    if (result.canceled || !result.assets[0]) {
      return;
    }

    try {
      setLoading(true);
      const asset = result.assets[0];

      setImageUrl(asset.uri);

      const imageData = await convertToBase64(asset);
      const mimeType = asset.mimeType ?? "image/jpeg";
      const extension = asset.uri.split(".").pop() ?? "jpeg";

      await uploadImage.mutateAsync({
        tripId: trip.id,
        imageData,
        mimeType,
        extension,
      });
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => pickImage()}
      style={{
        width: 275,
        aspectRatio: 2,
        borderRadius: 16,
        borderCurve: "continuous",
        overflow: "hidden",
      }}
    >
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: "100%",
          height: "100%",
        }}
        cachePolicy="none"
      />

      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#000",
          opacity: 0.3,
        }}
      />

      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <SymbolView
            name="camera"
            size={24}
            tintColor="white"
            resizeMode="scaleAspectFill"
          />
        )}
      </View>
    </TouchableOpacity>
  );
}
