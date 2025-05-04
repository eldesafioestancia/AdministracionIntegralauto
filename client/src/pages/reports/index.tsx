import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Datos de ejemplo para los gráficos - en producción, estos datos vendrían de la API
const mockFinancialData = [
  { name: "Ene", ingresos: 40000, gastos: 24000 },
  { name: "Feb", ingresos: 30000, gastos: 13980 },
  { name: "Mar", ingresos: 27000, gastos: 18000 },
  { name: "Abr", ingresos: 18900, gastos: 23900 },
  { name: "May", ingresos: 23900, gastos: 34900 },
  { name: "Jun", ingresos: 34000, gastos: 25000 },
];

const mockAnimalData = [
  { name: "Vacas", cantidad: 78 },
  { name: "Toros", cantidad: 12 },
  { name: "Vaquillonas", cantidad: 25 },
  { name: "Terneros", cantidad: 35 },
  { name: "Novillos", cantidad: 45 },
];

const mockPastureData = [
  { name: "Alfalfa", hectareas: 120 },
  { name: "Trigo", hectareas: 80 },
  { name: "Maíz", hectareas: 60 },
  { name: "Natural", hectareas: 180 },
  { name: "Avena", hectareas: 40 },
];

const mockMachineryUsage = [
  { name: "Tractor John Deere", horas: 234 },
  { name: "Cosechadora", horas: 120 },
  { name: "Sembradora", horas: 80 },
  { name: "Fumigadora", horas: 60 },
  { name: "Rastra", horas: 45 },
];

const mockEmployeePerformance = [
  { name: "Juan", produccion: 95, puntualidad: 80, calidad: 90 },
  { name: "Pedro", produccion: 85, puntualidad: 90, calidad: 85 },
  { name: "María", produccion: 90, puntualidad: 85, calidad: 95 },
  { name: "Carlos", produccion: 80, puntualidad: 95, calidad: 80 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Reports() {
  const [period, setPeriod] = useState("this-month");
  const [reportType, setReportType] = useState("financial");
  const { toast } = useToast();

  // Aquí deberíamos tener una consulta de API real para obtener los datos según los filtros
  // const { data, isLoading } = useQuery({
  //   queryKey: ['/api/reports', reportType, period],
  //   enabled: !!reportType && !!period,
  // });
  
  // Simulando datos para la demostración
  const isLoading = false;
  const error = null;

  // Función para generar el informe en PDF (se implementaría con una biblioteca como jsPDF)
  const generatePDF = () => {
    toast({
      title: "Generando informe",
      description: "El informe se está generando y estará disponible en breve.",
    });
    // Aquí iría la lógica para generar el PDF
  };

  // Función para exportar datos a Excel (se implementaría con una biblioteca como xlsx)
  const exportToExcel = () => {
    toast({
      title: "Exportando datos",
      description: "Los datos se están exportando a Excel.",
    });
    // Aquí iría la lógica para exportar a Excel
  };

  if (isLoading) {
    return <div className="py-10 text-center">Cargando informes...</div>;
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <div className="text-destructive mb-2">Error al cargar los informes</div>
        <Button 
          variant="outline" 
          onClick={() => {}}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-header font-bold text-neutral-500">Reportes y Análisis</h1>
          <p className="text-neutral-400 text-sm">Visualice y analice datos clave para la toma de decisiones</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="sm:w-48">
          <label className="text-sm text-neutral-500 mb-1 block">Período</label>
          <Select 
            value={period} 
            onValueChange={setPeriod}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-week">Esta semana</SelectItem>
              <SelectItem value="this-month">Este mes</SelectItem>
              <SelectItem value="last-month">Mes anterior</SelectItem>
              <SelectItem value="last-quarter">Último trimestre</SelectItem>
              <SelectItem value="this-year">Este año</SelectItem>
              <SelectItem value="last-year">Año anterior</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="sm:w-48">
          <label className="text-sm text-neutral-500 mb-1 block">Tipo de Reporte</label>
          <Select 
            value={reportType} 
            onValueChange={setReportType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="financial">Financiero</SelectItem>
              <SelectItem value="animals">Animales</SelectItem>
              <SelectItem value="pastures">Pasturas</SelectItem>
              <SelectItem value="machinery">Maquinaria</SelectItem>
              <SelectItem value="employees">Empleados</SelectItem>
              <SelectItem value="inventory">Inventario</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button 
            variant="outline" 
            onClick={generatePDF}
            className="flex items-center"
          >
            <i className="ri-file-pdf-line mr-1"></i>
            PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={exportToExcel}
            className="flex items-center"
          >
            <i className="ri-file-excel-line mr-1"></i>
            Excel
          </Button>
        </div>
      </div>

      {/* Contenido de reportes por tipo */}
      <Tabs value={reportType} onValueChange={setReportType} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="financial">Financiero</TabsTrigger>
          <TabsTrigger value="animals">Animales</TabsTrigger>
          <TabsTrigger value="pastures">Pasturas</TabsTrigger>
          <TabsTrigger value="machinery">Maquinaria</TabsTrigger>
          <TabsTrigger value="employees">Empleados</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
        </TabsList>

        {/* Reporte financiero */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Ingresos totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$173,800</div>
                <p className="text-xs text-green-500 flex items-center">
                  <i className="ri-arrow-up-line mr-1"></i>
                  12% vs mes anterior
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Gastos totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$139,780</div>
                <p className="text-xs text-red-500 flex items-center">
                  <i className="ri-arrow-up-line mr-1"></i>
                  8% vs mes anterior
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Ganancia neta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$34,020</div>
                <p className="text-xs text-green-500 flex items-center">
                  <i className="ri-arrow-up-line mr-1"></i>
                  5% vs mes anterior
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ingresos vs Gastos (6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockFinancialData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ingresos" fill="#82ca9d" name="Ingresos" />
                    <Bar dataKey="gastos" fill="#8884d8" name="Gastos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Principales fuentes de ingresos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Venta animales', value: 45 },
                          { name: 'Venta granos', value: 30 },
                          { name: 'Servicios', value: 15 },
                          { name: 'Otros', value: 10 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Venta animales', value: 45 },
                          { name: 'Venta granos', value: 30 },
                          { name: 'Servicios', value: 15 },
                          { name: 'Otros', value: 10 },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Principales gastos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Insumos', value: 35 },
                          { name: 'Salarios', value: 25 },
                          { name: 'Maquinaria', value: 20 },
                          { name: 'Impuestos', value: 15 },
                          { name: 'Otros', value: 5 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Insumos', value: 35 },
                          { name: 'Salarios', value: 25 },
                          { name: 'Maquinaria', value: 20 },
                          { name: 'Impuestos', value: 15 },
                          { name: 'Otros', value: 5 },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reporte de animales */}
        <TabsContent value="animals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total animales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">195</div>
                <p className="text-xs text-green-500 flex items-center">
                  <i className="ri-arrow-up-line mr-1"></i>
                  5% vs mes anterior
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Nacimientos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-green-500 flex items-center">
                  <i className="ri-arrow-up-line mr-1"></i>
                  2 más que mes anterior
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Ganancia/pérdida</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+8</div>
                <p className="text-xs text-neutral-500 flex items-center">
                  Compras: 2, Ventas: 6, Muertes: 0
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribución por categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockAnimalData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cantidad" fill="#8884d8" name="Cantidad" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Indicadores reproductivos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Preñadas', value: 42 },
                          { name: 'Vacías', value: 8 },
                          { name: 'En servicio', value: 25 },
                          { name: 'Descarte', value: 3 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Preñadas', value: 42 },
                          { name: 'Vacías', value: 8 },
                          { name: 'En servicio', value: 25 },
                          { name: 'Descarte', value: 3 },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evolución del peso (kg)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { mes: 'Ene', peso: 380 },
                        { mes: 'Feb', peso: 390 },
                        { mes: 'Mar', peso: 400 },
                        { mes: 'Abr', peso: 410 },
                        { mes: 'May', peso: 420 },
                        { mes: 'Jun', peso: 430 },
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="peso"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        name="Peso promedio"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reporte de pasturas */}
        <TabsContent value="pastures" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Hectáreas totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">480</div>
                <p className="text-xs text-neutral-500">5 parcelas activas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2 t/ha</div>
                <p className="text-xs text-green-500 flex items-center">
                  <i className="ri-arrow-up-line mr-1"></i>
                  0.3 t/ha vs temporada anterior
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Eficiencia hídrica</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">86%</div>
                <p className="text-xs text-green-500 flex items-center">
                  <i className="ri-arrow-up-line mr-1"></i>
                  4% vs temporada anterior
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribución de pasturas por tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockPastureData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hectareas" fill="#82ca9d" name="Hectáreas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Producción de rollos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { mes: 'Ene', cantidad: 0 },
                        { mes: 'Feb', cantidad: 0 },
                        { mes: 'Mar', cantidad: 120 },
                        { mes: 'Abr', cantidad: 80 },
                        { mes: 'May', cantidad: 40 },
                        { mes: 'Jun', cantidad: 0 },
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="cantidad"
                        stroke="#82ca9d"
                        activeDot={{ r: 8 }}
                        name="Rollos producidos"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado de las parcelas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Productivas', value: 65 },
                          { name: 'En descanso', value: 20 },
                          { name: 'En preparación', value: 10 },
                          { name: 'En recuperación', value: 5 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Productivas', value: 65 },
                          { name: 'En descanso', value: 20 },
                          { name: 'En preparación', value: 10 },
                          { name: 'En recuperación', value: 5 },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reporte de maquinaria */}
        <TabsContent value="machinery" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total máquinas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-neutral-500">3 en mantenimiento</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Horas operativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">539</div>
                <p className="text-xs text-green-500 flex items-center">
                  <i className="ri-arrow-up-line mr-1"></i>
                  12% vs mes anterior
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Costo/Hora</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1,250</div>
                <p className="text-xs text-red-500 flex items-center">
                  <i className="ri-arrow-up-line mr-1"></i>
                  5% vs mes anterior
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Uso de maquinaria (horas)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockMachineryUsage}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="horas" fill="#8884d8" name="Horas de uso" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Gastos de mantenimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { mes: 'Ene', costo: 15000 },
                        { mes: 'Feb', costo: 8000 },
                        { mes: 'Mar', costo: 12000 },
                        { mes: 'Abr', costo: 5000 },
                        { mes: 'May', costo: 20000 },
                        { mes: 'Jun', costo: 7000 },
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Costo']} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="costo"
                        stroke="#ff7300"
                        activeDot={{ r: 8 }}
                        name="Costo de mantenimiento"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Consumo de combustible</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { mes: 'Ene', litros: 1800 },
                        { mes: 'Feb', litros: 1200 },
                        { mes: 'Mar', litros: 2000 },
                        { mes: 'Abr', litros: 1500 },
                        { mes: 'May', litros: 2400 },
                        { mes: 'Jun', litros: 1900 },
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} L`, 'Consumo']} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="litros"
                        stroke="#82ca9d"
                        activeDot={{ r: 8 }}
                        name="Litros consumidos"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reporte de empleados */}
        <TabsContent value="employees" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total empleados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-neutral-500">2 permanentes, 4 temporales</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Horas trabajadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">960</div>
                <p className="text-xs text-green-500 flex items-center">
                  <i className="ri-arrow-up-line mr-1"></i>
                  5% vs mes anterior
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Costo mensual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$85,000</div>
                <p className="text-xs text-neutral-500 flex items-center">
                  +15% salarios, +5% cargas sociales
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Desempeño de empleados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockEmployeePerformance}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="produccion" fill="#8884d8" name="Producción" />
                    <Bar dataKey="puntualidad" fill="#82ca9d" name="Puntualidad" />
                    <Bar dataKey="calidad" fill="#ffc658" name="Calidad" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de pagos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { mes: 'Ene', pago: 80000 },
                        { mes: 'Feb', pago: 82000 },
                        { mes: 'Mar', pago: 82000 },
                        { mes: 'Abr', pago: 85000 },
                        { mes: 'May', pago: 85000 },
                        { mes: 'Jun', pago: 85000 },
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Pago']} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="pago"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        name="Pagos mensuales"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de tareas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Ganadería', value: 40 },
                          { name: 'Agricultura', value: 30 },
                          { name: 'Mantenimiento', value: 15 },
                          { name: 'Administración', value: 10 },
                          { name: 'Otros', value: 5 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Ganadería', value: 40 },
                          { name: 'Agricultura', value: 30 },
                          { name: 'Mantenimiento', value: 15 },
                          { name: 'Administración', value: 10 },
                          { name: 'Otros', value: 5 },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reporte de inventario */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Valor total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$235,600</div>
                <p className="text-xs text-green-500 flex items-center">
                  <i className="ri-arrow-up-line mr-1"></i>
                  8% vs mes anterior
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">52</div>
                <p className="text-xs text-amber-500 flex items-center">
                  <i className="ri-alert-line mr-1"></i>
                  3 bajo stock mínimo
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Rotación mensual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12%</div>
                <p className="text-xs text-green-500 flex items-center">
                  <i className="ri-arrow-up-line mr-1"></i>
                  2% vs mes anterior
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Valoración de inventario por categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Insumos', valor: 120000 },
                      { name: 'Repuestos', valor: 65000 },
                      { name: 'Herramientas', valor: 25000 },
                      { name: 'Forrajes', valor: 15000 },
                      { name: 'Otros', valor: 10600 },
                    ]}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Valor']} />
                    <Legend />
                    <Bar dataKey="valor" fill="#8884d8" name="Valor en inventario" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Productos críticos (bajo stock)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="font-medium">Aceite hidráulico</span>
                    <span className="text-red-500">2 litros (mín: 10)</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Filtros de aire</span>
                    <span className="text-red-500">1 unidad (mín: 5)</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Hilo para rollos</span>
                    <span className="text-amber-500">3 rollos (mín: 5)</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Maíz</span>
                    <span className="text-amber-500">150 kg (mín: 200)</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Grasa multiuso</span>
                    <span className="text-amber-500">2 kg (mín: 5)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Fluidos', value: 35 },
                          { name: 'Repuestos', value: 25 },
                          { name: 'Forrajes', value: 15 },
                          { name: 'Insumos', value: 20 },
                          { name: 'Otros', value: 5 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Fluidos', value: 35 },
                          { name: 'Repuestos', value: 25 },
                          { name: 'Forrajes', value: 15 },
                          { name: 'Insumos', value: 20 },
                          { name: 'Otros', value: 5 },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}