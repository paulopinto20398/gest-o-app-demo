import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4 md:hidden mb-4">
              <SidebarTrigger />
              <span className="font-semibold">Jornada de Integração</span>
            </div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
