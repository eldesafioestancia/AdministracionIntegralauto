import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import MachinesIndex from "@/pages/machines/index";
import MachineDetail from "@/pages/machines/[id]";
import MachineMaintenance from "@/pages/machines/maintenance";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/layouts/AppLayout";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Component {...rest} />;
}

function App() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  // Redirect to dashboard if authenticated and on login page
  useEffect(() => {
    if (isAuthenticated && location === "/login") {
      window.location.href = "/";
    }
  }, [isAuthenticated, location]);

  return (
    <TooltipProvider>
      <Toaster />
      <Switch>
        <Route path="/login" component={Login} />
        
        <Route path="/">
          <AppLayout>
            <ProtectedRoute component={Dashboard} />
          </AppLayout>
        </Route>
        
        <Route path="/machines">
          <AppLayout>
            <ProtectedRoute component={MachinesIndex} />
          </AppLayout>
        </Route>
        
        <Route path="/machines/:id">
          {(params) => (
            <AppLayout>
              <ProtectedRoute component={MachineDetail} id={params.id} />
            </AppLayout>
          )}
        </Route>
        
        <Route path="/machines/:id/maintenance">
          {(params) => (
            <AppLayout>
              <ProtectedRoute component={MachineMaintenance} id={params.id} />
            </AppLayout>
          )}
        </Route>
        
        <Route>
          <AppLayout>
            <NotFound />
          </AppLayout>
        </Route>
      </Switch>
    </TooltipProvider>
  );
}

export default App;
