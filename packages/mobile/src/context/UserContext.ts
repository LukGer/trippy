import { createContext } from "react";
import type { DbUser } from "../../../../packages/api";

export const UserContext = createContext<DbUser>(null!);
