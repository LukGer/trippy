import type { DbUser } from "@trippy/api";
import { createContext } from "react";

export const UserContext = createContext<DbUser>(null!);
