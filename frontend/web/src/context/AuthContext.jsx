import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [agent, setAgent] = useState(null);
  const [funder, setFunder] = useState(null);
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
        if (res.data.role === "funder") await loadFunderProfile();
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

  const loadFunderProfile = async () => {
    try {
      const res = await client.get("/funder-organizations/");
      const list = res.data.results ?? res.data;
      setFunder(list[0] || null);
    } catch {
      setFunder(null);
    }
  };

  const login = async (email, password, role) => {
    const payload = { email, password };
    if (role) payload.role = role;
    const res = await client.post("/auth/login/", payload);
    localStorage.setItem("laafitech_token", res.data.token);
    setUser(res.data.user);
    if (res.data.user.role === "agent") await loadAgentProfile();
    if (res.data.user.role === "funder") await loadFunderProfile();
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
    if (res.data.user.role === "funder") await loadFunderProfile();
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("laafitech_token");
    setUser(null);
    setAgent(null);
    setFunder(null);
  };

  const updateProfile = async (payload) => {
    const res = await client.patch("/auth/me/", payload);
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, agent, funder, loading, login, register, logout, updateProfile, refreshAgent: loadAgentProfile, refreshFunder: loadFunderProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
