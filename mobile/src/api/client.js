import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Points at the Django backend (laafitech_backend/). For device testing,
// set this to your machine's LAN IP (not localhost) or a deployed Railway URL.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

const client = axios.create({ baseURL: API_BASE_URL });

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("laafitech_agent_token");
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

export default client;
