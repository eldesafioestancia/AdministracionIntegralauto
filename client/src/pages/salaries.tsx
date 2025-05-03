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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Esquema para añadir/editar empleados
const employeeFormSchema = z.object({
  name: z.string({
    required_error: "El nombre es requerido",
  }).min(1, {
    message: "El nombre es requerido"
  }),
  position: z.string().optional(),
  fixedSalary: z.string({
    required_error: "El sueldo fijo es requerido",
  }).min(1, {
    message: "El sueldo fijo es requerido"
  }),
  active: z.boolean().default(true),
});

// Esquema para registrar pagos de salarios
const salaryPaymentSchema = z.object({
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  employeeId: z.string({
    required_error: "El empleado es requerido",
  }),
  salaryType: z.string({
    required_error: "El tipo de sueldo es requerido",
  }),
  amount: z.string({
    required_error: "El monto es requerido",
  }).min(1, {
    message: "El monto es requerido"
  }),
  description: z.string().optional(),
  period: z.string().optional(),
});

// Tipos inferidos para los formularios
type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
type SalaryPaymentValues = z.infer<typeof salaryPaymentSchema>;

export default function Salaries() {
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("employees");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const { toast } = useToast();

  // Consultas para empleados y pagos de sueldos
  const { data: employees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["/api/employees"],
  });

  const { data: salaries, isLoading: isLoadingSalaries } = useQuery({
    queryKey: ["/api/salaries"],
  });

  // Formulario para empleados
  const employeeForm = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      position: "",
      fixedSalary: "0",
      active: true,
    },
  });

  // Formulario para pagos de sueldos
  const salaryPaymentForm = useForm<SalaryPaymentValues>({
    resolver: zodResolver(salaryPaymentSchema),
    defaultValues: {
      date: new Date(),
      employeeId: "",
      salaryType: "fixed",
      amount: "",
      description: "",
      period: "",
    },
  });

  // Reset y configuración de formularios
  const resetEmployeeForm = () => {
    employeeForm.reset({
      name: "",
      position: "",
      fixedSalary: "0",
      active: true,
    });
    setSelectedEmployee(null);
  };

  const editEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    employeeForm.reset({
      name: employee.name,
      position: employee.position || "",
      fixedSalary: employee.fixedSalary.toString(),
      active: employee.active,
    });
    setEmployeeDialogOpen(true);
  };

  const setupSalaryPayment = (employeeId: string, employeeName: string) => {
    const employee = employees?.find((e: any) => e.id === parseInt(employeeId));
    const fixedAmount = employee?.fixedSalary || "0";
    
    salaryPaymentForm.reset({
      date: new Date(),
      employeeId: employeeId,
      salaryType: "fixed", 
      amount: fixedAmount.toString(),
      description: "",
      period: `${format(new Date(), "MMMM yyyy")}`,
    });
    
    setPaymentSheetOpen(true);
  };

  // Funciones para enviar formularios
  async function onSubmitEmployee(values: EmployeeFormValues) {
    try {
      if (selectedEmployee) {
        // Actualizar empleado existente
        await apiRequest("PUT", `/api/employees/${selectedEmployee.id}`, values);
        toast({
          title: "Empleado actualizado",
          description: "Los datos del empleado han sido actualizados exitosamente",
        });
      } else {
        // Crear nuevo empleado
        await apiRequest("POST", "/api/employees", values);
        toast({
          title: "Empleado registrado",
          description: "El empleado ha sido registrado exitosamente",
        });
      }
      
      // Invalidar consulta de empleados
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      
      setEmployeeDialogOpen(false);
      resetEmployeeForm();
      
    } catch (error) {
      console.error("Error saving employee:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar los datos del empleado",
        variant: "destructive",
      });
    }
  }

  async function onSubmitSalaryPayment(values: SalaryPaymentValues) {
    try {
      // Obtener nombre del empleado para referencia
      const employee = employees?.find((e: any) => e.id === parseInt(values.employeeId));
      if (!employee) {
        throw new Error("Empleado no encontrado");
      }
      
      const paymentData = {
        ...values,
        employeeName: employee.name,
      };
      
      await apiRequest("POST", "/api/salaries", paymentData);
      
      // Invalidar consulta de salarios
      queryClient.invalidateQueries({ queryKey: ["/api/salaries"] });
      
      toast({
        title: "Pago registrado",
        description: "El pago de sueldo ha sido registrado exitosamente",
      });
      
      setPaymentSheetOpen(false);
      salaryPaymentForm.reset();
      
    } catch (error) {
      console.error("Error creating salary payment:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el pago de sueldo",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteEmployee(employeeId: number) {
    if (!confirm("¿Está seguro de eliminar este empleado? Se marcarán como inactivos pero no se eliminarán sus datos históricos.")) return;
    
    try {
      // En lugar de eliminar, marcamos como inactivo
      await apiRequest("PUT", `/api/employees/${employeeId}`, { active: false });
      
      // Invalidar consulta de empleados
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      
      toast({
        title: "Empleado desactivado",
        description: "El empleado ha sido marcado como inactivo exitosamente",
      });
      
    } catch (error) {
      console.error("Error deactivating employee:", error);
      toast({
        title: "Error",
        description: "No se pudo desactivar al empleado",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteSalary(salaryId: number) {
    if (!confirm("¿Está seguro de eliminar este registro de pago?")) return;
    
    try {
      await apiRequest("DELETE", `/api/salaries/${salaryId}`, {});
      
      // Invalidar consulta de salarios
      queryClient.invalidateQueries({ queryKey: ["/api/salaries"] });
      
      toast({
        title: "Pago eliminado",
        description: "El registro de pago ha sido eliminado exitosamente",
      });
      
    } catch (error) {
      console.error("Error deleting salary payment:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro de pago",
        variant: "destructive",
      });
    }
  }

  // Cálculos de totales
  const totalMonthlySalaries = salaries && Array.isArray(salaries)
    ? salaries.reduce((acc: number, salary: any) => {
        const salaryDate = new Date(salary.date);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        if (salaryDate.getMonth() === currentMonth && salaryDate.getFullYear() === currentYear) {
          return acc + parseFloat(salary.amount);
        }
        return acc;
      }, 0)
    : 0;

  const totalYearlySalaries = salaries && Array.isArray(salaries)
    ? salaries.reduce((acc: number, salary: any) => {
        const salaryDate = new Date(salary.date);
        const currentYear = new Date().getFullYear();
        
        if (salaryDate.getFullYear() === currentYear) {
          return acc + parseFloat(salary.amount);
        }
        return acc;
      }, 0)
    : 0;
    
  const activeEmployeesCount = employees && Array.isArray(employees)
    ? employees.filter((employee: any) => employee.active).length
    : 0;

  // Filtrar empleados según estado activo/inactivo
  const filteredEmployees = employees && Array.isArray(employees)
    ? employees.sort((a: any, b: any) => {
        // Ordenar por estado (activos primero) y luego por nombre
        if (a.active === b.active) {
          return a.name.localeCompare(b.name);
        }
        return a.active ? -1 : 1;
      })
    : [];

  // Filtrar salarios por empleados y ordenar por fecha (más recientes primero)
  const filteredSalaries = salaries && Array.isArray(salaries)
    ? salaries.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  if (isLoadingEmployees || isLoadingSalaries) {
    return <div className="py-10 text-center">Cargando datos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-header font-bold text-neutral-500">Gestión de Sueldos</h1>
          <p className="text-neutral-400 text-sm">
            Administra empleados y pagos de sueldos
          </p>
        </div>
        
        <div className="mt-2 sm:mt-0 flex flex-col sm:flex-row gap-2">
          <Dialog open={employeeDialogOpen} onOpenChange={setEmployeeDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetEmployeeForm}>
                <i className="ri-user-add-line mr-1"></i> Nuevo empleado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedEmployee ? "Editar empleado" : "Registrar empleado"}</DialogTitle>
                <DialogDescription>
                  {selectedEmployee 
                    ? "Actualice los datos del empleado" 
                    : "Complete los datos del nuevo empleado"}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...employeeForm}>
                <form onSubmit={employeeForm.handleSubmit(onSubmitEmployee)} className="space-y-4 py-4">
                  <FormField
                    control={employeeForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del empleado" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={employeeForm.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Puesto (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Cargo o posición" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={employeeForm.control}
                    name="fixedSalary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sueldo fijo ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={employeeForm.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Estado activo</FormLabel>
                          <FormDescription className="text-xs">
                            Determina si el empleado está actualmente en la nómina
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit">
                      {selectedEmployee ? "Actualizar" : "Guardar"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Sheet open={paymentSheetOpen} onOpenChange={setPaymentSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline">
                <i className="ri-money-dollar-box-line mr-1"></i> Registrar pago
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Registrar pago de sueldo</SheetTitle>
                <SheetDescription>
                  Complete los detalles del pago a realizar
                </SheetDescription>
              </SheetHeader>
              
              <Form {...salaryPaymentForm}>
                <form onSubmit={salaryPaymentForm.handleSubmit(onSubmitSalaryPayment)} className="space-y-4 py-4">
                  <FormField
                    control={salaryPaymentForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de pago</FormLabel>
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
                    control={salaryPaymentForm.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empleado</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un empleado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredEmployees
                              .filter((employee: any) => employee.active)
                              .map((employee: any) => (
                                <SelectItem 
                                  key={employee.id} 
                                  value={employee.id.toString()}
                                  onSelect={() => {
                                    // Al seleccionar empleado, actualizar monto si es sueldo fijo
                                    if (salaryPaymentForm.getValues("salaryType") === "fixed") {
                                      salaryPaymentForm.setValue("amount", employee.fixedSalary.toString());
                                    }
                                  }}
                                >
                                  {employee.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={salaryPaymentForm.control}
                    name="salaryType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de pago</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            
                            // Si cambia a sueldo fijo, actualizar con el valor del empleado seleccionado
                            if (value === "fixed") {
                              const employeeId = salaryPaymentForm.getValues("employeeId");
                              const employee = employees?.find((e: any) => e.id === parseInt(employeeId));
                              if (employee) {
                                salaryPaymentForm.setValue("amount", employee.fixedSalary.toString());
                              }
                            }
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione tipo de pago" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fixed">Sueldo fijo</SelectItem>
                            <SelectItem value="variable">Sueldo variable</SelectItem>
                            <SelectItem value="bonus">Bono/Extra</SelectItem>
                            <SelectItem value="advance">Adelanto</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={salaryPaymentForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={salaryPaymentForm.control}
                    name="period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Período (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Junio 2023"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={salaryPaymentForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Detalles adicionales"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <SheetFooter>
                    <Button type="submit">Registrar pago</Button>
                  </SheetFooter>
                </form>
              </Form>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Empleados activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-primary">
              {activeEmployeesCount}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sueldos este mes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-blue-600">
              ${totalMonthlySalaries.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sueldos del año</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600">
              ${totalYearlySalaries.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Pestañas para empleados y pagos */}
      <Tabs defaultValue="employees" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="employees">Empleados</TabsTrigger>
          <TabsTrigger value="payments">Pagos realizados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="employees" className="mt-4">
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-10 text-neutral-400">
              No hay empleados registrados
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Puesto</TableHead>
                    <TableHead>Sueldo fijo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee: any) => (
                    <TableRow key={employee.id} className={!employee.active ? "bg-gray-50" : ""}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.position || "-"}</TableCell>
                      <TableCell>${parseFloat(employee.fixedSalary).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        {employee.active ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                            Inactivo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => editEmployee(employee)}
                            title="Editar"
                          >
                            <i className="ri-edit-line text-blue-600"></i>
                          </Button>
                          
                          {employee.active && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setupSalaryPayment(employee.id.toString(), employee.name)}
                              title="Registrar pago"
                            >
                              <i className="ri-money-dollar-circle-line text-green-600"></i>
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteEmployee(employee.id)}
                            title={employee.active ? "Desactivar" : "Eliminar"}
                          >
                            <i className={`ri-${employee.active ? 'user-unfollow-line' : 'delete-bin-line'} text-red-600`}></i>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="payments" className="mt-4">
          {filteredSalaries.length === 0 ? (
            <div className="text-center py-10 text-neutral-400">
              No hay pagos registrados
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSalaries.map((salary: any) => (
                <Card key={salary.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center p-4">
                    <div className="flex-1">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <h3 className="font-medium text-neutral-800">
                            {salary.employeeName}
                          </h3>
                          <Badge className="ml-2" variant={
                            salary.salaryType === "fixed" ? "default" :
                            salary.salaryType === "variable" ? "secondary" :
                            salary.salaryType === "bonus" ? "success" : "outline"
                          }>
                            {salary.salaryType === "fixed" ? "Fijo" :
                             salary.salaryType === "variable" ? "Variable" :
                             salary.salaryType === "bonus" ? "Bono" : 
                             salary.salaryType === "advance" ? "Adelanto" : salary.salaryType}
                          </Badge>
                          {salary.period && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              {salary.period}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-neutral-500 flex flex-wrap items-center gap-3 mt-1">
                          <span className="flex items-center">
                            <i className="ri-calendar-line mr-1"></i>
                            {format(new Date(salary.date), "dd/MM/yyyy")}
                          </span>
                          {salary.description && (
                            <span className="flex items-center">
                              <i className="ri-file-list-line mr-1"></i>
                              {salary.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:pr-5 md:mr-3 md:border-r md:border-neutral-200 mt-3 md:mt-0">
                      <span className="text-lg font-semibold text-blue-600">
                        ${parseFloat(salary.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1 mt-3 md:mt-0">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteSalary(salary.id)}
                      >
                        <i className="ri-delete-bin-line text-lg"></i>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}