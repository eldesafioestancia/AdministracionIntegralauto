import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PieChart, Pie, Cell } from "recharts";

// Componentes de Clima
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { PrecipitationHistory } from "@/components/weather/PrecipitationHistory";
import { AgriPlanningTool } from "@/components/weather/AgriPlanningTool";

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

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/dashboard", dateRange],
  });
  
  // Recargar los datos cuando cambia el periodo de tiempo
  const handleDateRangeChange = (newRange: string) => {
    setDateRange(newRange);
    // La consulta se actualizará automáticamente porque incluimos dateRange en queryKey
  };

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
            onValueChange={handleDateRangeChange}
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
          {/* Production Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <i className="ri-cow-line mr-2 text-xl text-purple-500"></i> Producción Ganadera
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-purple-50 rounded-md">
                      <div className="text-2xl font-semibold text-purple-600">{stats.animalCount}</div>
                      <div className="text-sm text-gray-500">Animales</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-md">
                      <div className="text-2xl font-semibold text-blue-600">23</div>
                      <div className="text-sm text-gray-500">Nacimientos</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-500">Distribución por categoría</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Vacas</span>
                        <span className="text-sm font-medium">142</span>
                      </div>
                      <Progress value={58} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Toros</span>
                        <span className="text-sm font-medium">18</span>
                      </div>
                      <Progress value={7} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Terneros</span>
                        <span className="text-sm font-medium">45</span>
                      </div>
                      <Progress value={18} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Novillos</span>
                        <span className="text-sm font-medium">41</span>
                      </div>
                      <Progress value={17} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full mt-1">
                  <Link href="/animals">
                    <i className="ri-arrow-right-line mr-1"></i> Gestionar animales
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <i className="ri-plant-line mr-2 text-xl text-green-500"></i> Producción Agrícola
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-md">
                      <div className="text-2xl font-semibold text-green-600">{stats.pastureCount}</div>
                      <div className="text-sm text-gray-500">Parcelas</div>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-md">
                      <div className="text-2xl font-semibold text-amber-600">438</div>
                      <div className="text-sm text-gray-500">Hectáreas</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-500">Distribución de cultivos</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Maíz</span>
                        <span className="text-sm font-medium">120 ha</span>
                      </div>
                      <Progress value={27} className="h-2 bg-amber-100">
                        <div className="h-full bg-amber-500" style={{ width: '27%' }} />
                      </Progress>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Soja</span>
                        <span className="text-sm font-medium">95 ha</span>
                      </div>
                      <Progress value={22} className="h-2 bg-green-100">
                        <div className="h-full bg-green-500" style={{ width: '22%' }} />
                      </Progress>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Alfalfa</span>
                        <span className="text-sm font-medium">78 ha</span>
                      </div>
                      <Progress value={18} className="h-2 bg-lime-100">
                        <div className="h-full bg-lime-500" style={{ width: '18%' }} />
                      </Progress>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Otros</span>
                        <span className="text-sm font-medium">145 ha</span>
                      </div>
                      <Progress value={33} className="h-2 bg-neutral-100">
                        <div className="h-full bg-neutral-500" style={{ width: '33%' }} />
                      </Progress>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full mt-1">
                  <Link href="/pastures">
                    <i className="ri-arrow-right-line mr-1"></i> Gestionar parcelas
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <i className="ri-line-chart-line mr-2 text-xl text-blue-500"></i> Rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-3 bg-blue-50 rounded-md">
                    <div className="text-2xl font-semibold text-blue-600">7,450 kg</div>
                    <div className="text-sm text-gray-500">Rendimiento promedio</div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-500">Rendimiento por cultivo</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Maíz</span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-1">9,200 kg/ha</span>
                          <i className="ri-arrow-up-fill text-green-500"></i>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Soja</span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-1">3,800 kg/ha</span>
                          <i className="ri-arrow-up-fill text-green-500"></i>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Alfalfa</span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-1">11,500 kg/ha</span>
                          <i className="ri-arrow-down-fill text-red-500"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-500">Ciclo actual</h4>
                    <Table>
                      <TableBody className="text-sm">
                        <TableRow>
                          <TableCell className="py-1.5">Fecha de siembra</TableCell>
                          <TableCell className="py-1.5 font-medium">15 Oct 2024</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="py-1.5">Fecha estimada de cosecha</TableCell>
                          <TableCell className="py-1.5 font-medium">20 Mar 2025</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Work Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <i className="ri-calendar-check-line mr-2 text-xl text-purple-500"></i> Actividades Agropecuarias Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastureWorks && pastureWorks.slice(0, 5).map((work, index) => (
                    <TableRow key={`work-${work.id}`}>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {work.workType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{work.description || '-'}</TableCell>
                      <TableCell>Parcela ID: {work.pastureId}</TableCell>
                      <TableCell>
                        {new Date(work.startDate).toLocaleDateString('es-AR', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })}
                      </TableCell>
                      <TableCell>{work.driver || 'No asignado'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {work.endDate ? 'Completado' : 'En progreso'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button asChild variant="outline">
                <Link href="/pastures">Ver todas las actividades</Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Machinery Utilization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <i className="ri-truck-line mr-2 text-xl text-blue-500"></i> Utilización de Maquinaria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-500">Tractor John Deere 6130M</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Utilización</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                  <div className="text-sm text-gray-500">Último servicio: 15/04/2025</div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-500">Cosechadora New Holland CR6.80</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Utilización</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  <div className="text-sm text-gray-500">Último servicio: 02/05/2025</div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-500">Camión Ford F-350</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Utilización</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                  <div className="text-sm text-gray-500">Último servicio: 28/03/2025</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button asChild variant="outline">
                <Link href="/machines">Ver todas las maquinarias</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Finances Tab */}
        <TabsContent value="finances" className="space-y-6">
          {/* Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <i className="ri-money-dollar-circle-line mr-2 text-xl text-green-500"></i> Resumen Financiero
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-md">
                      <div className="text-2xl font-semibold text-green-600">${stats.monthlyIncome.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Ingresos</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-md">
                      <div className="text-2xl font-semibold text-red-600">${stats.monthlyExpense.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Gastos</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-blue-50 rounded-md">
                    <div className="text-2xl font-semibold text-blue-600">
                      ${(stats.monthlyIncome - stats.monthlyExpense).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Balance</div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-500">Periodo actual</h4>
                    <div className="text-sm">
                      <span className="font-medium">1 de Mayo - 31 de Mayo, 2025</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full mt-1">
                  <Link href="/finances">
                    <i className="ri-arrow-right-line mr-1"></i> Ver todas las finanzas
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <i className="ri-pie-chart-line mr-2 text-xl text-purple-500"></i> Distribución de Ingresos
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="w-full pt-2">
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Animales', value: 45000 },
                          { name: 'Cultivos', value: 27000 },
                          { name: 'Servicios', value: 8000 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#8b5cf6" />
                        <Cell fill="#10b981" />
                        <Cell fill="#3b82f6" />
                      </Pie>
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Monto']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs text-center">
                  <div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-1"></div>
                    <div className="font-medium">Animales</div>
                    <div>$45,000</div>
                  </div>
                  <div>
                    <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                    <div className="font-medium">Cultivos</div>
                    <div>$27,000</div>
                  </div>
                  <div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
                    <div className="font-medium">Servicios</div>
                    <div>$8,000</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <i className="ri-pie-chart-line mr-2 text-xl text-red-500"></i> Distribución de Gastos
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="w-full pt-2">
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Sueldos', value: 18000 },
                          { name: 'Insumos', value: 12000 },
                          { name: 'Maquinaria', value: 7000 },
                          { name: 'Impuestos', value: 5350 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#ef4444" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#3b82f6" />
                        <Cell fill="#6b7280" />
                      </Pie>
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Monto']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-xs text-center">
                  <div>
                    <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
                    <div className="font-medium">Sueldos</div>
                    <div>$18,000</div>
                  </div>
                  <div>
                    <div className="w-3 h-3 bg-amber-500 rounded-full mx-auto mb-1"></div>
                    <div className="font-medium">Insumos</div>
                    <div>$12,000</div>
                  </div>
                  <div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
                    <div className="font-medium">Maquinaria</div>
                    <div>$7,000</div>
                  </div>
                  <div>
                    <div className="w-3 h-3 bg-gray-500 rounded-full mx-auto mb-1"></div>
                    <div className="font-medium">Impuestos</div>
                    <div>$5,350</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <i className="ri-exchange-line mr-2 text-xl text-blue-500"></i> Transacciones Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Tipo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Venta de terneros</TableCell>
                    <TableCell>Animales</TableCell>
                    <TableCell>15/05/2025</TableCell>
                    <TableCell className="font-medium text-green-600">$25,800</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Ingreso
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Compra de semillas</TableCell>
                    <TableCell>Pasturas</TableCell>
                    <TableCell>12/05/2025</TableCell>
                    <TableCell className="font-medium text-red-600">$4,560</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Gasto
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Sueldo Pincheira</TableCell>
                    <TableCell>Sueldos</TableCell>
                    <TableCell>10/05/2025</TableCell>
                    <TableCell className="font-medium text-red-600">$3,200</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Gasto
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Venta de rollos</TableCell>
                    <TableCell>Pasturas</TableCell>
                    <TableCell>05/05/2025</TableCell>
                    <TableCell className="font-medium text-green-600">$8,750</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Ingreso
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Mantenimiento tractor</TableCell>
                    <TableCell>Maquinaria</TableCell>
                    <TableCell>01/05/2025</TableCell>
                    <TableCell className="font-medium text-red-600">$2,450</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Gasto
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button asChild variant="outline">
                <Link href="/finances">Ver todas las transacciones</Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Financial Indicators */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <i className="ri-line-chart-line mr-2 text-xl text-purple-500"></i> Indicadores Financieros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="text-center p-3 bg-purple-50 rounded-md">
                    <div className="text-sm text-gray-500 mb-1">Margen de ganancia</div>
                    <div className="text-2xl font-semibold text-purple-600">38.4%</div>
                    <div className="flex items-center justify-center text-xs text-green-600 mt-1">
                      <i className="ri-arrow-up-line mr-1"></i> 2.1% vs mes anterior
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-500">Rentabilidad por área</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Ganadería</span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-1">42%</span>
                          <i className="ri-arrow-up-fill text-green-500"></i>
                        </div>
                      </div>
                      <Progress value={42} className="h-2 bg-purple-100">
                        <div className="h-full bg-purple-500" style={{ width: '42%' }} />
                      </Progress>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Agricultura</span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-1">36%</span>
                          <i className="ri-arrow-up-fill text-green-500"></i>
                        </div>
                      </div>
                      <Progress value={36} className="h-2 bg-green-100">
                        <div className="h-full bg-green-500" style={{ width: '36%' }} />
                      </Progress>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Servicios</span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-1">28%</span>
                          <i className="ri-arrow-down-fill text-red-500"></i>
                        </div>
                      </div>
                      <Progress value={28} className="h-2 bg-blue-100">
                        <div className="h-full bg-blue-500" style={{ width: '28%' }} />
                      </Progress>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center p-3 bg-blue-50 rounded-md">
                    <div className="text-sm text-gray-500 mb-1">ROI</div>
                    <div className="text-2xl font-semibold text-blue-600">24.7%</div>
                    <div className="flex items-center justify-center text-xs text-green-600 mt-1">
                      <i className="ri-arrow-up-line mr-1"></i> 1.3% vs año anterior
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-500">Inversiones activas</h4>
                    <Table>
                      <TableBody className="text-sm">
                        <TableRow>
                          <TableCell className="py-1.5">Maquinaria nueva</TableCell>
                          <TableCell className="py-1.5 font-medium">$120,000</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="py-1.5">Mejoras en pasturas</TableCell>
                          <TableCell className="py-1.5 font-medium">$45,000</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="py-1.5">Sistema de riego</TableCell>
                          <TableCell className="py-1.5 font-medium">$68,000</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center p-3 bg-green-50 rounded-md">
                    <div className="text-sm text-gray-500 mb-1">Flujo de caja mensual</div>
                    <div className="text-2xl font-semibold text-green-600">$33,430</div>
                    <div className="flex items-center justify-center text-xs text-green-600 mt-1">
                      <i className="ri-arrow-up-line mr-1"></i> 8.5% vs mes anterior
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-500">Proyección próximos 3 meses</h4>
                    <Table>
                      <TableBody className="text-sm">
                        <TableRow>
                          <TableCell className="py-1.5">Junio 2025</TableCell>
                          <TableCell className="py-1.5 font-medium text-green-600">$38,200</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="py-1.5">Julio 2025</TableCell>
                          <TableCell className="py-1.5 font-medium text-green-600">$41,500</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="py-1.5">Agosto 2025</TableCell>
                          <TableCell className="py-1.5 font-medium text-green-600">$36,800</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Weather Tab */}
        <TabsContent value="weather" className="space-y-6">
          {/* Climate Overview & Forecasts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weather Widget */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <i className="ri-sun-fill mr-2 text-xl text-amber-500"></i> Clima Actual y Pronóstico
                </CardTitle>
                <CardDescription>
                  Condiciones actuales y previsión a corto plazo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="pt-2">
                  <WeatherWidget />
                </div>
              </CardContent>
            </Card>
            
            {/* Agricultural Planning Tool */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <i className="ri-plant-line mr-2 text-xl text-green-500"></i> Planificación Agrícola
                </CardTitle>
                <CardDescription>
                  Recomendaciones basadas en clima y fenología de cultivos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="pt-2">
                  <AgriPlanningTool />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Historical Precipitation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <i className="ri-water-flash-line mr-2 text-xl text-blue-500"></i> Histórico de Precipitaciones
              </CardTitle>
              <CardDescription>
                Datos de precipitaciones históricas y tendencias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="pt-2">
                <PrecipitationHistory location={{
                  lat: -38.7183,
                  lon: -62.2661,
                  name: "Bahía Blanca"
                }} />
              </div>
            </CardContent>
          </Card>
          
          {/* Crop Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <i className="ri-alert-line mr-2 text-xl text-red-500"></i> Evaluación de Riesgos para Cultivos
              </CardTitle>
              <CardDescription>
                Análisis de riesgos meteorológicos para la producción agrícola
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-700 mb-1">Riesgo Actual</h3>
                    <div className="text-3xl font-bold text-green-600">Bajo</div>
                    <p className="text-sm text-green-600 mt-1">Condiciones favorables para operaciones agrícolas</p>
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-medium mb-2">Temperatura</h3>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "70%" }}></div>
                      </div>
                      <span className="ml-2">24°C</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Rango óptimo: 18°C - 28°C</p>
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-medium mb-2">Humedad</h3>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "65%" }}></div>
                      </div>
                      <span className="ml-2">65%</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Rango óptimo: 50% - 75%</p>
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-4">
                  <h3 className="font-semibold">Riesgos a considerar</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="font-medium text-yellow-800 flex items-center">
                        <i className="ri-alert-line mr-1"></i> Ligero aumento de temperatura previsto
                      </div>
                      <p className="text-sm text-yellow-700">Se espera un incremento de 3-4°C en los próximos 2 días. Considere aumentar el riego en cultivos sensibles.</p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="font-medium text-blue-800 flex items-center">
                        <i className="ri-drop-line mr-1"></i> Probabilidad de precipitaciones
                      </div>
                      <p className="text-sm text-blue-700">40% de probabilidad de lluvias ligeras en las próximas 48 horas. Planifique actividades de campo acordemente.</p>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="font-medium text-green-800 flex items-center">
                        <i className="ri-windy-line mr-1"></i> Condiciones de viento favorables
                      </div>
                      <p className="text-sm text-green-700">Vientos suaves (8-12 km/h) previstos. Condiciones adecuadas para aplicación de agroquímicos.</p>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold mt-4">Recomendaciones</h3>
                  <ul className="space-y-1">
                    <li className="flex items-start">
                      <i className="ri-check-line text-green-600 mt-0.5 mr-1.5"></i>
                      <span className="text-sm">Aproveche las próximas 24 horas para aplicaciones de producto si es necesario</span>
                    </li>
                    <li className="flex items-start">
                      <i className="ri-check-line text-green-600 mt-0.5 mr-1.5"></i>
                      <span className="text-sm">Monitore cultivos sensibles ante el incremento de temperatura previsto</span>
                    </li>
                    <li className="flex items-start">
                      <i className="ri-check-line text-green-600 mt-0.5 mr-1.5"></i>
                      <span className="text-sm">Preparar equipos de riego como precaución ante posible estrés hídrico</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Weather Alerts and Warnings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <i className="ri-notification-4-line mr-2 text-xl text-orange-500"></i> Alertas Meteorológicas
              </CardTitle>
              <CardDescription>
                Avisos y alertas para condiciones climáticas significativas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las alertas</SelectItem>
                      <SelectItem value="severe">Alertas graves</SelectItem>
                      <SelectItem value="warning">Advertencias</SelectItem>
                      <SelectItem value="watch">Vigilancia</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm" className="flex items-center">
                    <i className="ri-notification-badge-line mr-1.5"></i>
                    Configurar notificaciones
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Alerta</TableHead>
                      <TableHead>Área afectada</TableHead>
                      <TableHead>Periodo</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Advertencia
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">Temperaturas elevadas</TableCell>
                      <TableCell>Región norte</TableCell>
                      <TableCell>12 May - 14 May</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Activa
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Vigilancia
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">Posibles precipitaciones</TableCell>
                      <TableCell>Región centro-este</TableCell>
                      <TableCell>15 May - 16 May</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Pendiente
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          Informativa
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">Vientos moderados</TableCell>
                      <TableCell>Toda la región</TableCell>
                      <TableCell>12 May - 13 May</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          Finalizada
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
