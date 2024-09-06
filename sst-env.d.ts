/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    "ClerkPublishableKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "ClerkSecretKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "DatabaseUrl": {
      "type": "sst.sst.Secret"
      "value": string
    }
  }
}
export {}
