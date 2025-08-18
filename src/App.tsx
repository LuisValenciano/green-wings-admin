import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Login from "@/components/Login";
import Dashboard from "@/pages/Dashboard";
import AvionModule from "@/components/modules/AvionModule";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="avion" element={<AvionModule />} />
              <Route path="cliente" element={<div>Módulo Cliente - En desarrollo</div>} />
              <Route path="pasajeros" element={<div>Módulo Pasajeros - En desarrollo</div>} />
              <Route path="reserva" element={<div>Módulo Reserva - En desarrollo</div>} />
              <Route path="roles" element={<div>Módulo Roles - En desarrollo</div>} />
              <Route path="ruta" element={<div>Módulo Ruta - En desarrollo</div>} />
              <Route path="usuario-sistema" element={<div>Módulo Usuario Sistema - En desarrollo</div>} />
              <Route path="vuelo" element={<div>Módulo Vuelo - En desarrollo</div>} />
              <Route path="log" element={<div>Módulo Log - En desarrollo</div>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
