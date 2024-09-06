import { allSecrets } from "./secret";

export const api = new sst.aws.Function("trpc", {
  url: true,
  handler: "./apps/api/server.handler",
  link: [...allSecrets],
});
