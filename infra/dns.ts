export const domain =
  {
    dev: "dev.trippy.lukger.dev",
    prod: "trippy.lukger.dev",
  }[$app.stage] ?? $app.stage + ".trippy.lukger.dev";

export const zone = cloudflare.getZoneOutput({
  name: "lukger.dev",
});
