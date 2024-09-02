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
    const { domain, zone } = await import("./packages/infra/dns");
    const { api } = await import("./packages/infra/api");
    const { router } = await import("./packages/infra/router");
    const { secret } = await import("./packages/infra/secret");

    return {
      api: api.url,
      router: router.url,
      domain,
      zone,
      secret,
    };
  },
});
