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

// Esquema para el formulario de servicios
const serviceFormSchema = z.object({
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  type: z.string({
    required_error: "El tipo es requerido",
  }),
  description: z.string({
    required_error: "La descripción es requerida",
  }).min(1, {
    message: "La descripción es requerida"
  }),
  amount: z.string({
    required_error: "El monto es requerido",
  }).min(1, {
    message: "El monto es requerido"
  }),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export default function Services() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // Consultar los servicios
  const { data: services, isLoading } = useQuery({
    queryKey: ["/api/services"],
  });

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      date: new Date(),
      type: "edesal",
      description: "",
      amount: "",
    },
  });

  async function onSubmit(values: ServiceFormValues) {
    try {
      await apiRequest("POST", "/api/services", values);

      // Invalidar consulta de servicios
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      
      toast({
        title: "Servicio registrado",
        description: "El servicio ha sido registrado exitosamente",
      });
      
      setSheetOpen(false);
      form.reset();
      
    } catch (error) {
      console.error("Error creating service:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el servicio",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(serviceId: number) {
    if (!confirm("¿Está seguro de eliminar este servicio?")) return;
    
    try {
      await apiRequest("DELETE", `/api/services/${serviceId}`, {});
      
      // Invalidar consulta de servicios
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      
      toast({
        title: "Servicio eliminado",
        description: "El servicio ha sido eliminado exitosamente",
      });
      
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el servicio",
        variant: "destructive",
      });
    }
  }

  // Filtrar servicios según la pestaña activa
  const filteredServices = services && Array.isArray(services) 
    ? services.filter((service: any) => {
        if (activeTab === "all") return true;
        return service.type === activeTab;
      }) 
    : [];

  // Calcular total de servicios
  const totalServices = services && Array.isArray(services)
    ? services.reduce((acc: number, service: any) => {
        return acc + parseFloat(service.amount);
      }, 0) 
    : 0;

  // Calcular totales por tipo
  const servicesByType = services && Array.isArray(services)
    ? services.reduce((acc: any, service: any) => {
        if (!acc[service.type]) {
          acc[service.type] = 0;
        }
        acc[service.type] += parseFloat(service.amount);
        return acc;
      }, {}) 
    : {};

  // Obtener etiqueta para tipo de servicio
  const getServiceTypeLabel = (type: string) => {
    switch(type) {
      case "edesal": return "EDESAL";
      case "consorcio_regantes": return "Consorcio de regantes";
      case "agua_potable": return "Agua potable";
      case "internet": return "Internet";
      default: return type;
    }
  };

  if (isLoading) {
    return <div className="py-10 text-center">Cargando servicios...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-header font-bold text-neutral-500">Servicios</h1>
          <p className="text-neutral-400 text-sm">
            Gestiona los pagos de servicios
          </p>
        </div>
        
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button className="mt-2 sm:mt-0">
              <i className="ri-add-line mr-1"></i> Nuevo servicio
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Registrar servicio</SheetTitle>
              <SheetDescription>
                Complete los datos del nuevo servicio
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
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
                          <SelectItem value="edesal">EDESAL</SelectItem>
                          <SelectItem value="consorcio_regantes">Consorcio de regantes</SelectItem>
                          <SelectItem value="agua_potable">Agua potable</SelectItem>
                          <SelectItem value="internet">Internet</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <Input
                          placeholder="Describa el servicio"
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
                
                <SheetFooter>
                  <Button type="submit">Guardar servicio</Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Resumen de servicios */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total servicios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-blue-600">
              ${totalServices.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Servicios por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(servicesByType).map(([type, amount]) => (
                <div key={type} className="flex flex-col items-center bg-gray-50 p-2 rounded-md">
                  <span className="text-sm text-neutral-600">{getServiceTypeLabel(type)}</span>
                  <span className="font-semibold text-neutral-800">
                    ${parseFloat(amount as string).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabla de servicios */}
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="edesal">EDESAL</TabsTrigger>
          <TabsTrigger value="consorcio_regantes">Consorcio de regantes</TabsTrigger>
          <TabsTrigger value="agua_potable">Agua potable</TabsTrigger>
          <TabsTrigger value="internet">Internet</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-4">
          {filteredServices.length === 0 ? (
            <div className="text-center py-10 text-neutral-400">
              No hay servicios para mostrar
            </div>
          ) : (
            <div className="space-y-3">
              {filteredServices.map((service: any) => (
                <Card key={service.id} className="overflow-hidden">
                  <div className="flex items-center p-4">
                    <div className="flex-1">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <h3 className="font-medium text-neutral-800">
                            {service.description}
                          </h3>
                        </div>
                        <div className="text-sm text-neutral-500 flex flex-wrap items-center gap-3">
                          <span className="flex items-center">
                            <i className="ri-calendar-line mr-1"></i>
                            {format(new Date(service.date), "dd/MM/yyyy")}
                          </span>
                          <span className="flex items-center">
                            <i className="ri-service-line mr-1"></i>
                            {getServiceTypeLabel(service.type)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pr-5 mr-3 border-r border-neutral-200">
                      <span className="text-lg font-semibold text-blue-600">
                        ${parseFloat(service.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1 pr-3">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(service.id)}
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