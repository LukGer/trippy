import {
  Client,
  PlaceAutocompleteType,
} from "@googlemaps/google-maps-services-js";
import { Resource } from "sst";
import { z } from "zod";
import { fn } from "../util/fn";

export namespace Place {
  export const PlaceAutocompleteResult = z.object({
    placeId: z.string(),
    description: z.string(),
  });

  export type PlaceAutocompleteResult = z.infer<typeof PlaceAutocompleteResult>;

  export const searchPlace = fn(
    z.object({
      search: z.string(),
      locale: z.string().optional(),
    }),
    async (input): Promise<PlaceAutocompleteResult[]> => {
      if (input.search.length === 0) {
        return [];
      }

      const apiKey = Resource.GoogleApiKey.value;

      const placesClient = new Client();

      return await placesClient
        .placeAutocomplete({
          params: {
            key: apiKey,
            input: input.search,
            language: input.locale,
            types: PlaceAutocompleteType.cities,
          },
        })
        .then((response) => {
          return response.data.predictions.map((prediction) => ({
            placeId: prediction.place_id,
            description: prediction.description,
          }));
        });
    }
  );

  export const getImageForPlace = fn(z.string(), async (placeId) => {
    const apiKey = Resource.GoogleApiKey.value;

    const placesClient = new Client();

    const details = await placesClient.placeDetails({
      params: {
        key: apiKey,
        place_id: placeId,
      },
    });

    const mainPhotoRef = details.data.result.photos?.[0]?.photo_reference;

    if (!mainPhotoRef) {
      return null;
    }

    const response = await placesClient.placePhoto({
      params: {
        key: apiKey,
        photoreference: mainPhotoRef,
        maxheight: 400,
        maxwidth: 600,
      },
      responseType: "arraybuffer",
    });

    return response.data as ArrayBuffer;
  });
}
