import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MealProvider } from "@/context/MealContext";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import DailyMeal from "./pages/DailyMeal";
import Expenses from "./pages/Expenses";
import Deposits from "./pages/Deposits";
import Members from "./pages/Members";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MealProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/daily-meal" element={<DailyMeal />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/deposits" element={<Deposits />} />
              <Route path="/members" element={<Members />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </MealProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
