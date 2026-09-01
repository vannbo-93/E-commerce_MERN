/** @format */

import { createContext, useContext } from "react";

interface AuthContextType {
  username: string | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, isAuthenticated: boolean) => void;
}

export const AuthContext = createContext<AuthContextType>({
  username: null,
  token: null,
  isAuthenticated: false,
  login: () => {},
});

export const useAuth = () => useContext(AuthContext);
