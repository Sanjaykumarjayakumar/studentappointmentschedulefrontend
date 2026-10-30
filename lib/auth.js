"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { SESSION_KEY } from "./api";

export const ROLE_HOME = {
  patient: "/patient",
  doctor: "/doctor",
  pharmacist: "/pharmacist",
  hospital: "/hospital",
  admin: "/admin",
};

const decodeJwt = (token) => {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = part + "=".repeat((4 - (part.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return {};
  }
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (raw?.token) {
        const exp = decodeJwt(raw.token).exp;
        if (!exp || exp * 1000 > Date.now()) setSession(raw);
        else localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
    setReady(true);
  }, []);

  // Build a session from whatever shape the login endpoint returned.
  const startSession = useCallback((data, fallbackRole) => {
    const token = data?.token;
    if (!token) throw new Error("The server did not return a login token.");
    const claims = decodeJwt(token);
    const profile = data.user || data.admin || data.profile || data.account || {};
    const next = {
      token,
      user: {
        id: profile._id || profile.id || claims.id || claims._id || claims.userId || claims.sub,
        name: profile.name || data.name || claims.name || (profile.email || data.email || "").split("@")[0],
        email: profile.email || data.email || claims.email || "",
        role: profile.role || data.role || claims.role || fallbackRole,
      },
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    setSession(next);
    return next.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    router.replace("/login");
  }, [router]);

  useEffect(() => {
    const onExpired = () => {
      localStorage.removeItem(SESSION_KEY);
      setSession(null);
      toast.error("Your session has expired. Please sign in again.", { id: "expired" });
      router.replace("/login");
    };
    window.addEventListener("bit:unauthorized", onExpired);
    return () => window.removeEventListener("bit:unauthorized", onExpired);
  }, [router]);

  const value = useMemo(
    () => ({ user: session?.user || null, token: session?.token || null, ready, startSession, logout }),
    [session, ready, startSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
