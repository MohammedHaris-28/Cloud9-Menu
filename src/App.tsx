
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index.tsx";
import PrivacyTerms from "./pages/PrivacyTerms.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <Routes>
          {/* Homepage */}
          <Route path="/" element={<div>Home Page</div>} />

          {/* Existing QR menu routes */}
          <Route path="/menu/:tableId" element={<Index />} />
          <Route path="/menu/:slug/:tableSlug" element={<Index />} />

          {/* Privacy Policy & Terms page */}
          <Route
            path="/privacy&terms"
            element={<PrivacyTerms />}
          />

          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
