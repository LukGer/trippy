export const tripRoles = ["owner", "member"] as const;

export type TripRole = (typeof tripRoles)[number];

export function canManageTrip(role: TripRole) {
  return role === "owner";
}
