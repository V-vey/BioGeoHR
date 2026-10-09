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

      {/* min-w-0: without it a wide table stretches the whole page past the screen
          (laptops) instead of scrolling inside its own box */}
      <main className="flex-1 min-w-0 p-[16px] md:p-[22px_28px]">
        {/* <SidebarTrigger nav={nav} /> */}
        {children}
      </main>
    </SidebarProvider>
  );
}
