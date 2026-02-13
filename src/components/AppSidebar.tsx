import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, Settings, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

export function AppSidebar() {
  const location = useLocation();

  const items = [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Beneficiários",
      url: "/beneficiaries",
      icon: Users,
    },
    {
      title: "Configurações",
      url: "/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="p-4 mb-4">
            <h1 className="text-xl font-bold text-primary">Jornada de Integração</h1>
            <p className="text-xs text-muted-foreground">Plataforma de Gestão</p>
          </div>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.url === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.url)
                    }
                  >
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <div className="mt-auto p-4 border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
