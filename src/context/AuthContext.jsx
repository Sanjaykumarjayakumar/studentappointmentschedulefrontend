import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TOKEN_KEY, USER_KEY } from "../api/client";
import { authApi } from "../api/services";
import { decodeJwt } from "../utils/helpers";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readUser);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
  }, []);

  useEffect(() => {
    const onExpired = () => logout();
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, [logout]);

  const persist = (data, fallbackRole) => {
    const tk = data.token || data.accessToken;
    if (!tk) throw new Error("The server did not return a token.");
    const claims = decodeJwt(tk);
    const profile = data.user || data.admin || data.hospital || data.account || {};
    const role = profile.role || data.role || claims.role || fallbackRole;
    const merged = {
      ...profile,
      _id: profile._id || profile.id || claims.id || claims._id || claims.userId,
      name: profile.name || data.name || claims.name || profile.email || data.email || "User",
      email: profile.email || data.email || claims.email,
      role,
    };
    localStorage.setItem(TOKEN_KEY, tk);
    localStorage.setItem(USER_KEY, JSON.stringify(merged));
    setToken(tk);
    setUser(merged);
    return merged;
  };

  const login = async ({ email, password, role }) => {
    const body = { email: email.trim().toLowerCase(), password };
    const data =
      role === "admin"
        ? await authApi.adminLogin(body)
        : await authApi.signIn({ ...body, role });
    return persist(data, role);
  };

  const register = async (form) => authApi.signUp(form);

  const value = useMemo(
    () => ({ user, token, isAuthenticated: !!token && !!user, login, register, logout }),
    [user, token, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
