import type { MeResponse } from "@shared/api";
import { createContext } from "react";

export type AuthContextValue = {
    user?: MeResponse
    isAuthenticated: boolean
    isLoading: boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)