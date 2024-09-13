import { useContext } from "react";
import { UserContext } from "../context/UserContext";

export const useTrippyUser = () => {
  return useContext(UserContext);
};
