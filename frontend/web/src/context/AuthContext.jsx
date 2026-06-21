import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("laafitech_token");
    if (!token) {
      setLoading(false);
      return;
    }
    client
      .get("/auth/me/")
      .then(async (res) => {
        setUser(res.data);
        if (res.data.role === "agent") await loadAgentProfile();
      })
      .catch(() => localStorage.removeItem("laafitech_token"))
      .finally(() => setLoading(false));
  }, []);

  const loadAgentProfile = async () => {
    try {
      const res = await client.get("/agents/");
      const list = res.data.results ?? res.data;
      setAgent(list[0] || null);
    } catch {
      setAgent(null);
    }
  };

  const login = async (phone_number, password) => {
    const res = await client.post("/auth/login/", { phone_number, password });
    localStorage.setItem("laafitech_token", res.data.token);
    setUser(res.data.user);
    if (res.data.user.role === "agent") await loadAgentProfile();
    return res.data.user;
  };

  // role must be "funder", "admin", or "community_user" -- the only roles
  // the backend's RegisterSerializer accepts for self-registration.
  // ("admin" additionally requires a valid invite_code.) Agents are
  // onboarded by an admin, and "superadmin" elevation happens via Django
  // admin / createsuperuser.
  const register = async (payload) => {
    const res = await client.post("/auth/register/", payload);
    localStorage.setItem("laafitech_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("laafitech_token");
    setUser(null);
    setAgent(null);
  };

  return (
    <AuthContext.Provider value={{ user, agent, loading, login, register, logout, refreshAgent: loadAgentProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
