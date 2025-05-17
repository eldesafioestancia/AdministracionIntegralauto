import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import NotificationInitializer from "@/components/notifications/NotificationInitializer";
import Dashboard from "@/pages/dashboard";
import MachinesIndex from "@/pages/machines/index";
import MachineDetail from "@/pages/machines/[id]";
import MachineMaintenance from "@/pages/machines/maintenance";
import EditMaintenance from "@/pages/machines/maintenance/[id]";
import MachineWork from "@/pages/machines/[id]/work";
import EditMachineWork from "@/pages/machines/[id]/work/edit/[workId]";
import AnimalsIndex from "@/pages/animals/index";
import AnimalDetail from "@/pages/animals/[id]";
import AnimalEdit from "@/pages/animals/[id]/edit";
import AnimalWeight from "@/pages/animals/[id]/weight";
import AnimalVeterinary from "@/pages/animals/[id]/veterinary";
import AnimalReproduction from "@/pages/animals/[id]/reproduction";
import AnimalFinances from "@/pages/animals/[id]/finances";
import InvestmentsIndex from "./pages/investments/index";
import PasturesIndex from "@/pages/pastures/index";
import Services from "@/pages/services";
import Taxes from "@/pages/taxes";
import Repairs from "@/pages/repairs";
import Employees from "@/pages/employees/index";
import Salaries from "@/pages/salaries";
import Capital from "@/pages/capital";
import Finances from "./pages/finances";
import Warehouse from "@/pages/warehouse/index";
import Weather from "@/pages/weather";
import Reports from "@/pages/reports/index";
import Settings from "@/pages/settings/index";
import NotificationsSettings from "@/pages/settings/notifications";
import AppLayout from "@/components/layouts/AppLayout";

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <NotificationInitializer />
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
        
        <Route path="/machines/:id/work">
          {(params) => (
            <AppLayout>
              <MachineWork />
            </AppLayout>
          )}
        </Route>
        
        <Route path="/machines/:id/work/edit/:workId">
          {(params) => (
            <AppLayout>
              <EditMachineWork />
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
        
        {/* Rutas para inversiones */}
        <Route path="/investments">
          <AppLayout>
            <InvestmentsIndex />
          </AppLayout>
        </Route>
        
        {/* Rutas para pasturas */}
        <Route path="/pastures">
          <AppLayout>
            <PasturesIndex />
          </AppLayout>
        </Route>
        
        {/* Ruta para depósito */}
        <Route path="/warehouse">
          <AppLayout>
            <Warehouse />
          </AppLayout>
        </Route>
        
        {/* Ruta para clima */}
        <Route path="/weather">
          <AppLayout>
            <Weather />
          </AppLayout>
        </Route>
        
        {/* Rutas para servicios */}
        <Route path="/services">
          <AppLayout>
            <Services />
          </AppLayout>
        </Route>
        
        {/* Rutas para impuestos */}
        <Route path="/taxes">
          <AppLayout>
            <Taxes />
          </AppLayout>
        </Route>
        
        {/* Rutas para reparaciones */}
        <Route path="/repairs">
          <AppLayout>
            <Repairs />
          </AppLayout>
        </Route>
        
        {/* Rutas para empleados */}
        <Route path="/employees">
          <AppLayout>
            <Employees />
          </AppLayout>
        </Route>
        
        {/* Rutas para salarios */}
        <Route path="/salaries">
          <AppLayout>
            <Salaries />
          </AppLayout>
        </Route>
        
        {/* Rutas para capital */}
        <Route path="/capital">
          <AppLayout>
            <Capital />
          </AppLayout>
        </Route>
        
        {/* Rutas para finanzas */}
        <Route path="/finances">
          <AppLayout>
            <Finances />
          </AppLayout>
        </Route>
        
        {/* Ruta para reportes */}
        <Route path="/reports">
          <AppLayout>
            <Reports />
          </AppLayout>
        </Route>
        
        {/* Rutas para configuración */}
        <Route path="/settings">
          <AppLayout>
            <Settings />
          </AppLayout>
        </Route>
        
        <Route path="/settings/notifications">
          <AppLayout>
            <NotificationsSettings />
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