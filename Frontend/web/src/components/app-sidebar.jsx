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
import { Link, useNavigate, useLocation } from "react-router-dom"; // 1. Added useLocation

// Your navigation links
const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Employee", url: "/employee", icon: User },
  { title: "Attendance", url: "/attendance", icon: Calendar },
  { title: "Payroll", url: "/payroll", icon: Search },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation(); // 2. Get current URL info

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
            {items.map((item) => {
              // Check if this item is currently active
              const isActive = location.pathname === item.url;

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    {/* Pass isActive if your Sidebar component supports it */}
                    <Link
                      to={item.url}
                      // Apply conditional styling for background and text colors
                      className={`flex items-center gap-2 p-2 rounded-lg transition-colors w-full ${
                        isActive
                          ? "bg-[#6675EC]/10 text-[#6675EC] font-medium" // Active style (tinted green background)
                          : "text-gray-600 hover:bg-gray-100" // Inactive style
                      }`}
                    >
                      <span className="shrink-0">
                        <item.icon className="w-5 h-5" />
                      </span>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <Button
            className="w-full bg-[#2AAF56] hover:bg-[#EC6668] rounded-[10px] text-white py-2"
            onClick={() => {
              // localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            Log-out
          </Button>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
