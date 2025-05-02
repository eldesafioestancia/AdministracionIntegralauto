import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import MachinesIndex from "@/pages/machines/index";
import MachineDetail from "@/pages/machines/[id]";
import MachineMaintenance from "@/pages/machines/maintenance";
import EditMaintenance from "@/pages/machines/maintenance/[id]";
import AppLayout from "@/components/layouts/AppLayout";

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Switch>
        {/* Ruta principal va directo al Dashboard */}
        <Route path="/">
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </Route>
        
        <Route path="/machines">
          <AppLayout>
            <MachinesIndex />
          </AppLayout>
        </Route>
        
        <Route path="/machines/:id">
          {(params) => (
            <AppLayout>
              <MachineDetail />
            </AppLayout>
          )}
        </Route>
        
        <Route path="/machines/:id/maintenance">
          {(params) => (
            <AppLayout>
              <MachineMaintenance />
            </AppLayout>
          )}
        </Route>
        
        <Route path="/machines/:machineId/maintenance/:id">
          {(params) => (
            <AppLayout>
              <EditMaintenance />
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
