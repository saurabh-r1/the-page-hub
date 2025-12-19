import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth } from "../utils/authStorage";

export const AuthContext = createContext();

/**
 * AuthProvider
 * - Keeps in-memory authUser (object or null) for components to read.
 * - Persistence (token + user) is handled by utils/authStorage.saveAuth from Login/Signup.
 *
 * NOTE: we intentionally keep the public setter signature similar to previous:
 *   const [authUser, setAuthUser] = useAuth();
 * setAuthUser expects a user object (or null). For token persistence, use authStorage.saveAuth(...)
 */
export default function AuthProvider({ children }) {
  const initial = (() => {
    try {
      const { user } = getAuth();
      return user || null;
    } catch {
      return null;
    }
  })();

  const [authUser, setAuthUser] = useState(initial);

  // listen to storage changes to sync across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === null) {
        // some browsers send null for clear() — re-read
        const { user } = getAuth();
        setAuthUser(user || null);
        return;
      }
      if (e.key === "auth_v1" || e.key === "Users" || e.key === "token") {
        const { user } = getAuth();
        setAuthUser(user || null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <AuthContext.Provider value={[authUser, setAuthUser]}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
