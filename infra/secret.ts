export const secret = {
  ClerkSecretKey: new sst.Secret("ClerkSecretKey"),
  ClerkPublishableKey: new sst.Secret("ClerkPublishableKey"),
  DatabaseUrl: new sst.Secret("DatabaseUrl"),
  GoogleApiKey: new sst.Secret("GoogleApiKey"),
};

export const allSecrets = Object.values(secret);
