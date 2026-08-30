import {
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <SidebarHeader>
        <span className="text-[#2AAF56]">BioGeo</span>
        <span>HR</span>
      </SidebarHeader>

      {/* ITEM INSIDE */}
      <AppSidebar />

      <main className="w-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
