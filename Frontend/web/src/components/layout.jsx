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

      <main className="flex-1 p-[16px] md:p-[22px_28px]">
        {/* <SidebarTrigger nav={nav} /> */}
        {children}
      </main>
    </SidebarProvider>
  );
}
