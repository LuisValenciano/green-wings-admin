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
import ClienteModule from "@/components/modules/ClienteModule";
import RolesModule from "@/components/modules/RolesModule";
import RutaModule from "@/components/modules/RutaModule";
import VueloModule from "@/components/modules/VueloModule";
import ReservaModule from "@/components/modules/ReservaModule";
import PasajerosModule from "@/components/modules/PasajerosModule";
import UsuarioSistemaModule from "@/components/modules/UsuarioSistemaModule";
import LogModule from "@/components/modules/LogModule";
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
              <Route path="cliente" element={<ClienteModule />} />
              <Route path="pasajeros" element={<PasajerosModule />} />
              <Route path="reserva" element={<ReservaModule />} />
              <Route path="roles" element={<RolesModule />} />
              <Route path="ruta" element={<RutaModule />} />
              <Route path="usuario-sistema" element={<UsuarioSistemaModule />} />
              <Route path="vuelo" element={<VueloModule />} />
              <Route path="log" element={<LogModule />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
