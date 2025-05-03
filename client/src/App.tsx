import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import MachinesIndex from "@/pages/machines/index";
import MachineDetail from "@/pages/machines/[id]";
import MachineMaintenance from "@/pages/machines/maintenance";
import EditMaintenance from "@/pages/machines/maintenance/[id]";
import AnimalsIndex from "@/pages/animals/index";
import AnimalDetail from "@/pages/animals/[id]";
import AnimalEdit from "@/pages/animals/[id]/edit";
import AnimalWeight from "@/pages/animals/[id]/weight";
import AnimalVeterinary from "@/pages/animals/[id]/veterinary";
import AnimalReproduction from "@/pages/animals/[id]/reproduction";
import AnimalFinances from "@/pages/animals/[id]/finances";
import FinancialIndex from "./pages/financial/index";
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
        
        {/* Rutas para animales */}
        <Route path="/animals">
          <AppLayout>
            <AnimalsIndex />
          </AppLayout>
        </Route>
        
        <Route path="/animals/:id">
          {(params) => (
            <AppLayout>
              <AnimalDetail />
            </AppLayout>
          )}
        </Route>
        
        <Route path="/animals/:id/edit">
          {(params) => (
            <AppLayout>
              <AnimalEdit />
            </AppLayout>
          )}
        </Route>
        
        <Route path="/animals/:id/weight">
          {(params) => (
            <AppLayout>
              <AnimalWeight />
            </AppLayout>
          )}
        </Route>
        
        <Route path="/animals/:id/veterinary">
          {(params) => (
            <AppLayout>
              <AnimalVeterinary />
            </AppLayout>
          )}
        </Route>
        
        <Route path="/animals/:id/reproduction">
          {(params) => (
            <AppLayout>
              <AnimalReproduction />
            </AppLayout>
          )}
        </Route>
        
        <Route path="/animals/:id/finances">
          {(params) => (
            <AppLayout>
              <AnimalFinances />
            </AppLayout>
          )}
        </Route>
        
        {/* Rutas para gestión financiera */}
        <Route path="/financial">
          <AppLayout>
            <FinancialIndex />
          </AppLayout>
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
