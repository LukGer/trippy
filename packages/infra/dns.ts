export const domain = {
  dev: "dev.trippy.lukger.dev",
  prod: "trippy.lukger.dev",
}[$app.stage];

export const zone = cloudflare.getZoneOutput({
  name: "lukger.dev",
});
