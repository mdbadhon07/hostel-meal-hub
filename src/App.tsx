import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MealProvider } from "@/context/MealContext";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import DailyMeal from "./pages/DailyMeal";
import Expenses from "./pages/Expenses";
import Deposits from "./pages/Deposits";
import Members from "./pages/Members";
import AdminMembers from "./pages/AdminMembers";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import ShopAccount from "./pages/ShopAccount";
import Login from "./pages/Login";
import MemberMealInput from "./pages/MemberMealInput";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not logged in, show login
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If logged in but not admin, show member meal input only
  if (!isAdmin) {
    return (
      <Routes>
        <Route path="/member-meal" element={<MemberMealInput />} />
        <Route path="*" element={<Navigate to="/member-meal" replace />} />
      </Routes>
    );
  }

  // Admin gets full access
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/daily-meal" element={<DailyMeal />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/deposits" element={<Deposits />} />
        <Route path="/members" element={<Members />} />
        <Route path="/admin-members" element={<AdminMembers />} />
        <Route path="/shop-account" element={<ShopAccount />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <MealProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </MealProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
