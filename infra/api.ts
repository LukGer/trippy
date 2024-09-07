import { allSecrets } from "./secret";

export const api = new sst.aws.Function("trpc", {
  url: true,
  handler: "./packages/api/server.handler",
  link: [...allSecrets],
});
