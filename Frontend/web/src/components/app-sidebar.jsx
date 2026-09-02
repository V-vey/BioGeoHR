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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@base-ui/react";

import { Link, useNavigate } from "react-router-dom";

// Your navigation links
const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Employee", url: "/employee", icon: User },
  { title: "Attendance", url: "/attendance", icon: Calendar },
  { title: "Payroll", url: "/payroll", icon: Search },
];

export function AppSidebar() {
  const navigate = useNavigate();
  return (
    <Sidebar className="w-65">
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
                  <Link to={item.url}>
                    <div className="flex items-center gap-2">
                      <span className="shrink-0">
                        <item.icon />
                      </span>
                      <span>{item.title}</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Button
            className=" w-full bg-[#2AAF56] 
                      hover:bg-[#EC6668]
                        rounded-[10px]
                      text-white"
            onClick={() => {
              // localStorage.removeItem("token");
              navigate("login");
            }}
          >
            Log-out
          </Button>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
