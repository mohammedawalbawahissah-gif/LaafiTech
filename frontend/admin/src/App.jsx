import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VerificationQueue from "./pages/VerificationQueue";
import Agents from "./pages/Agents";
import Inventory from "./pages/Inventory";
import Payouts from "./pages/Payouts";
import Schools from "./pages/Schools";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!["admin", "superadmin"].includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="verification-queue" element={<VerificationQueue />} />
        <Route path="agents" element={<Agents />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="payouts" element={<Payouts />} />
        <Route path="schools" element={<Schools />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
