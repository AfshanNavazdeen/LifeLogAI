import { AppSidebar } from "../app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-4">Sidebar Navigation Demo</h1>
          <p className="text-muted-foreground">
            Use the sidebar to navigate between different sections.
          </p>
        </div>
      </div>
    </SidebarProvider>
  );
}
