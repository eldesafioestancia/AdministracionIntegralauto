import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";

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

// Schema para el formulario
const financeFormSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, { message: "La categoría es requerida" }),
  subcategory: z.string().min(1, { message: "La subcategoría es requerida" }),
  date: z.date(),
  description: z.string().min(1, { message: "La descripción es requerida" }),
  amount: z.string().min(1, { message: "El monto es requerido" }),
  paymentMethod: z.string().min(1, { message: "El método de pago es requerido" }),
  status: z.string().optional(),
});

export default function FinancesPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

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
      description: "",
      amount: "",
      paymentMethod: "Efectivo",
      status: "completed",
    },
  });

  // Categorías disponibles para el formulario
  const incomeCategories = [
    { value: "ventas", label: "Ventas" },
    { value: "servicios", label: "Servicios" },
    { value: "subsidios", label: "Subsidios" },
    { value: "otros", label: "Otros" },
  ];

  const expenseCategories = [
    { value: "insumos", label: "Insumos" },
    { value: "operaciones", label: "Operaciones" },
    { value: "servicios", label: "Servicios contratados" },
    { value: "impuestos", label: "Impuestos" },
    { value: "salarios", label: "Salarios" },
    { value: "otros", label: "Otros" },
  ];

  // Subcategorías según la categoría seleccionada
  const subcategories: Record<string, { value: string; label: string }[]> = {
    ventas: [
      { value: "ganado", label: "Ganado" },
      { value: "granos", label: "Granos" },
      { value: "otros_productos", label: "Otros productos" },
    ],
    servicios: [
      { value: "arrendamiento", label: "Arrendamiento" },
      { value: "maquinaria", label: "Servicio de maquinaria" },
    ],
    subsidios: [
      { value: "gubernamentales", label: "Gubernamentales" },
      { value: "provinciales", label: "Provinciales" },
    ],
    insumos: [
      { value: "semillas", label: "Semillas" },
      { value: "fertilizantes", label: "Fertilizantes" },
      { value: "herbicidas", label: "Herbicidas" },
      { value: "alimento_animal", label: "Alimento animal" },
    ],
    operaciones: [
      { value: "combustible", label: "Combustible" },
      { value: "reparaciones", label: "Reparaciones" },
      { value: "mantenimiento", label: "Mantenimiento" },
    ],
    impuestos: [
      { value: "ganancias", label: "Ganancias" },
      { value: "iva", label: "IVA" },
      { value: "inmobiliario", label: "Inmobiliario" },
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
  };

  const handleCategoryChange = (category: string) => {
    form.setValue("category", category);
    form.setValue("subcategory", "");
  };

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
        <h1 className="text-3xl font-bold">Gestión de Finanzas</h1>
        <p className="text-muted-foreground">
          Administra los ingresos, gastos y realiza un seguimiento de las finanzas de la explotación agropecuaria
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="income">Ingresos</TabsTrigger>
            <TabsTrigger value="expenses">Gastos</TabsTrigger>
            <TabsTrigger value="all">Todos los movimientos</TabsTrigger>
          </TabsList>

          <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M12 5v14"></path>
                  <path d="M5 12h14"></path>
                </svg>
                Nuevo registro
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Nuevo registro financiero</SheetTitle>
                <SheetDescription>
                  Ingresa los detalles del nuevo movimiento financiero.
                </SheetDescription>
              </SheetHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={form.watch("type") === "income" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => handleTypeChange("income")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="m18 15-6-6-6 6"></path>
                      </svg>
                      Ingreso
                    </Button>

                    <Button
                      type="button"
                      variant={form.watch("type") === "expense" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => handleTypeChange("expense")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="m6 9 6 6 6-6"></path>
                      </svg>
                      Gasto
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select onValueChange={handleCategoryChange} value={field.value}>
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

                  {form.watch("category") && (
                    <FormField
                      control={form.control}
                      name="subcategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subcategoría</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una subcategoría" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(subcategories[form.watch("category")] || []).map((subcategory) => (
                                <SelectItem key={subcategory.value} value={subcategory.value}>
                                  {subcategory.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha</FormLabel>
                        <DatePicker
                          date={field.value}
                          setDate={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingresa una descripción" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Ingresa el monto"
                            {...field}
                            onChange={(e) => {
                              // Solo permitir números
                              const value = e.target.value.replace(/[^0-9]/g, "");
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de pago</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un método de pago" />
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

                  <Button type="submit" className="w-full">Guardar registro</Button>
                </form>
              </Form>
            </SheetContent>
          </Sheet>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className={`${balance >= 0 ? 'border-green-100' : 'border-red-100'}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Balance</CardTitle>
                <CardDescription>Diferencia entre ingresos y egresos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(balance)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Ingresos</CardTitle>
                <CardDescription>Total de ingresos registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalIncome)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Gastos</CardTitle>
                <CardDescription>Total de gastos registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalExpense)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ingresos por categoría</CardTitle>
                <CardDescription>Distribución de ingresos según categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(categorizedIncome).map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span>{category}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gastos por categoría</CardTitle>
                <CardDescription>Distribución de gastos según categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(categorizedExpenses).map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <span>{category}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Últimos movimientos</CardTitle>
              <CardDescription>Movimientos financieros recientes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financeData.slice(0, 5).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{formatDate(item.date)}</TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          item.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.type === 'income' ? 'Ingreso' : 'Gasto'}
                        </span>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className={`text-right font-medium ${
                        item.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos</CardTitle>
              <CardDescription>Listado de ingresos registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Subcategoría</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Método de pago</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financeData
                    .filter(item => item.type === 'income')
                    .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{formatDate(item.date)}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.subcategory}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.paymentMethod}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gastos</CardTitle>
              <CardDescription>Listado de gastos registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Subcategoría</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Método de pago</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financeData
                    .filter(item => item.type === 'expense')
                    .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{formatDate(item.date)}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.subcategory}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.paymentMethod}</TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Todos los movimientos</CardTitle>
              <CardDescription>Listado completo de ingresos y gastos</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Método de pago</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financeData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{formatDate(item.date)}</TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          item.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.type === 'income' ? 'Ingreso' : 'Gasto'}
                        </span>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.paymentMethod}</TableCell>
                      <TableCell className={`text-right font-medium ${
                        item.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}