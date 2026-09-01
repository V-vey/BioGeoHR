import {
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Layout({ children, nav }) {
  return (
    <SidebarProvider>
      {/* ITEM INSIDE */}
      <AppSidebar />

      <main className="w-full px-8 py-6">
        <SidebarTrigger className="flex items-center" nav={nav} />
        {children}
      </main>
    </SidebarProvider>
  );
}
