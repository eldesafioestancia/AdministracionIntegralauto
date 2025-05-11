import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { DatePicker } from "@/components/ui/date-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Definir el tipo para máquinas
interface Machine {
  id: number;
  brand: string;
  model: string;
  type: string;
  year: number;
  [key: string]: any; // Para otras propiedades que pueda tener una máquina
}

// Definición de tipos
interface FinanceEntry {
  id: number;
  type: string;
  category: string;
  subcategory: string;
  date: string;
  description: string;
  amount: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

// Tipos de maquinaria disponibles (mismos que en la sección Maquinarias)
const machineTypes = [
  { value: "tractor", label: "Tractor" },
  { value: "topadora", label: "Topadora" },
  { value: "camion", label: "Camión" },
  { value: "vehiculo", label: "Vehículo" },
  { value: "accesorio", label: "Accesorio" }
];

// Schema para el formulario
const financeFormSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, { message: "La categoría es requerida" }),
  // Para categorías que no sean maquinarias
  subcategory: z.string().optional(),
  // Campos específicos para maquinarias
  machineType: z.string().optional(),
  machineId: z.string().optional(),
  // Campos comunes
  date: z.string().min(1, { message: "La fecha es requerida" }),
  description: z.string().min(1, { message: "La descripción es requerida" }),
  amount: z.string().min(1, { message: "El monto es requerido" }),
  paymentMethod: z.string().min(1, { message: "El método de pago es requerido" }),
  status: z.string().optional(),
});

export default function FinancesPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [location] = useLocation();
  const [selectedMachineType, setSelectedMachineType] = useState<string>("");
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>([]);
  
  // Función para analizar parámetros de consulta (query params)
  const parseQueryParams = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return {
        openForm: params.get('openForm') === 'true',
        type: params.get('type') as "income" | "expense" | null,
        category: params.get('category'),
        subcategory: params.get('subcategory'),
        description: params.get('description'),
        machineType: params.get('machineType'),
        machineId: params.get('machineId'),
      };
    }
    return {
      openForm: false,
      type: null,
      category: null,
      subcategory: null,
      description: null,
      machineType: null,
      machineId: null,
    };
  };

  // Consultas para obtener datos
  const { data: financeData = [], isLoading } = useQuery({
    queryKey: ["/api/finances"],
    queryFn: async () => {
      // Mientras no tengamos una API real, usamos datos simulados
      return [
        {
          id: 1,
          type: "income",
          category: "Ventas",
          subcategory: "Ganado",
          date: "2025-05-01",
          description: "Venta de 5 novillos",
          amount: "350000",
          paymentMethod: "Transferencia",
          status: "completed",
          createdAt: "2025-05-01T10:00:00.000Z",
        },
        {
          id: 2,
          type: "expense",
          category: "Insumos",
          subcategory: "Semillas",
          date: "2025-05-03",
          description: "Compra de semillas para maíz",
          amount: "120000",
          paymentMethod: "Efectivo",
          status: "completed",
          createdAt: "2025-05-03T14:30:00.000Z",
        },
        {
          id: 3,
          type: "income",
          category: "Servicios",
          subcategory: "Arrendamiento",
          date: "2025-05-05",
          description: "Alquiler de campo para pastoreo",
          amount: "180000",
          paymentMethod: "Transferencia",
          status: "pending",
          createdAt: "2025-05-05T09:15:00.000Z",
        },
        {
          id: 4,
          type: "expense",
          category: "Operaciones",
          subcategory: "Combustible",
          date: "2025-05-06",
          description: "Diesel para tractores",
          amount: "85000",
          paymentMethod: "Tarjeta de crédito",
          status: "completed",
          createdAt: "2025-05-06T16:45:00.000Z",
        },
      ] as FinanceEntry[];
    },
  });
  
  // Consulta para obtener las máquinas disponibles
  const { data: machines = [] } = useQuery({
    queryKey: ["/api/machines"],
  });

  // Calcular sumarios
  const totalIncome = financeData
    .filter(item => item.type === "income")
    .reduce((sum, item) => sum + parseInt(item.amount), 0);
  
  const totalExpense = financeData
    .filter(item => item.type === "expense")
    .reduce((sum, item) => sum + parseInt(item.amount), 0);
  
  const balance = totalIncome - totalExpense;

  // Categorizaciones
  const categorizedExpenses = financeData
    .filter(item => item.type === "expense")
    .reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = 0;
      }
      acc[item.category] += parseInt(item.amount);
      return acc;
    }, {} as Record<string, number>);

  const categorizedIncome = financeData
    .filter(item => item.type === "income")
    .reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = 0;
      }
      acc[item.category] += parseInt(item.amount);
      return acc;
    }, {} as Record<string, number>);

  // Configuración del formulario
  const form = useForm<z.infer<typeof financeFormSchema>>({
    resolver: zodResolver(financeFormSchema),
    defaultValues: {
      type: "income",
      category: "",
      subcategory: "",
      date: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
      description: "",
      amount: "",
      paymentMethod: "Efectivo",
      status: "completed",
    },
  });

  // Categorías disponibles para el formulario (unificadas como en el menú lateral)
  const allCategories = [
    { value: "maquinarias", label: "Maquinarias" },
    { value: "animales", label: "Animales" },
    { value: "pasturas", label: "Pasturas" },
    { value: "deposito", label: "Depósito" },
    { value: "inversiones", label: "Inversiones" },
    { value: "servicios", label: "Servicios" },
    { value: "impuestos", label: "Impuestos" },
    { value: "reparaciones", label: "Reparaciones" },
    { value: "sueldos", label: "Sueldos" },
    { value: "capital", label: "Capital" },
  ];

  // Usamos las mismas categorías tanto para ingresos como para gastos
  const incomeCategories = allCategories;
  const expenseCategories = allCategories;

  // Subcategorías según la categoría seleccionada
  const subcategories: Record<string, { value: string; label: string }[]> = {
    // Categorías comunes para todos los tipos de operaciones
    maquinarias: [
      { value: "venta", label: "Venta de maquinaria" },
      { value: "compra", label: "Compra de maquinaria" },
      { value: "alquiler", label: "Alquiler de maquinaria" },
      { value: "servicio", label: "Servicio prestado" },
      { value: "mantenimiento", label: "Mantenimiento" },
      { value: "combustible", label: "Combustible" },
    ],
    animales: [
      { value: "venta_ganado", label: "Venta de ganado" },
      { value: "compra_ganado", label: "Compra de ganado" },
      { value: "productos_animales", label: "Productos animales" },
      { value: "servicio_reproduccion", label: "Servicio de reproducción" },
      { value: "veterinario", label: "Servicios veterinarios" },
      { value: "alimento", label: "Alimento animal" },
    ],
    pasturas: [
      { value: "venta_granos", label: "Venta de granos" },
      { value: "venta_forraje", label: "Venta de forraje" },
      { value: "compra_semillas", label: "Compra de semillas" },
      { value: "fertilizantes", label: "Fertilizantes" },
      { value: "herbicidas", label: "Herbicidas" },
      { value: "siembra", label: "Siembra" },
      { value: "cosecha", label: "Cosecha" },
      { value: "pastoreo", label: "Arrendamiento para pastoreo" },
    ],
    deposito: [
      { value: "venta_insumos", label: "Venta de insumos" },
      { value: "compra_insumos", label: "Compra de insumos" },
      { value: "alquiler_deposito", label: "Alquiler de depósito" },
      { value: "mantenimiento", label: "Mantenimiento" },
    ],
    inversiones: [
      { value: "retorno_inversion", label: "Retorno de inversión" },
      { value: "nueva_inversion", label: "Nueva inversión" },
      { value: "dividendos", label: "Dividendos" },
      { value: "venta_activos", label: "Venta de activos" },
    ],
    servicios: [
      { value: "veterinario", label: "Servicios veterinarios" },
      { value: "asesoria_tecnica", label: "Asesoría técnica" },
      { value: "contratistas", label: "Contratistas" },
      { value: "legal", label: "Servicios legales" },
      { value: "seguros", label: "Seguros" },
    ],
    impuestos: [
      { value: "ganancias", label: "Ganancias" },
      { value: "iva", label: "IVA" },
      { value: "inmobiliario", label: "Inmobiliario" },
      { value: "municipal", label: "Tasas municipales" },
      { value: "retencion", label: "Retenciones" },
    ],
    reparaciones: [
      { value: "maquinarias", label: "Reparación de maquinarias" },
      { value: "instalaciones", label: "Reparación de instalaciones" },
      { value: "infraestructura", label: "Reparación de infraestructura" },
      { value: "repuestos", label: "Compra de repuestos" },
    ],
    sueldos: [
      { value: "permanentes", label: "Empleados permanentes" },
      { value: "temporales", label: "Empleados temporales" },
      { value: "contratistas", label: "Contratistas" },
      { value: "aguinaldo", label: "Aguinaldo" },
      { value: "vacaciones", label: "Vacaciones" },
    ],
    capital: [
      { value: "aporte_juan_carlos", label: "Aporte - Juan Carlos" },
      { value: "aporte_juan_alberto", label: "Aporte - Juan Alberto" },
      { value: "aporte_nacho", label: "Aporte - Nacho" },
      { value: "retiro_juan_carlos", label: "Retiro - Juan Carlos" },
      { value: "retiro_juan_alberto", label: "Retiro - Juan Alberto" },
      { value: "retiro_nacho", label: "Retiro - Nacho" },
    ],
  };

  // Métodos de pago disponibles
  const paymentMethods = [
    { value: "efectivo", label: "Efectivo" },
    { value: "transferencia", label: "Transferencia bancaria" },
    { value: "cheque", label: "Cheque" },
    { value: "tarjeta_credito", label: "Tarjeta de crédito" },
    { value: "tarjeta_debito", label: "Tarjeta de débito" },
  ];

  const onSubmit = async (data: z.infer<typeof financeFormSchema>) => {
    try {
      // Simulación de creación de finanza (eventualmente se conectará con la API real)
      toast({
        title: "Registro financiero agregado",
        description: "El registro se ha agregado correctamente.",
      });
      
      // Cerrar el formulario y resetear
      setIsAddSheetOpen(false);
      form.reset();
      
      // Para cuando tengamos API real:
      // const response = await apiRequest("/api/finances", {
      //   method: "POST",
      //   data,
      // });
      //
      // await queryClient.invalidateQueries({ queryKey: ["/api/finances"] });
      
    } catch (error) {
      console.error("Error al crear registro financiero:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo agregar el registro financiero.",
      });
    }
  };

  const handleTypeChange = (type: string) => {
    form.setValue("type", type as "income" | "expense");
    form.setValue("category", "");
    form.setValue("subcategory", "");
    form.setValue("machineType", ""); // Limpiar también el tipo de maquinaria
  };

  const handleCategoryChange = (category: string) => {
    form.setValue("category", category);
    
    // Limpiar campos específicos según la categoría seleccionada
    if (category === "maquinarias") {
      // Si selecciona maquinarias, limpiamos subcategoría ya que no se mostrará
      form.setValue("subcategory", "");
      form.setValue("machineType", "");
      form.setValue("machineId", "");
      setSelectedMachineType("");
      setFilteredMachines([]);
    } else {
      // Si selecciona otra categoría, limpiamos los campos específicos de maquinarias
      form.setValue("machineType", "");
      form.setValue("machineId", "");
      setSelectedMachineType("");
      setFilteredMachines([]);
    }
  };
  
  // Función para manejar el cambio de tipo de maquinaria
  const handleMachineTypeChange = (type: string) => {
    form.setValue("machineType", type);
    form.setValue("machineId", ""); // Resetear la máquina seleccionada
    setSelectedMachineType(type);
    
    // Filtrar máquinas por el tipo seleccionado
    if (machines && Array.isArray(machines) && machines.length > 0) {
      const filtered = machines.filter((machine: any) => machine.type === type);
      setFilteredMachines(filtered);
    }
  };

  // Efecto para detectar parámetros y autocompletar el formulario
  useEffect(() => {
    const params = parseQueryParams();
    
    // Si se solicita abrir el formulario desde la URL
    if (params.openForm) {
      // Establecer tipo (ingreso/gasto)
      if (params.type) {
        form.setValue("type", params.type);
      }
      
      // Establecer categoría si existe
      if (params.category) {
        form.setValue("category", params.category);
        
        // Si la categoría es maquinarias y existe el tipo de máquina
        if (params.category === "maquinarias" && params.machineType) {
          // Establecer tipo de máquina
          form.setValue("machineType", params.machineType);
          setSelectedMachineType(params.machineType);
          
          // Filtrar máquinas por tipo
          if (machines && Array.isArray(machines) && machines.length > 0) {
            const filtered = machines.filter((machine: any) => machine.type === params.machineType);
            setFilteredMachines(filtered);
            
            // Si existe un ID de máquina específico, seleccionarlo
            if (params.machineId) {
              form.setValue("machineId", params.machineId);
            }
          }
        }
      }
      
      // Establecer subcategoría si existe y la categoría está establecida
      if (params.subcategory && params.category && params.category !== "maquinarias") {
        form.setValue("subcategory", params.subcategory);
      }
      
      // Establecer descripción si existe
      if (params.description) {
        form.setValue("description", params.description);
      }
      
      // Establecer pestaña activa según el tipo
      if (params.type === "expense") {
        setActiveTab("expenses");
      } else if (params.type === "income") {
        setActiveTab("income");
      }
      
      // Abrir el formulario
      setIsAddSheetOpen(true);
    }
  }, [form, location, machines]); // Se ejecuta cuando cambia la URL o están disponibles las máquinas

  // Funciones para formatear moneda y fechas
  const formatCurrency = (amount: number | string) => {
    const value = typeof amount === 'string' ? parseInt(amount) : amount;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Finanzas</h1>
        <p className="text-muted-foreground">
          Gestiona y analiza los registros financieros de tu operación agropecuaria.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="w-full md:w-3/4 space-y-4">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 md:w-[600px]">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="income">Ingresos</TabsTrigger>
              <TabsTrigger value="expenses">Gastos</TabsTrigger>
              <TabsTrigger value="transactions">Transacciones</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Balance General</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(balance)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalIncome)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(totalExpense)}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Ingresos por Categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.entries(categorizedIncome).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(categorizedIncome).map(([category, amount]) => (
                          <div key={category} className="flex justify-between items-center">
                            <div className="font-medium">{category}</div>
                            <div className="text-green-600">{formatCurrency(amount)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">No hay datos de ingresos disponibles</div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Gastos por Categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.entries(categorizedExpenses).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(categorizedExpenses).map(([category, amount]) => (
                          <div key={category} className="flex justify-between items-center">
                            <div className="font-medium">{category}</div>
                            <div className="text-red-600">{formatCurrency(amount)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">No hay datos de gastos disponibles</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="income">
              <Card>
                <CardHeader>
                  <CardTitle>Ingresos</CardTitle>
                  <CardDescription>Todos los ingresos registrados en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead>Método de Pago</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {financeData.filter(item => item.type === "income").map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{formatDate(item.date)}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{item.paymentMethod}</TableCell>
                            <TableCell className="text-right font-medium text-green-600">
                              {formatCurrency(item.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="expenses">
              <Card>
                <CardHeader>
                  <CardTitle>Gastos</CardTitle>
                  <CardDescription>Todos los gastos registrados en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead>Método de Pago</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {financeData.filter(item => item.type === "expense").map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{formatDate(item.date)}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{item.paymentMethod}</TableCell>
                            <TableCell className="text-right font-medium text-red-600">
                              {formatCurrency(item.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Todas las Transacciones</CardTitle>
                  <CardDescription>Registro completo de transacciones financieras</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead>Método de Pago</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {financeData.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{formatDate(item.date)}</TableCell>
                            <TableCell>{item.type === "income" ? "Ingreso" : "Gasto"}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{item.paymentMethod}</TableCell>
                            <TableCell className={`text-right font-medium ${item.type === "income" ? "text-green-600" : "text-red-600"}`}>
                              {formatCurrency(item.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-full md:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => {
                  form.reset({
                    type: "income",
                    category: "",
                    subcategory: "",
                    date: new Date().toISOString().split('T')[0],
                    description: "",
                    amount: "",
                    paymentMethod: "Efectivo",
                    status: "completed",
                  });
                  setIsAddSheetOpen(true);
                }}
                className="w-full"
              >
                Nuevo Registro
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Sheet para agregar nuevo registro financiero */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Agregar Registro Financiero</SheetTitle>
            <SheetDescription>
              Ingresa los detalles del movimiento financiero
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Selector de tipo (ingreso/gasto) */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  className={`${form.watch("type") === "income" ? "bg-green-600 hover:bg-green-700" : "bg-secondary text-primary"}`}
                  onClick={() => handleTypeChange("income")}
                >
                  Ingreso
                </Button>
                <Button
                  type="button"
                  className={`${form.watch("type") === "expense" ? "bg-red-600 hover:bg-red-700" : "bg-secondary text-primary"}`}
                  onClick={() => handleTypeChange("expense")}
                >
                  Gasto
                </Button>
              </div>
              
              {/* Campos del formulario */}
              <div className="space-y-4">
                {/* Categoría */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select onValueChange={(value) => handleCategoryChange(value)} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(form.watch("type") === "income" ? incomeCategories : expenseCategories).map(
                            (category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* El campo de subcategoría ha sido completamente eliminado */}
                
                {/* Campo para el tipo de maquinaria - solo aparece cuando la categoría es "maquinarias" */}
                {form.watch("category") === "maquinarias" && (
                  <>
                    <FormField
                      control={form.control}
                      name="machineType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Maquinaria</FormLabel>
                          <Select onValueChange={(value) => handleMachineTypeChange(value)} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el tipo de maquinaria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {machineTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Campo para seleccionar la máquina específica - aparece solo cuando se seleccionó un tipo */}
                    {selectedMachineType && (
                      <FormField
                        control={form.control}
                        name="machineId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Máquina</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona la máquina" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {filteredMachines.map((machine) => (
                                  <SelectItem key={machine.id} value={machine.id.toString()}>
                                    {`${machine.brand} ${machine.model} (${machine.year})`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                )}
                
                {/* Fecha */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Descripción */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Input placeholder="Describe el movimiento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Monto */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto (ARS)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Método de pago */}
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de pago</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el método de pago" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" className="w-full">
                Guardar Registro
              </Button>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  );
}