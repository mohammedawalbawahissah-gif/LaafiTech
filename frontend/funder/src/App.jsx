import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import ImpactOverview from "./pages/ImpactOverview";
import Deliveries from "./pages/Deliveries";
import Procure from "./pages/Procure";
import Orders from "./pages/Orders";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
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
        <Route index element={<ImpactOverview />} />
        <Route path="deliveries" element={<Deliveries />} />
        <Route path="procure" element={<Procure />} />
        <Route path="orders" element={<Orders />} />
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
