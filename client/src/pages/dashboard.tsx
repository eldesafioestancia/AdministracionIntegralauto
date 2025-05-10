import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PieChart, Pie, Cell } from "recharts";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

// Mock data para el clima
const weatherData = {
  current: {
    temp: 24,
    condition: "Soleado",
    humidity: 65,
    wind: 15,
    icon: "ri-sun-fill",
  },
  forecast: [
    { day: "Hoy", temp: 24, tempMin: 18, icon: "ri-sun-fill", precipitation: 0 },
    { day: "Mañana", temp: 22, tempMin: 17, icon: "ri-cloudy-fill", precipitation: 20 },
    { day: "Miércoles", temp: 19, tempMin: 14, icon: "ri-cloudy-fill", precipitation: 60 },
    { day: "Jueves", temp: 18, tempMin: 12, icon: "ri-showers-fill", precipitation: 80 },
    { day: "Viernes", temp: 20, tempMin: 14, icon: "ri-cloudy-fill", precipitation: 30 },
  ]
};

export default function Dashboard() {
  const [dateRange, setDateRange] = useState("30days");
  const [activeTab, setActiveTab] = useState("overview");

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  // Consulta de datos para actividad reciente
  const { data: pastureWorks } = useQuery({
    queryKey: ["/api/pasture-works"],
  });

  const { data: maintenances } = useQuery({
    queryKey: ["/api/maintenance"],
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
    machineCount: 0,
    animalCount: 0,
    pastureCount: 0,
    monthlyIncome: 0,
    monthlyExpense: 0
  };

  // Calcular balance financiero
  const financialBalance = stats.monthlyIncome - stats.monthlyExpense;
  const isProfit = financialBalance >= 0;

  // Generar datos para gráficos
  const financialData = [
    { name: 'Ingresos', value: stats.monthlyIncome },
    { name: 'Gastos', value: stats.monthlyExpense },
  ];

  // Hacer una cuenta rápida de cuántos animales, maquinarias y parcelas existen
  const inventoryData = [
    { name: 'Animales', value: stats.animalCount },
    { name: 'Maquinarias', value: stats.machineCount },
    { name: 'Parcelas', value: stats.pastureCount },
  ];

  // Generar actividades recientes
  const getRecentActivities = () => {
    const activities = [];
    
    // Agregar mantenimientos recientes
    if (maintenances && Array.isArray(maintenances)) {
      maintenances.slice(0, 5).forEach((maintenance) => {
        activities.push({
          id: `m-${maintenance.id}`,
          type: 'maintenance',
          title: 'Mantenimiento',
          description: `${maintenance.type} para ${maintenance.machineId}`,
          date: new Date(maintenance.date),
          icon: 'ri-tools-fill',
          iconColor: 'text-yellow-500',
          link: `/machines/${maintenance.machineId}/maintenance`
        });
      });
    }
    
    // Agregar trabajos de parcelas recientes
    if (pastureWorks && Array.isArray(pastureWorks)) {
      pastureWorks.slice(0, 5).forEach((work) => {
        activities.push({
          id: `pw-${work.id}`,
          type: 'pasture',
          title: work.workType,
          description: `Parcela ID: ${work.pastureId}`,
          date: new Date(work.startDate),
          icon: 'ri-landscape-fill',
          iconColor: 'text-green-500',
          link: `/pastures`
        });
      });
    }
    
    // Ordenar por fecha, más reciente primero
    return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 7);
  };
  
  const recentActivities = getRecentActivities();

  // Colores para gráficos
  const COLORS = {
    income: '#10b981',
    expense: '#ef4444',
    animals: '#8b5cf6',
    machines: '#3b82f6',
    pastures: '#10b981',
    finance: ['#10b981', '#ef4444'],
    inventory: ['#8b5cf6', '#3b82f6', '#10b981'],
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-header font-bold text-neutral-600">Panel de Control</h1>
          <p className="text-neutral-500 text-sm">Gestión integral del establecimiento agropecuario</p>
        </div>
        <div className="mt-3 sm:mt-0 flex items-center space-x-3">
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
      
      {/* Main Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">
            <i className="ri-dashboard-line mr-1.5"></i> Vista General
          </TabsTrigger>
          <TabsTrigger value="production">
            <i className="ri-plant-line mr-1.5"></i> Producción
          </TabsTrigger>
          <TabsTrigger value="finances">
            <i className="ri-money-dollar-circle-line mr-1.5"></i> Finanzas
          </TabsTrigger>
          <TabsTrigger value="weather">
            <i className="ri-sun-line mr-1.5"></i> Clima
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <i className="ri-group-line mr-2 text-xl text-purple-500"></i> Inventario
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-purple-600">{stats.animalCount}</div>
                    <div className="text-sm text-gray-500">Animales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-blue-600">{stats.machineCount}</div>
                    <div className="text-sm text-gray-500">Maquinarias</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-green-600">{stats.pastureCount}</div>
                    <div className="text-sm text-gray-500">Parcelas</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full pt-4">
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={inventoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={50}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {inventoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS.inventory[index % COLORS.inventory.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Cantidad']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <i className="ri-money-dollar-circle-line mr-2 text-xl text-green-500"></i> Balance Financiero
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="text-3xl font-semibold mb-1 flex items-center">
                  ${financialBalance.toLocaleString()}
                  <span className={`ml-2 text-sm px-2 py-0.5 rounded ${isProfit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isProfit ? 'Ganancia' : 'Pérdida'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-sm text-gray-500">Ingresos</div>
                    <div className="text-xl font-semibold text-green-600">${stats.monthlyIncome.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Gastos</div>
                    <div className="text-xl font-semibold text-red-600">${stats.monthlyExpense.toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full pt-4">
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={financialData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Monto']} />
                      <Bar dataKey="value" name="Monto">
                        {financialData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS.finance[index % COLORS.finance.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <i className="ri-sun-fill mr-2 text-xl text-amber-500"></i> Clima Actual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <i className={`${weatherData.current.icon} text-5xl text-amber-500 mr-2`}></i>
                    <div className="text-4xl font-semibold">{weatherData.current.temp}°C</div>
                  </div>
                  <div className="text-lg mb-4">{weatherData.current.condition}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center justify-center">
                      <i className="ri-drop-fill text-blue-500 mr-1"></i>
                      <span>{weatherData.current.humidity}% Humedad</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <i className="ri-windy-fill text-gray-500 mr-1"></i>
                      <span>{weatherData.current.wind} km/h</span>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-5 gap-1 text-xs">
                  {weatherData.forecast.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="font-medium">{day.day}</div>
                      <i className={`${day.icon} text-lg text-amber-500`}></i>
                      <div className="font-semibold">{day.temp}°</div>
                      <div className="text-gray-500">{day.tempMin}°</div>
                      <div className="text-blue-500">{day.precipitation}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/weather">Ver Pronóstico Detallado</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Recent Activities + Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <i className="ri-history-line mr-2 text-blue-500"></i> Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[340px] pr-4">
                  {recentActivities.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className={`rounded-full p-2 ${activity.iconColor} bg-gray-100`}>
                            <i className={`${activity.icon} text-lg`}></i>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{activity.title}</h4>
                              <span className="text-xs text-gray-500">
                                {format(activity.date, 'dd MMM, HH:mm', { locale: es })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{activity.description}</p>
                          </div>
                          <Button asChild variant="ghost" size="icon" className="mt-1.5">
                            <Link href={activity.link}>
                              <i className="ri-arrow-right-line"></i>
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No hay actividades recientes para mostrar
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <i className="ri-apps-line mr-2 text-purple-500"></i> Acceso Rápido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" className="h-auto py-4 flex flex-col">
                    <Link href="/animals">
                      <i className="ri-bear-smile-line text-xl text-purple-500 mb-1.5"></i>
                      <span className="text-sm">Animales</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 flex flex-col">
                    <Link href="/machines">
                      <i className="ri-truck-line text-xl text-blue-500 mb-1.5"></i>
                      <span className="text-sm">Maquinarias</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 flex flex-col">
                    <Link href="/pastures">
                      <i className="ri-landscape-line text-xl text-green-500 mb-1.5"></i>
                      <span className="text-sm">Parcelas</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 flex flex-col">
                    <Link href="/finances">
                      <i className="ri-money-dollar-circle-line text-xl text-green-600 mb-1.5"></i>
                      <span className="text-sm">Finanzas</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 flex flex-col">
                    <Link href="/warehouse">
                      <i className="ri-store-2-line text-xl text-amber-500 mb-1.5"></i>
                      <span className="text-sm">Depósito</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 flex flex-col">
                    <Link href="/reports">
                      <i className="ri-file-chart-line text-xl text-gray-500 mb-1.5"></i>
                      <span className="text-sm">Reportes</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Maintenance Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <i className="ri-tools-fill mr-2 text-amber-500"></i> Estado de Mantenimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Máquina</TableHead>
                      <TableHead>Próximo Servicio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Progreso</TableHead>
                      <TableHead>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Tractor John Deere 6130M</TableCell>
                      <TableCell>Cambio de aceite</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendiente</Badge>
                      </TableCell>
                      <TableCell className="w-[180px]">
                        <div className="flex items-center gap-2">
                          <Progress value={75} className="h-2" />
                          <span className="text-xs">75%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="ghost" size="sm">
                          <Link href="/machines/1/maintenance">Ver</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Camión Ford F-350</TableCell>
                      <TableCell>Cambio de filtro</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Urgente</Badge>
                      </TableCell>
                      <TableCell className="w-[180px]">
                        <div className="flex items-center gap-2">
                          <Progress value={98} className="h-2" />
                          <span className="text-xs">98%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="ghost" size="sm">
                          <Link href="/machines/3/maintenance">Ver</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Topadora Caterpillar D6</TableCell>
                      <TableCell>Revisión general</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Programado</Badge>
                      </TableCell>
                      <TableCell className="w-[180px]">
                        <div className="flex items-center gap-2">
                          <Progress value={92} className="h-2" />
                          <span className="text-xs">92%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="ghost" size="sm">
                          <Link href="/machines/2/maintenance">Ver</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Production Tab */}
        <TabsContent value="production" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de la Producción</CardTitle>
              <CardDescription>
                Panel de control de operaciones productivas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-neutral-500">
                <div className="mb-3">
                  <i className="ri-plant-fill text-5xl text-green-500"></i>
                </div>
                <h3 className="text-lg font-semibold">Módulo en desarrollo</h3>
                <p className="max-w-md mx-auto mt-2">
                  Estamos trabajando en el análisis detallado de producción agrícola y ganadera.
                  Este panel incluirá indicadores de rendimiento, comparativas históricas y proyecciones.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Finances Tab */}
        <TabsContent value="finances" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión Financiera</CardTitle>
              <CardDescription>
                Panel de control de operaciones financieras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-neutral-500">
                <div className="mb-3">
                  <i className="ri-money-dollar-circle-fill text-5xl text-green-500"></i>
                </div>
                <h3 className="text-lg font-semibold">Módulo en desarrollo</h3>
                <p className="max-w-md mx-auto mt-2">
                  Estamos trabajando en la implementación de análisis financieros detallados, 
                  flujos de caja proyectados y comparativas entre períodos.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Weather Tab */}
        <TabsContent value="weather" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Climática</CardTitle>
              <CardDescription>
                Datos meteorológicos y pronósticos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-neutral-500">
                <div className="mb-3">
                  <i className="ri-cloudy-fill text-5xl text-blue-500"></i>
                </div>
                <h3 className="text-lg font-semibold">Módulo en desarrollo</h3>
                <p className="max-w-md mx-auto mt-2">
                  Estamos trabajando en la integración de datos climáticos históricos, 
                  pronósticos extendidos y alertas para condiciones críticas.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
