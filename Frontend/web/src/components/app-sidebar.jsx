import {
  Home,
  Inbox,
  Calendar,
  Search,
  Settings,
  LayoutDashboard,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

// Your navigation links
const items = [
  { title: "Dashboard", url: "#", icon: LayoutDashboard },
  { title: "Employee", url: "#", icon: User },
  { title: "Attendance", url: "#", icon: Calendar },
  { title: "Payroll", url: "#", icon: Search },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader>
          <div className="text-start p-2 font-bold text-xl">
            <span className="text-[#2AAF56]">BioGeo</span>
            <span className="text-[#6675EC]">HR</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
        </SidebarContent>
      </SidebarContent>
    </Sidebar>
  );
}
