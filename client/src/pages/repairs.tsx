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

// Esquema para el formulario de reparaciones
const repairFormSchema = z.object({
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  type: z.string({
    required_error: "El tipo es requerido",
  }),
  provider: z.string().min(1, {
    message: "El proveedor es requerido"
  }),
  description: z.string().min(1, {
    message: "La descripción es requerida"
  }),
  amount: z.string().min(1, {
    message: "El monto es requerido"
  }),
});

type RepairFormValues = z.infer<typeof repairFormSchema>;

// Definir las categorías de reparaciones
const repairCategories = [
  { id: "construcciones", label: "Construcciones" },
  { id: "electricista", label: "Electricista" },
  { id: "albanil", label: "Albañil" },
  { id: "plomero", label: "Plomero" },
  { id: "materiales", label: "Materiales" },
];

export default function Repairs() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // Consultar las reparaciones
  const { data: repairs, isLoading } = useQuery({
    queryKey: ["/api/repairs"],
  });

  const form = useForm<RepairFormValues>({
    resolver: zodResolver(repairFormSchema),
    defaultValues: {
      date: new Date(),
      type: "construcciones",
      provider: "",
      description: "",
      amount: "",
    },
  });

  async function onSubmit(values: RepairFormValues) {
    try {
      await apiRequest("POST", "/api/repairs", values);

      // Invalidar consulta de reparaciones
      queryClient.invalidateQueries({ queryKey: ["/api/repairs"] });
      
      toast({
        title: "Reparación registrada",
        description: "La reparación ha sido registrada exitosamente",
      });
      
      setSheetOpen(false);
      form.reset();
      
    } catch (error) {
      console.error("Error creating repair:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar la reparación",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(repairId: number) {
    if (!confirm("¿Está seguro de eliminar esta reparación?")) return;
    
    try {
      await apiRequest("DELETE", `/api/repairs/${repairId}`, {});
      
      // Invalidar consulta de reparaciones
      queryClient.invalidateQueries({ queryKey: ["/api/repairs"] });
      
      toast({
        title: "Reparación eliminada",
        description: "La reparación ha sido eliminada exitosamente",
      });
      
    } catch (error) {
      console.error("Error deleting repair:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la reparación",
        variant: "destructive",
      });
    }
  }

  // Filtrar reparaciones según la pestaña activa
  const filteredRepairs = repairs && Array.isArray(repairs)
    ? repairs.filter((repair: any) => {
        if (activeTab === "all") return true;
        return repair.type === activeTab;
      })
    : [];

  // Calcular total de reparaciones
  const totalRepairs = repairs && Array.isArray(repairs)
    ? repairs.reduce((acc: number, repair: any) => {
        return acc + parseFloat(repair.amount);
      }, 0)
    : 0;

  // Calcular totales por tipo
  const repairsByType = repairs && Array.isArray(repairs)
    ? repairs.reduce((acc: any, repair: any) => {
        if (!acc[repair.type]) {
          acc[repair.type] = 0;
        }
        acc[repair.type] += parseFloat(repair.amount);
        return acc;
      }, {})
    : {};

  // Obtener etiqueta para tipo de reparación
  const getRepairTypeLabel = (type: string) => {
    const category = repairCategories.find(cat => cat.id === type);
    return category ? category.label : type;
  };

  if (isLoading) {
    return <div className="py-10 text-center">Cargando reparaciones...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-header font-bold text-neutral-500">Reparaciones</h1>
          <p className="text-neutral-400 text-sm">
            Gestiona los gastos en reparaciones y mantenimiento
          </p>
        </div>
        
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button className="mt-2 sm:mt-0">
              <i className="ri-add-line mr-1"></i> Nueva reparación
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Registrar reparación</SheetTitle>
              <SheetDescription>
                Complete los datos de la nueva reparación
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
                          {repairCategories.map(category => (
                            <SelectItem key={category.id} value={category.id}>{category.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proveedor</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nombre del proveedor"
                          {...field}
                        />
                      </FormControl>
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
                          placeholder="Describa la reparación"
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
                  <Button type="submit">Guardar reparación</Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Resumen de reparaciones */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total reparaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-blue-600">
              ${totalRepairs.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Reparaciones por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(repairsByType).map(([type, amount]) => (
                <div key={type} className="flex flex-col items-center bg-gray-50 p-2 rounded-md">
                  <span className="text-sm text-neutral-600">{getRepairTypeLabel(type)}</span>
                  <span className="font-semibold text-neutral-800">
                    ${parseFloat(amount as string).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs para filtrar */}
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          {repairCategories.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-4">
          {filteredRepairs.length === 0 ? (
            <div className="text-center py-10 text-neutral-400">
              No hay reparaciones para mostrar
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRepairs.map((repair: any) => (
                <Card key={repair.id} className="overflow-hidden">
                  <div className="flex items-center p-4">
                    <div className="flex-1">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <h3 className="font-medium text-neutral-800">
                            {repair.description}
                          </h3>
                        </div>
                        <div className="text-sm text-neutral-500 flex flex-wrap items-center gap-3">
                          <span className="flex items-center">
                            <i className="ri-calendar-line mr-1"></i>
                            {format(new Date(repair.date), "dd/MM/yyyy")}
                          </span>
                          <span className="flex items-center">
                            <i className="ri-tools-fill mr-1"></i>
                            {getRepairTypeLabel(repair.type)}
                          </span>
                          <span className="flex items-center">
                            <i className="ri-user-line mr-1"></i>
                            {repair.provider}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pr-5 mr-3 border-r border-neutral-200">
                      <span className="text-lg font-semibold text-blue-600">
                        ${parseFloat(repair.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1 pr-3">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(repair.id)}
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