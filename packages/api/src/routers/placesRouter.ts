import { Place } from "@trippy/core/place/place";
import { z } from "zod";
import { procedure, router } from "../trpc";

export const placesRouter = router({
  searchForPlaces: procedure
    .input(
      z.object({
        search: z.string(),
        locale: z.string().optional(),
      })
    )
    .query((opts) => Place.searchPlace(opts.input)),
});
