/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: "trippy",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "eu-central-1",
          profile: input.stage === "production" ? "lukger-prod" : "lukger-dev",
        },
        cloudflare: true,
      },
    };
  },
  async run() {
    const { domain, zone } = await import("./infra/dns");
    const { api } = await import("./infra/api");
    const { router } = await import("./infra/router");
    const { secret } = await import("./infra/secret");
    const { bucket } = await import("./infra/storage");

    return {
      api: api.url,
      router: router.url,
      domain,
      zone,
      secret,
      bucket,
    };
  },
});
