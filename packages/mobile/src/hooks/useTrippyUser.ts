import { useContext } from "react";
import { UserContext } from "../context/user-context";

export const useTrippyUser = () => {
  return useContext(UserContext);
};
