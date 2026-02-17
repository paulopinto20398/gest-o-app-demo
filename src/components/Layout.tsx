import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export function Layout({ children }: { children: React.ReactNode }) {
  const { session, loadingSession, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isCidadao = session?.role === "cidadao";
  const isGestor = session?.role === "gestor";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar só para gestor */}
        {isGestor && <AppSidebar />}

        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Top bar */}
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-4">
                {/* Trigger só faz sentido se houver sidebar */}
                {isGestor && (
                  <div className="md:hidden">
                    <SidebarTrigger />
                  </div>
                )}
                <span className="font-semibold">Jornada de Integração</span>
              </div>

              {/* Sessão / Logout */}
              <div className="flex items-center gap-2">
                {!loadingSession && session && (
                  <Badge variant="secondary" className="px-3 py-1">
                    {isCidadao
                      ? "Cidadão"
                      : `Gestor${isGestor ? `: ${session.managerId}` : ""}`}
                  </Badge>
                )}

                {!loadingSession && session && (
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Sair
                  </Button>
                )}
              </div>
            </div>

            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
