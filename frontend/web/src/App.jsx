import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { roleHome } from "./utils/roleHome";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Dashboard from "./pages/admin/Dashboard";
import VerificationQueue from "./pages/admin/VerificationQueue";
import Agents from "./pages/admin/Agents";
import Inventory from "./pages/admin/Inventory";
import Payouts from "./pages/admin/Payouts";
import Schools from "./pages/admin/Schools";
import Products from "./pages/admin/Products";

import ImpactOverview from "./pages/funder/ImpactOverview";
import Deliveries from "./pages/funder/Deliveries";
import Procure from "./pages/funder/Procure";
import Orders from "./pages/funder/Orders";
import FunderProfile from "./pages/funder/FunderProfile";

import AgentHome from "./pages/agent/AgentHome";
import AgentLogDistribution from "./pages/agent/AgentLogDistribution";
import AgentInventory from "./pages/agent/AgentInventory";
import AgentEarnings from "./pages/agent/AgentEarnings";
import AgentHistory from "./pages/agent/AgentHistory";
import AgentProfile from "./pages/agent/AgentProfile";
import AgentProducts from "./pages/agent/AgentProducts";

import CommunityHome from "./pages/community/CommunityHome";
import CycleTracker from "./pages/community/CycleTracker";
import Shop from "./pages/community/Shop";
import CommunityProfile from "./pages/community/CommunityProfile";

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={roleHome(user?.role)} replace />;
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
        <Route path="products" element={<Products />} />
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
        <Route path="profile" element={<FunderProfile />} />
      </Route>

      <Route
        path="/agent"
        element={
          <PrivateRoute allow={["agent"]}>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<AgentHome />} />
        <Route path="log" element={<AgentLogDistribution />} />
        <Route path="inventory" element={<AgentInventory />} />
        <Route path="earnings" element={<AgentEarnings />} />
        <Route path="history" element={<AgentHistory />} />
        <Route path="products" element={<AgentProducts />} />
        <Route path="profile" element={<AgentProfile />} />
      </Route>

      <Route
        path="/community"
        element={
          <PrivateRoute allow={["community_user"]}>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<CommunityHome />} />
        <Route path="tracker" element={<CycleTracker />} />
        <Route path="shop" element={<Shop />} />
        <Route path="profile" element={<CommunityProfile />} />
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
