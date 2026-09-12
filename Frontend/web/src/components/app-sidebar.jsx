import {
  Calendar,
  Users,
  LayoutDashboard,
  Wallet,
  ChevronDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Button } from "@base-ui/react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // 1. Added useLocation

// Your navigation links
const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  {
    title: "Employee",
    url: "/employee",
    icon: Users,
    children: [
      { title: "All Employee", url: "/employee" },
      { title: "Leave Request", url: "/employee/leave-request" },
      { title: "New Employee", url: "/employee/new-employee" },
    ],
  },
  {
    title: "Attendance",
    url: "/attendance",
    icon: Calendar,
    children: [
      { title: "All Attendance", url: "/attendance" },
      { title: "Location Log", url: "/attendance/attendance-log" },
      { title: "Location", url: "/attendance/location" },
    ],
  },
  {
    title: "Payroll",
    url: "/payroll",
    icon: Wallet,
    children: [
      { title: "Overview", url: "/payroll" },
      { title: "Run Payroll", url: "/payroll/run" },
      { title: "Payslips", url: "/payroll/payslips" },
      { title: "Loans", url: "/payroll/loans" },
      { title: "Settings", url: "/payroll/settings" },
    ],
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

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
            <SidebarMenu>
              {items.map((item) => {
                // Check if this item is currently active

                if (item.children) {
                  const isGroupActive = item.children.some(
                    (child) => location.pathname === child.url,
                  );
                  return (
                    <Collapsible key={item.title} defaultOpen={isGroupActive}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger
                          render={
                            <SidebarMenuButton
                              isActive={isGroupActive}
                              className={`flex items-center gap-2 p-2 rounded-lg transition-colors w-full ${
                                isGroupActive
                                  ? "bg-[#6675EC]/10 text-[#6675EC] font-medium"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            />
                          }
                        >
                          <span className="shrink-0">
                            <item.icon className="w-5 h-5" />
                          </span>
                          <span>{item.title}</span>
                          <ChevronDown className="w-4 h-4 ml-auto" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="mt-1">
                            {item.children.map((child) => {
                              const isChildActive =
                                location.pathname === child.url;
                              return (
                                <SidebarMenuSubItem key={child.url}>
                                  <SidebarMenuSubButton
                                    isActive={isChildActive}
                                    render={
                                      <Link
                                        to={child.url}
                                        className={`justify-start transition-colors ${
                                          isChildActive
                                            ? "text-[#6675EC] font-medium bg-[#6675EC]/10"
                                            : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                      />
                                    }
                                  >
                                    {child.title}
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      render={
                        <Link
                          to={item.url}
                          className={`flex items-center gap-2 p-2 rounded-lg transition-colors w-full ${
                            isActive
                              ? "bg-[#6675EC]/10 text-[#6675EC] font-medium" // Active style
                              : "text-gray-600 hover:bg-gray-100" // Inactive style
                          }`}
                        />
                      }
                    >
                      <span className="shrink-0">
                        <item.icon className="w-5 h-5" />
                      </span>
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
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
