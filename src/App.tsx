import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>

  {/* Homepage (optional landing page later) */}
  <Route path="/" element={<div>Home Page</div>} />

  {/* ✅ OLD UUID ROUTE (VERY IMPORTANT) */}
  <Route path="/menu/:tableId" element={<Index />} />

  {/* ✅ NEW SLUG ROUTE */}
  <Route path="/menu/:slug/:tableSlug" element={<Index />} />

  {/* 404 */}
  <Route path="*" element={<NotFound />} />

</Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
