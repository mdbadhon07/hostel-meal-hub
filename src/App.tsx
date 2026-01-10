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
  const { user, loading, isAdmin, configError } = useAuth();

  // Show config error if backend env is missing
  if (configError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-lg border border-destructive/50 p-6 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Backend কনফিগারেশন সমস্যা</h1>
          <p className="text-muted-foreground mb-4">{configError}</p>
          <p className="text-sm text-muted-foreground">
            Developer: .env ফাইলে VITE_SUPABASE_URL এবং VITE_SUPABASE_PUBLISHABLE_KEY সেট করুন।
          </p>
        </div>
      </div>
    );
  }

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
