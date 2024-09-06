import { domain } from "./dns";
import { allSecrets } from "./secret";

export const api = new sst.cloudflare.Worker("api", {
  handler: "./apps/api/worker.ts",
  url: true,
  link: [...allSecrets],
  domain: "api." + domain,
});
