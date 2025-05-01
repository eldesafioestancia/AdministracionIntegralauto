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
  // Simplemente renderizamos el componente directamente sin verificar autenticación
  return <Component {...rest} />;
}

function App() {
  // Ya no necesitamos verificar autenticación
  return (
    <TooltipProvider>
      <Toaster />
      <Switch>
        {/* La ruta de login ya no es necesaria, pero la dejamos por si acaso */}
        <Route path="/login">
          {/* Redireccionamos automáticamente al dashboard */}
          {() => {
            window.location.href = "/";
            return null;
          }}
        </Route>
        
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
