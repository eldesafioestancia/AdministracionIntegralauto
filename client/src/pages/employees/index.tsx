import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

// Esquema para el formulario de empleados
const employeeFormSchema = z.object({
  name: z.string({
    required_error: "El nombre es requerido",
  }).min(1, {
    message: "El nombre es requerido"
  }),
  position: z.string({
    required_error: "El cargo es requerido",
  }).min(1, {
    message: "El cargo es requerido"
  }),
  documentId: z.string().optional(),
  contactInfo: z.string().optional(),
  startDate: z.date({
    required_error: "La fecha de inicio es requerida",
  }),
  salary: z.string({
    required_error: "El salario es requerido",
  }).min(1, {
    message: "El salario es requerido"
  }),
  status: z.string().default("active"),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export default function Employees() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const { toast } = useToast();

  // Consultar los empleados
  const { data: employees, isLoading } = useQuery({
    queryKey: ["/api/employees"],
  });

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      position: "",
      documentId: "",
      contactInfo: "",
      startDate: new Date(),
      salary: "",
      status: "active",
    },
  });

  // Restablecer el formulario cuando se cierra el sheet
  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setEditingEmployee(null);
    }
    setSheetOpen(open);
  };

  // Cargar datos de empleado al editar
  const handleEditEmployee = (employee: any) => {
    setEditingEmployee(employee);
    form.reset({
      name: employee.name,
      position: employee.position,
      documentId: employee.documentId || "",
      contactInfo: employee.contactInfo || "",
      startDate: new Date(employee.startDate),
      salary: employee.salary,
      status: employee.status,
    });
    setSheetOpen(true);
  };

  async function onSubmit(values: EmployeeFormValues) {
    try {
      if (editingEmployee) {
        // Actualizar empleado existente
        await apiRequest("PUT", `/api/employees/${editingEmployee.id}`, values);
        toast({
          title: "Empleado actualizado",
          description: "El empleado ha sido actualizado exitosamente",
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
      
      setSheetOpen(false);
      form.reset();
      setEditingEmployee(null);
      
    } catch (error) {
      console.error("Error saving employee:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la información del empleado",
        variant: "destructive",
      });
    }
  }

  async function handleUpdateStatus(employeeId: number, newStatus: string) {
    try {
      await apiRequest("PUT", `/api/employees/${employeeId}`, { status: newStatus });
      
      // Invalidar consulta de empleados
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      
      toast({
        title: "Estado actualizado",
        description: `El empleado ha sido ${newStatus === 'active' ? 'activado' : 'desactivado'} exitosamente`,
      });
      
    } catch (error) {
      console.error("Error updating employee status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del empleado",
        variant: "destructive",
      });
    }
  }
  
  async function handleDeleteEmployee(employeeId: number) {
    // Confirmar eliminación con el usuario
    if (!confirm("¿Está seguro de eliminar este empleado? Esta acción no se puede deshacer y también eliminará todos los registros de salarios asociados.")) {
      return;
    }
    
    try {
      await apiRequest("DELETE", `/api/employees/${employeeId}`, {});
      
      // Invalidar consulta de empleados
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      // También invalidar salarios, ya que pueden estar relacionados
      queryClient.invalidateQueries({ queryKey: ["/api/salaries"] });
      
      toast({
        title: "Empleado eliminado",
        description: "El empleado ha sido eliminado completamente del sistema",
      });
      
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el empleado. Puede tener registros relacionados.",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return <div className="py-10 text-center">Cargando empleados...</div>;
  }

  const activeEmployees = employees && Array.isArray(employees)
    ? employees.filter((employee: any) => employee.status === "active")
    : [];
  
  const inactiveEmployees = employees && Array.isArray(employees)
    ? employees.filter((employee: any) => employee.status === "inactive")
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-header font-bold text-neutral-500">Empleados</h1>
          <p className="text-neutral-400 text-sm">
            Gestiona la información de los empleados
          </p>
        </div>
        
        <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
          <SheetTrigger asChild>
            <Button className="mt-2 sm:mt-0">
              <i className="ri-add-line mr-1"></i> Nuevo empleado
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>{editingEmployee ? "Editar empleado" : "Registrar empleado"}</SheetTitle>
              <SheetDescription>
                Complete los datos del empleado
              </SheetDescription>
            </SheetHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nombre del empleado"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Cargo o puesto"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="documentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Número de documento"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contacto (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Teléfono o email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de inicio</FormLabel>
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
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salario mensual ($)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <SheetFooter>
                  <Button type="submit">
                    {editingEmployee ? "Actualizar empleado" : "Guardar empleado"}
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Lista de empleados activos */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-neutral-700">Empleados activos</h2>
        {activeEmployees.length === 0 ? (
          <div className="text-center py-10 text-neutral-400 bg-gray-50 rounded-md">
            No hay empleados activos para mostrar
          </div>
        ) : (
          <div className="space-y-3">
            {activeEmployees.map((employee: any) => (
              <Card key={employee.id} className="overflow-hidden">
                <div className="flex items-center p-4">
                  <div className="flex-1">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <h3 className="font-medium text-neutral-800">
                          {employee.name}
                        </h3>
                      </div>
                      <div className="text-sm text-neutral-500 flex flex-wrap items-center gap-3">
                        <span className="flex items-center">
                          <i className="ri-briefcase-line mr-1"></i>
                          {employee.position}
                        </span>
                        <span className="flex items-center">
                          <i className="ri-calendar-line mr-1"></i>
                          Desde {format(new Date(employee.startDate), "dd/MM/yyyy")}
                        </span>
                        {employee.documentId && (
                          <span className="flex items-center">
                            <i className="ri-id-card-line mr-1"></i>
                            {employee.documentId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pr-5 mr-3 border-r border-neutral-200">
                    <span className="text-lg font-semibold text-blue-600">
                      ${parseFloat(employee.salary).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1 pr-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-9 text-neutral-600"
                      onClick={() => handleEditEmployee(employee)}
                    >
                      <i className="ri-edit-line mr-1"></i>
                      Editar
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-9 text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                      onClick={() => handleUpdateStatus(employee.id, "inactive")}
                    >
                      <i className="ri-user-unfollow-line mr-1"></i>
                      Desactivar
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteEmployee(employee.id)}
                    >
                      <i className="ri-delete-bin-line mr-1"></i>
                      Eliminar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Lista de empleados inactivos */}
      {inactiveEmployees.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-neutral-700">Empleados inactivos</h2>
          <div className="space-y-3">
            {inactiveEmployees.map((employee: any) => (
              <Card key={employee.id} className="overflow-hidden bg-gray-50 border-dashed">
                <div className="flex items-center p-4">
                  <div className="flex-1">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <h3 className="font-medium text-neutral-500">
                          {employee.name}
                        </h3>
                        <span className="ml-2 text-xs bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded">
                          Inactivo
                        </span>
                      </div>
                      <div className="text-sm text-neutral-400 flex flex-wrap items-center gap-3">
                        <span className="flex items-center">
                          <i className="ri-briefcase-line mr-1"></i>
                          {employee.position}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 pr-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-9 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handleUpdateStatus(employee.id, "active")}
                    >
                      <i className="ri-user-follow-line mr-1"></i>
                      Activar
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteEmployee(employee.id)}
                    >
                      <i className="ri-delete-bin-line mr-1"></i>
                      Eliminar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}