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
    "TrippyBucket": {
      "name": string
      "type": "sst.aws.Bucket"
    }
    "router": {
      "type": "sst.aws.Router"
      "url": string
    }
    "trpc": {
      "name": string
      "type": "sst.aws.Function"
      "url": string
    }
  }
}
export {}
