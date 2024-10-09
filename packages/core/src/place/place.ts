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
}
