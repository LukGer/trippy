import { allSecrets } from "./secret";
import { bucket } from "./storage";

export const api = new sst.aws.Function("trpc", {
  url: true,
  handler: "./packages/api/server.handler",
  link: [...allSecrets, bucket],
});
