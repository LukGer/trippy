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
      },
    };
  },
  async run() {
    const { api } = await import("./packages/infra/api");
    const { secret } = await import("./packages/infra/secret");

    return {
      api: api.url,
      secret,
    };
  },
});
