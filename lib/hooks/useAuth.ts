/**
 * useAuth Hook
 */

"use client";

import { useContext } from "react";
import { AuthContext } from "@/lib/auth/context";
import { AuthContextType } from "@/lib/auth/types";

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
