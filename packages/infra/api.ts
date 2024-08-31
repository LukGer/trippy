import { secret } from "./secret";

export const api = new sst.aws.Function("trpc", {
  url: true,

  handler: "./apps/api/src/server.handler",
  link: [secret.ClerkSecretKey, secret.ClerkPublishableKey, secret.DatabaseUrl],
});
