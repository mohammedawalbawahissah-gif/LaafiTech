import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("laafitech_agent_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await client.get("/auth/me/");
        setUser(me.data);
        await loadAgentProfile();
      } catch {
        await AsyncStorage.removeItem("laafitech_agent_token");
      } finally {
        setLoading(false);
      }
    })();
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
    await AsyncStorage.setItem("laafitech_agent_token", res.data.token);
    setUser(res.data.user);
    await loadAgentProfile();
    return res.data.user;
  };

  const logout = async () => {
    await AsyncStorage.removeItem("laafitech_agent_token");
    setUser(null);
    setAgent(null);
  };

  return (
    <AuthContext.Provider value={{ user, agent, loading, login, logout, refreshAgent: loadAgentProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
