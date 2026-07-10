import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { loginRequest, registerRequest } from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "ira_token";
const USERNAME_KEY = "ira_username";

function decodeRole(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // role isn't in this backend's claims today, but we decode defensively
    // in case it's added later (e.g. payload.role or payload.authorities).
    return payload.role || (Array.isArray(payload.authorities) ? payload.authorities[0] : null);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [username, setUsername] = useState(() => localStorage.getItem(USERNAME_KEY));
  const [role, setRole] = useState(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    return t ? decodeRole(t) : null;
  });
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    setToken(null);
    setUsername(null);
    setRole(null);
  }, []);

  // Let the API layer trigger a logout on 401 without a circular import.
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener("auth:unauthorized", handler);
    return () => window.removeEventListener("auth:unauthorized", handler);
  }, [logout]);

  const login = useCallback(async (usernameInput, password) => {
    setLoading(true);
    setAuthError("");
    try {
      const res = await loginRequest(usernameInput.trim(), password);
      const { token: newToken } = res.data;
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USERNAME_KEY, usernameInput.trim());
      setToken(newToken);
      setUsername(usernameInput.trim());
      setRole(decodeRole(newToken));
      return true;
    } catch (err) {
      const message =
        err.response?.status === 401
          ? err.response?.data || "Invalid username or password"
          : err.message || "Unable to sign in right now";
      setAuthError(typeof message === "string" ? message : "Invalid username or password");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (usernameInput, password) => {
    setLoading(true);
    setAuthError("");
    try {
      const res = await registerRequest(usernameInput.trim(), password);
      const { token: newToken } = res.data;
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USERNAME_KEY, usernameInput.trim());
      setToken(newToken);
      setUsername(usernameInput.trim());
      setRole(decodeRole(newToken));
      return true;
    } catch (err) {
      const status = err.response?.status;
      let message = err.message || "Unable to register right now";
      if (status === 400 || status === 409) {
        message = err.response?.data || message;
      }
      setAuthError(typeof message === "string" ? message : "Unable to register right now");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    token,
    username,
    role,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    authError,
    loading,
    clearAuthError: () => setAuthError(""),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export { TOKEN_KEY };
