import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminLayout } from "@/components/layout/AdminLayout";
import LoginPage from "@/pages/admin/LoginPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import OrdersPage from "@/pages/admin/OrdersPage";
import MenuPage from "@/pages/admin/MenuPage";
import CustomersPage from "@/pages/admin/CustomersPage";
import MarketingPage from "@/pages/admin/MarketingPage";
import ReviewsPage from "@/pages/admin/ReviewsPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import TeamPage from "@/pages/admin/TeamPage";
import SettingsPage from "@/pages/admin/SettingsPage";
import NotFound from "@/pages/NotFound";
import AdminDeliveryZonesPage from "./pages/admin/DeliveryZonePage";
import "leaflet/dist/leaflet.css";
import ContentManagerPage from "./pages/admin/ContentManagerPage";
import SeoPage from "./pages/admin/SeoPage";
import PaymentsPage from "./pages/admin/PaymentsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="marketing" element={<MarketingPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="/admin/payments" element={<PaymentsPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="delivery" element={<AdminDeliveryZonesPage />} />
            <Route path="seo" element={<SeoPage />} />
            <Route path="content" element={<ContentManagerPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
