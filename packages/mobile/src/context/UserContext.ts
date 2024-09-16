import type { User } from "@trippy/core/src/user/user";
import { createContext } from "react";

export const UserContext = createContext<User.Info>(null!);
