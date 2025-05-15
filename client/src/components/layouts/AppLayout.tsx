import { ReactNode, useState } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import MobileNav from "@/components/navigation/MobileNav";
import MobileMenu from "@/components/navigation/MobileMenu";
import OfflineBanner from "@/components/ui/offline-banner";
import { useContext } from "react";
import { SyncContext } from "@/context/SyncContext";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isOffline, pendingChanges } = useContext(SyncContext);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              className="lg:hidden mr-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="ri-menu-line text-xl text-neutral-500"></i>
            </button>
            <div className="flex items-center">
              <img
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40&q=80"
                alt="AgroGest Logo"
                className="h-8 w-8 rounded-md"
              />
              <h1 className="text-primary font-header font-bold text-lg ml-2 hidden sm:inline-block">
                AgroGest
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Sync Status Indicator */}
            <div className="flex items-center" id="sync-status">
              <span className={`inline-block h-2 w-2 rounded-full ${isOffline ? 'bg-destructive sync-pulse' : 'bg-success'} mr-2`}></span>
              <span className="text-xs text-neutral-400 hidden sm:inline">
                {isOffline ? 'Sin conexión' : 'En línea'}
              </span>
            </div>

            {/* User Menu */}
            <div className="relative" id="user-menu-container">
              <button id="user-menu-button" className="flex items-center">
                <span className="hidden sm:inline-block mr-2 text-sm text-neutral-500">
                  Juan García
                </span>
                <img
                  className="h-8 w-8 rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=32&h=32&q=80"
                  alt="Usuario"
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for larger screens */}
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-neutral-100 p-4 sm:p-6 pb-20 lg:pb-6">
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav openMoreMenu={() => setMobileMenuOpen(true)} />

      {/* Mobile more menu */}
      <MobileMenu open={mobileMenuOpen} setOpen={setMobileMenuOpen} />

      {/* Offline banner */}
      {isOffline && <OfflineBanner pendingChanges={pendingChanges} />}
    </div>
  );
}
