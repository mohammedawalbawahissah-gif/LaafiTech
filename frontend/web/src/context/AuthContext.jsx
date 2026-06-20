import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("laafitech_token");
    if (!token) {
      setLoading(false);
      return;
    }
    client
      .get("/auth/me/")
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("laafitech_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (phone_number, password) => {
    const res = await client.post("/auth/login/", { phone_number, password });
    localStorage.setItem("laafitech_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  // role must be "admin" or "funder" — the public sign-up form only ever
  // sends one of those two. (Real "superadmin" elevation happens via
  // Django admin / createsuperuser, not self-service sign-up.)
  const register = async (payload) => {
    const res = await client.post("/auth/register/", payload);
    localStorage.setItem("laafitech_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("laafitech_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
