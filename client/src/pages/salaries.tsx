import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Esquema para el formulario de salarios
const salaryFormSchema = z.object({
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  employeeId: z.string({
    required_error: "El empleado es requerido",
  }).min(1, {
    message: "El empleado es requerido"
  }),
  concept: z.string({
    required_error: "El concepto es requerido",
  }).min(1, {
    message: "El concepto es requerido"
  }),
  amount: z.string({
    required_error: "El monto es requerido",
  }).min(1, {
    message: "El monto es requerido"
  }),
  paymentType: z.string().default("salary"),
  notes: z.string().optional(),
});

type SalaryFormValues = z.infer<typeof salaryFormSchema>;

export default function Salaries() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // Consultar los salarios
  const { data: salaries, isLoading: isLoadingSalaries } = useQuery({
    queryKey: ["/api/salaries"],
  });

  // Consultar los empleados
  const { data: employees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["/api/employees"],
  });

  const form = useForm<SalaryFormValues>({
    resolver: zodResolver(salaryFormSchema),
    defaultValues: {
      date: new Date(),
      employeeId: "",
      concept: "",
      amount: "",
      paymentType: "salary",
      notes: "",
    },
  });

  // Opciones para tipos de pago
  const paymentTypes = [
    { value: "salary", label: "Salario" },
    { value: "bonus", label: "Bono" },
    { value: "advance", label: "Adelanto" },
    { value: "other", label: "Otro" },
  ];

  async function onSubmit(values: SalaryFormValues) {
    try {
      await apiRequest("POST", "/api/salaries", values);

      // Invalidar consulta de salarios
      queryClient.invalidateQueries({ queryKey: ["/api/salaries"] });
      
      toast({
        title: "Pago registrado",
        description: "El pago de salario ha sido registrado exitosamente",
      });
      
      setSheetOpen(false);
      form.reset();
      
    } catch (error) {
      console.error("Error creating salary payment:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el pago de salario",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(salaryId: number) {
    if (!confirm("¿Está seguro de eliminar este registro de salario?")) return;
    
    try {
      await apiRequest("DELETE", `/api/salaries/${salaryId}`, {});
      
      // Invalidar consulta de salarios
      queryClient.invalidateQueries({ queryKey: ["/api/salaries"] });
      
      toast({
        title: "Registro eliminado",
        description: "El registro de salario ha sido eliminado exitosamente",
      });
      
    } catch (error) {
      console.error("Error deleting salary:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro de salario",
        variant: "destructive",
      });
    }
  }

  // Obtener empleado por ID
  const getEmployeeById = (id: string | number) => {
    if (!employees || !Array.isArray(employees)) return null;
    return employees.find((emp: any) => emp.id.toString() === id.toString());
  };

  // Filtrar salarios según la pestaña activa
  const filteredSalaries = salaries && Array.isArray(salaries)
    ? salaries.filter((salary: any) => {
        if (activeTab === "all") return true;
        return salary.paymentType === activeTab;
      })
    : [];

  // Calcular total de salarios
  const totalSalaries = salaries && Array.isArray(salaries)
    ? salaries.reduce((acc: number, salary: any) => {
        return acc + parseFloat(salary.amount);
      }, 0)
    : 0;

  // Calcular totales por tipo
  const salariesByType = salaries && Array.isArray(salaries)
    ? salaries.reduce((acc: any, salary: any) => {
        if (!acc[salary.paymentType]) {
          acc[salary.paymentType] = 0;
        }
        acc[salary.paymentType] += parseFloat(salary.amount);
        return acc;
      }, {})
    : {};

  // Obtener etiqueta para tipo de pago
  const getPaymentTypeLabel = (type: string) => {
    const paymentType = paymentTypes.find(pt => pt.value === type);
    return paymentType ? paymentType.label : type;
  };

  if (isLoadingSalaries || isLoadingEmployees) {
    return <div className="py-10 text-center">Cargando datos...</div>;
  }

  // Lista de empleados activos para el selector
  const activeEmployees = employees && Array.isArray(employees)
    ? employees.filter((emp: any) => emp.status === 'active')
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-header font-bold text-neutral-500">Salarios</h1>
          <p className="text-neutral-400 text-sm">
            Gestiona los pagos de salarios a empleados
          </p>
        </div>
        
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button className="mt-2 sm:mt-0">
              <i className="ri-add-line mr-1"></i> Nuevo pago
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Registrar pago de salario</SheetTitle>
              <SheetDescription>
                Complete los datos del pago
              </SheetDescription>
            </SheetHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field}
                          value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : null;
                            field.onChange(date);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empleado</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un empleado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {activeEmployees.length === 0 ? (
                            <SelectItem value="no-employees" disabled>
                              No hay empleados activos
                            </SelectItem>
                          ) : (
                            activeEmployees.map((employee: any) => (
                              <SelectItem key={employee.id} value={employee.id.toString()}>
                                {employee.name} - {employee.position}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="paymentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de pago</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentTypes.map(type => (
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
                
                <FormField
                  control={form.control}
                  name="concept"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concepto</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Concepto del pago"
                          {...field}
                        />
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
                      <FormLabel>Monto ($)</FormLabel>
                      <FormControl>
                        <Input placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Notas adicionales"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <SheetFooter>
                  <Button type="submit">Guardar pago</Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Resumen de salarios */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-blue-600">
              ${totalSalaries.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pagos por tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(salariesByType).map(([type, amount]) => (
                <div key={type} className="flex flex-col items-center bg-gray-50 p-2 rounded-md">
                  <span className="text-sm text-neutral-600">{getPaymentTypeLabel(type)}</span>
                  <span className="font-semibold text-neutral-800">
                    ${parseFloat(amount as string).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filtros por tipo de pago */}
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          {paymentTypes.map(type => (
            <TabsTrigger key={type.value} value={type.value}>
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-4">
          {filteredSalaries.length === 0 ? (
            <div className="text-center py-10 text-neutral-400">
              No hay registros de pagos para mostrar
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSalaries.map((salary: any) => {
                const employee = getEmployeeById(salary.employeeId);
                return (
                  <Card key={salary.id} className="overflow-hidden">
                    <div className="flex items-center p-4">
                      <div className="flex-1">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <h3 className="font-medium text-neutral-800">
                              {employee ? employee.name : `Empleado ID ${salary.employeeId}`}
                            </h3>
                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              {getPaymentTypeLabel(salary.paymentType)}
                            </span>
                          </div>
                          <div className="text-sm text-neutral-500 flex flex-wrap items-center gap-3">
                            <span className="flex items-center">
                              <i className="ri-calendar-line mr-1"></i>
                              {format(new Date(salary.date), "dd/MM/yyyy")}
                            </span>
                            <span className="flex items-center">
                              <i className="ri-file-list-line mr-1"></i>
                              {salary.concept}
                            </span>
                            {employee && (
                              <span className="flex items-center">
                                <i className="ri-briefcase-line mr-1"></i>
                                {employee.position}
                              </span>
                            )}
                            {salary.notes && (
                              <span className="flex items-center">
                                <i className="ri-sticky-note-line mr-1"></i>
                                {salary.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="pr-5 mr-3 border-r border-neutral-200">
                        <span className="text-lg font-semibold text-blue-600">
                          ${parseFloat(salary.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1 pr-3">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(salary.id)}
                        >
                          <i className="ri-delete-bin-line text-lg"></i>
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}