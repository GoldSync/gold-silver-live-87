import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./components/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import DashboardV2 from "./pages/DashboardV2";
import DashboardV3 from "./pages/DashboardV3";
import DashboardV4 from "./pages/DashboardV4";
import DashboardV5 from "./pages/DashboardV5";
import DashboardV6 from "./pages/DashboardV6";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import SuperAdmin from "./pages/SuperAdmin";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AdminAuthProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<DashboardV6 />} />
              <Route path="/v0" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard-v2" element={<DashboardV2 />} />
              <Route path="/dashboard-v3" element={<DashboardV3 />} />
              <Route path="/dashboard-v4" element={<DashboardV4 />} />
              <Route path="/dashboard-v5" element={<DashboardV5 />} />
              <Route path="/dashboard-v6" element={<DashboardV6 />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/super-admin" element={<SuperAdmin />} />
              <Route path="/setup" element={<Onboarding />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </AdminAuthProvider>
  </QueryClientProvider>
);

export default App;
