export const secret = {
  ClerkSecretKey: new sst.Secret("ClerkSecretKey"),
  ClerkPublishableKey: new sst.Secret("ClerkPublishableKey"),
  DatabaseUrl: new sst.Secret("DatabaseUrl"),
};

export const allSecrets = Object.values(secret);
