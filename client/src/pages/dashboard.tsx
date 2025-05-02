import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import SummaryCard from "@/components/dashboard/SummaryCard";
import MaintenanceList from "@/components/dashboard/MaintenanceList";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import FarmOverview from "@/components/dashboard/FarmOverview";
import TransactionList from "@/components/dashboard/TransactionList";
import MachineUsage from "@/components/dashboard/MachineUsage";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState("30days");

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return <div className="py-10 text-center">Cargando información del dashboard...</div>;
  }

  if (error || !data) {
    return (
      <div className="py-10 text-center">
        <div className="text-destructive mb-2">Error al cargar el dashboard</div>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  // Format dashboard data
  const stats = data.stats || {
    machineCount: 12,
    animalCount: 243,
    monthlyIncome: 75980,
    monthlyExpense: 42350
  };

  // Mock maintenances for example (would come from API)
  const maintenances = [
    {
      id: 1,
      machineId: 1,
      machineName: "Tractor John Deere 6130M",
      type: "oil_change",
      description: "Cambio de aceite",
      daysRemaining: 2,
      status: "warning" as const
    },
    {
      id: 2,
      machineId: 3,
      machineName: "Camión Ford F-350",
      type: "filter_change",
      description: "Cambio de filtro",
      daysRemaining: 0,
      status: "error" as const
    },
    {
      id: 3,
      machineId: 2,
      machineName: "Topadora Caterpillar D6",
      type: "general_check",
      description: "Revisión general",
      daysRemaining: 7,
      status: "info" as const
    }
  ];

  // Recent activities
  const activities = [
    {
      id: 1,
      type: "salary",
      user: "Juan García",
      description: "<span class='font-medium'>Juan García</span> registró un pago de sueldo a <span class='font-medium'>Pincheira</span>",
      time: "Hace 2 horas"
    },
    {
      id: 2,
      type: "animal",
      user: "María Rodríguez",
      description: "<span class='font-medium'>María Rodríguez</span> registró 8 nuevos terneros",
      time: "Ayer, 15:30"
    },
    {
      id: 3,
      type: "repair",
      user: "Carlos López",
      description: "<span class='font-medium'>Carlos López</span> reportó una reparación en el tractor",
      time: "Hace 2 días"
    }
  ];

  // Farm overview stats
  const farmStats = {
    livestock: 243,
    pastures: 158,
    machinery: 12,
    investments: 245800
  };

  // Transactions
  const transactions = [
    {
      id: 1,
      concept: "Venta de terneros",
      type: "income" as const,
      category: "Animales",
      date: new Date(2023, 3, 15),
      amount: 25800
    },
    {
      id: 2,
      concept: "Compra de semillas",
      type: "expense" as const,
      category: "Pasturas",
      date: new Date(2023, 3, 12),
      amount: 4560
    },
    {
      id: 3,
      concept: "Sueldo Pincheira",
      type: "expense" as const,
      category: "Sueldos",
      date: new Date(2023, 3, 10),
      amount: 3200
    },
    {
      id: 4,
      concept: "Venta de rollos",
      type: "income" as const,
      category: "Pasturas",
      date: new Date(2023, 3, 5),
      amount: 8750
    }
  ];

  // Machine usage
  const machines = [
    {
      id: 1,
      name: "Tractor John Deere 6130M",
      image: "https://images.unsplash.com/photo-1593613128698-1a5de600051a?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80",
      hours: 1245,
      nextService: 1500,
      percentage: 75,
      status: "normal" as const
    },
    {
      id: 2,
      name: "Topadora Caterpillar D6",
      image: "https://images.unsplash.com/photo-1613046561926-371d5403d504?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80",
      hours: 2890,
      nextService: 3000,
      percentage: 92,
      status: "warning" as const
    },
    {
      id: 3,
      name: "Camión Ford F-350",
      image: "https://images.unsplash.com/photo-1626078427472-7811789ed2dc?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80",
      hours: 85600,
      nextService: 85000,
      percentage: 98,
      status: "critical" as const
    }
  ];

  return (
    <div id="dashboard-page">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-header font-bold text-neutral-500">Dashboard</h1>
          <p className="text-neutral-400 text-sm">Resumen de la actividad de su establecimiento</p>
        </div>
        <div className="mt-3 sm:mt-0 flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center text-sm"
          >
            <i className="ri-download-line mr-1.5"></i>
            Exportar
          </Button>
          
          <Select 
            defaultValue={dateRange} 
            onValueChange={setDateRange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Últimos 30 días</SelectItem>
              <SelectItem value="thisMonth">Este mes</SelectItem>
              <SelectItem value="quarter">Últimos 3 meses</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard 
          title="Maquinarias"
          value={stats.machineCount}
          icon={<i className="ri-truck-line text-xl text-primary"></i>}
          color="primary"
          change={{ value: 8.3, type: "increase" }}
        />
        
        <SummaryCard 
          title="Animales"
          value={stats.animalCount}
          icon={<i className="ri-bear-smile-line text-xl text-secondary"></i>}
          color="secondary"
          change={{ value: 12.7, type: "increase" }}
        />
        
        <SummaryCard 
          title="Ingresos (mes)"
          value={`$${stats.monthlyIncome.toLocaleString()}`}
          icon={<i className="ri-money-dollar-circle-line text-xl text-success"></i>}
          color="success"
          change={{ value: 3.2, type: "decrease" }}
        />
        
        <SummaryCard 
          title="Gastos (mes)"
          value={`$${stats.monthlyExpense.toLocaleString()}`}
          icon={<i className="ri-funds-line text-xl text-error"></i>}
          color="error"
          change={{ value: 6.1, type: "decrease" }}
        />
      </div>
      
      {/* Featured Section with Images */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <MaintenanceList maintenances={maintenances} />
        <ActivityFeed activities={activities} />
        <FarmOverview stats={farmStats} />
      </div>
      
      {/* Recent Transactions + Machine Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TransactionList transactions={transactions} />
        <MachineUsage machines={machines} />
      </div>
    </div>
  );
}
