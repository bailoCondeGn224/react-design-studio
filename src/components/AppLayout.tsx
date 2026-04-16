import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import { useSidebar } from "@/contexts/SidebarContext";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main
        className={`transition-all duration-300 ${
          collapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'
        }`}
      >
        <div className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
