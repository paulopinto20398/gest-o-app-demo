import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import BeneficiariesList from "./pages/BeneficiariesList";
import BeneficiaryDetail from "./pages/BeneficiaryDetail";
import NotFound from "./pages/NotFound";

import Login from "./pages/Login";
import Me from "./pages/Me";
import ManagerBeneficiaries from "./pages/ManagerBeneficiaries";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Relatorio from "@/pages/Relatorio";




const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>

          {/* ========================= */}
          {/* PÚBLICO */}
          {/* ========================= */}

          {/* página inicial → login */}
          <Route path="/" element={<Login />} />

          {/* login explícito */}
          <Route path="/login" element={<Login />} />

          <Route path="/manager/relatorio" element={<Relatorio />} />

          {/* ========================= */}
          {/* CIDADÃO */}
          {/* ========================= */}

          {/* página "Me" → redireciona para o seu processo */}
          <Route
            path="/me"
            element={
              <ProtectedRoute allow={["cidadao"]}>
                <Me />
              </ProtectedRoute>
            }
          />



          {/* ========================= */}
          {/* GESTOR */}
          {/* ========================= */}

          {/* dashboard do gestor */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute allow={["gestor"]}>
                <Index />
              </ProtectedRoute>
            }
          />

          {/* lista de beneficiários atribuídos */}
          <Route
            path="/manager/beneficiaries"
            element={
              <ProtectedRoute allow={["gestor"]}>
                <BeneficiariesList />
              </ProtectedRoute>
            }
          />



          {/* ========================= */}
          {/* PARTILHADO (com validação interna) */}
          {/* ========================= */}

          {/* detalhe de beneficiário */}
          <Route
            path="/beneficiaries/:id"
            element={
              <ProtectedRoute allow={["gestor", "cidadao"]}>
                <BeneficiaryDetail />
              </ProtectedRoute>
            }
          />



          {/* ========================= */}
          {/* NOT FOUND */}
          {/* ========================= */}

          <Route path="*" element={<NotFound />} />


        </Routes>


      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
