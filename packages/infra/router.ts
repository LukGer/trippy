import { api } from "./api";
import { domain } from "./dns";

export const router = new sst.aws.Router("trippy-router", {
  routes: {
    "/*": api.url,
  },
  domain: {
    name: domain,
    dns: sst.cloudflare.dns(),
  },
});
