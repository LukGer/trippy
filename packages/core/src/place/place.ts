import { z } from "zod";

const FIND_PLACE_BASE_URL =
  "https://maps.googleapis.com/maps/api/place/findplacefromtext/json";

const PLACE_PHOTO_BASE_URL = "https://maps.googleapis.com/maps/api/place/photo";

export namespace Place {
  export const FindPlaceResult = z.object({
    candidates: z.array(
      z.object({
        photos: z.array(
          z.object({
            width: z.number(),
            height: z.number(),
            html_attributions: z.array(z.string()),
            photo_reference: z.string(),
          })
        ),
      })
    ),
    status: z.enum([
      "OK",
      "ZERO_RESULTS",
      "INVALID_REQUEST",
      "OVER_QUERY_LIMIT",
      "REQUEST_DENIED",
      "UNKNOWN_ERROR",
    ]),
  });

  export const PhotoResult = z.object({});
}
