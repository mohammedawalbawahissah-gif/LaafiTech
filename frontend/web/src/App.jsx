import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Dashboard from "./pages/admin/Dashboard";
import VerificationQueue from "./pages/admin/VerificationQueue";
import Agents from "./pages/admin/Agents";
import Inventory from "./pages/admin/Inventory";
import Payouts from "./pages/admin/Payouts";
import Schools from "./pages/admin/Schools";

import ImpactOverview from "./pages/funder/ImpactOverview";
import Deliveries from "./pages/funder/Deliveries";
import Procure from "./pages/funder/Procure";
import Orders from "./pages/funder/Orders";

function HomeRedirect() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  return <Navigate to={isAdmin ? "/admin" : "/funder"} replace />;
}

function PrivateRoute({ allow, children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allow && !allow.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <HomeRedirect />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <PrivateRoute allow={["admin", "superadmin"]}>
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

      <Route
        path="/funder"
        element={
          <PrivateRoute allow={["funder"]}>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<ImpactOverview />} />
        <Route path="deliveries" element={<Deliveries />} />
        <Route path="procure" element={<Procure />} />
        <Route path="orders" element={<Orders />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
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
