import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  FormDescription,
} from "@/components/ui/form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Esquema para el formulario de inversiones
const investmentFormSchema = z.object({
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
  // Campos específicos para detalles basados en el tipo
  details: z.record(z.string()).optional(),
});

type InvestmentFormValues = z.infer<typeof investmentFormSchema>;

export default function InvestmentsIndex() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { toast } = useToast();

  // Consultar las inversiones
  const { data: investments, isLoading } = useQuery({
    queryKey: ["/api/investments"],
  });

  const form = useForm<InvestmentFormValues>({
    resolver: zodResolver(investmentFormSchema),
    defaultValues: {
      date: new Date(),
      type: "machinery",
      description: "",
      amount: "",
      details: {},
    },
  });

  // Obtener el tipo de inversión actual para mostrar campos adicionales
  const currentInvestmentType = form.watch("type");

  // Define el tipo de cada campo
  type FieldConfig = {
    name: string;
    type: 'simple' | 'quantity_price';
  };

  // Definir qué campos adicionales mostrar según el tipo
  const getDetailFields = () => {
    switch(currentInvestmentType) {
      case "machinery":
        return [
          { name: "marca", type: "simple" },
          { name: "modelo", type: "simple" },
          { name: "año", type: "simple" }
        ];
      case "fencing":
        return [
          { name: "mano_de_obra", type: "quantity_price" },
          { name: "alambre", type: "quantity_price" },
          { name: "postes", type: "quantity_price" },
          { name: "horas_topadora", type: "quantity_price" }
        ];
      case "construction":
        return [
          { name: "materiales", type: "quantity_price" },
          { name: "mano_de_obra", type: "quantity_price" }
        ];
      case "clearing":
        return [
          { name: "horas_topadora", type: "quantity_price" }
        ];
      case "tools":
        return [
          { name: "cantidad", type: "simple" },
          { name: "marca", type: "simple" }
        ];
      default:
        return [];
    }
  };

  async function onSubmit(values: InvestmentFormValues) {
    try {
      await apiRequest("POST", "/api/investments", values);

      // Invalidar consulta de inversiones
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      
      toast({
        title: "Inversión registrada",
        description: "La inversión ha sido registrada exitosamente",
      });
      
      setSheetOpen(false);
      form.reset();
      
    } catch (error) {
      console.error("Error creating investment:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar la inversión",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(investmentId: number) {
    if (!confirm("¿Está seguro de eliminar esta inversión?")) return;
    
    try {
      await apiRequest("DELETE", `/api/investments/${investmentId}`, {});
      
      // Invalidar consulta de inversiones
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      
      toast({
        title: "Inversión eliminada",
        description: "La inversión ha sido eliminada exitosamente",
      });
      
    } catch (error) {
      console.error("Error deleting investment:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la inversión",
        variant: "destructive",
      });
    }
  }

  // Filtrar inversiones según la pestaña activa
  const filteredInvestments = investments ? investments.filter((investment: any) => {
    if (activeTab === "all") return true;
    return investment.type === activeTab;
  }) : [];

  // Calcular total de inversiones
  const totalInvestment = investments ? investments.reduce((acc: number, investment: any) => {
    return acc + parseFloat(investment.amount);
  }, 0) : 0;

  // Calcular totales por tipo
  const investmentsByType = investments ? investments.reduce((acc: any, investment: any) => {
    if (!acc[investment.type]) {
      acc[investment.type] = 0;
    }
    acc[investment.type] += parseFloat(investment.amount);
    return acc;
  }, {}) : {};

  // Obtener etiqueta para tipo de inversión
  const getInvestmentTypeLabel = (type: string) => {
    switch(type) {
      case "machinery": return "Maquinaria";
      case "fencing": return "Alambrados";
      case "construction": return "Construcciones";
      case "clearing": return "Desmonte";
      case "tools": return "Herramientas";
      default: return type;
    }
  };

  // Obtener color para tipo de inversión
  const getInvestmentTypeColor = (type: string) => {
    switch(type) {
      case "machinery": return "bg-blue-100 text-blue-600";
      case "fencing": return "bg-green-100 text-green-600";
      case "construction": return "bg-orange-100 text-orange-600";
      case "clearing": return "bg-red-100 text-red-600";
      case "tools": return "bg-purple-100 text-purple-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  if (isLoading) {
    return <div className="py-10 text-center">Cargando inversiones...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-header font-bold text-neutral-500">Inversiones</h1>
          <p className="text-neutral-400 text-sm">
            Gestiona las inversiones del establecimiento
          </p>
        </div>
        
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button className="mt-2 sm:mt-0">
              <i className="ri-add-line mr-1"></i> Nueva inversión
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Registrar inversión</SheetTitle>
              <SheetDescription>
                Complete los datos de la nueva inversión
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
                          <SelectItem value="machinery">Maquinaria</SelectItem>
                          <SelectItem value="fencing">Alambrados</SelectItem>
                          <SelectItem value="construction">Construcciones</SelectItem>
                          <SelectItem value="clearing">Desmonte</SelectItem>
                          <SelectItem value="tools">Herramientas</SelectItem>
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
                        <Textarea
                          placeholder="Describa la inversión"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Campos dinámicos según el tipo de inversión */}
                {getDetailFields().map((fieldConfig) => (
                  <div key={fieldConfig.name}>
                    {fieldConfig.type === 'simple' ? (
                      <FormField
                        control={form.control}
                        name={`details.${fieldConfig.name}` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="capitalize">
                              {fieldConfig.name.replace(/_/g, ' ')}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={fieldConfig.name.replace(/_/g, ' ')}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <div className="border rounded-md p-4 mb-4">
                        <h4 className="font-medium text-sm capitalize mb-3">
                          {fieldConfig.name.replace(/_/g, ' ')}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name={`details.${fieldConfig.name}_cantidad` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Cantidad</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    placeholder="0"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`details.${fieldConfig.name}_precio` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Precio unitario</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    placeholder="$0"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
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
                  <Button type="submit">Guardar inversión</Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Resumen de inversiones */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total inversiones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-blue-600">
              ${totalInvestment.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Inversiones por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(investmentsByType).map(([type, amount]) => (
                <div key={type} className="flex flex-col items-center bg-gray-50 p-2 rounded-md">
                  <span className="text-sm text-neutral-600">{getInvestmentTypeLabel(type)}</span>
                  <span className="font-semibold text-neutral-800">
                    ${parseFloat(amount as string).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabla de inversiones */}
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="machinery">Maquinaria</TabsTrigger>
          <TabsTrigger value="fencing">Alambrados</TabsTrigger>
          <TabsTrigger value="construction">Construcciones</TabsTrigger>
          <TabsTrigger value="clearing">Desmonte</TabsTrigger>
          <TabsTrigger value="tools">Herramientas</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-4">
          {filteredInvestments.length === 0 ? (
            <div className="text-center py-10 text-neutral-400">
              No hay inversiones para mostrar
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInvestments.map((investment: any) => (
                <Collapsible
                  key={investment.id}
                  open={expandedId === investment.id}
                  onOpenChange={() => setExpandedId(expandedId === investment.id ? null : investment.id)}
                >
                  <Card className="p-0 overflow-hidden">
                    <div className="flex items-center">
                      <div 
                        className={`w-16 h-16 flex-shrink-0 flex items-center justify-center ${
                          getInvestmentTypeColor(investment.type)
                        }`}
                      >
                        <i className={`text-2xl ${
                          investment.type === 'machinery' ? 'ri-car-line' :
                          investment.type === 'fencing' ? 'ri-layout-grid-line' :
                          investment.type === 'construction' ? 'ri-building-line' :
                          investment.type === 'clearing' ? 'ri-landscape-line' :
                          'ri-tools-line'
                        }`}></i>
                      </div>
                      
                      <div className="flex-1 px-4 py-3">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <h3 className="font-medium text-neutral-800">
                              {investment.description}
                            </h3>
                            <Badge className="ml-2 px-2 py-0 h-5">
                              {getInvestmentTypeLabel(investment.type)}
                            </Badge>
                          </div>
                          <div className="text-sm text-neutral-500 flex flex-wrap items-center gap-3">
                            <span className="flex items-center">
                              <i className="ri-calendar-line mr-1"></i>
                              {format(new Date(investment.date), "dd/MM/yyyy")}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pr-5 mr-3 border-r border-neutral-200">
                        <span className="text-lg font-semibold text-blue-600">
                          ${parseFloat(investment.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1 pr-3">
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-9 w-9 hover:bg-blue-50"
                          >
                            <i className={`ri-${expandedId === investment.id ? 'arrow-up' : 'arrow-down'}-s-line text-lg`}></i>
                          </Button>
                        </CollapsibleTrigger>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(investment.id)}
                        >
                          <i className="ri-delete-bin-line text-lg"></i>
                        </Button>
                      </div>
                    </div>
                    
                    <CollapsibleContent>
                      {investment.details && (
                        <div className="border-t border-neutral-200 p-4 bg-gray-50">
                          <h4 className="text-sm font-medium text-neutral-700 mb-2">Detalles adicionales:</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(investment.details).map(([key, value]) => {
                              // Verificar si es un campo con cantidad y precio
                              if (key.endsWith('_cantidad') || key.endsWith('_precio')) {
                                return null; // No mostrar estos campos individuales
                              }
                              
                              // Buscar si existe el par cantidad/precio para este campo
                              const baseName = key;
                              const cantidadKey = `${baseName}_cantidad`;
                              const precioKey = `${baseName}_precio`;
                              
                              if (investment.details[cantidadKey] && investment.details[precioKey]) {
                                // Es un campo con cantidad y precio
                                const cantidad = investment.details[cantidadKey];
                                const precio = investment.details[precioKey];
                                const subtotal = parseFloat(cantidad as string) * parseFloat(precio as string);
                                
                                return (
                                  <div key={key} className="bg-white p-3 rounded border border-neutral-200">
                                    <span className="text-xs font-medium text-neutral-600 capitalize block mb-1">
                                      {key.replace(/_/g, ' ')}
                                    </span>
                                    <div className="grid grid-cols-2 gap-2 text-xs mb-1">
                                      <div>
                                        <span className="text-neutral-500">Cantidad:</span>
                                        <span className="ml-1 font-medium">{cantidad as string}</span>
                                      </div>
                                      <div>
                                        <span className="text-neutral-500">Precio unitario:</span>
                                        <span className="ml-1 font-medium">${precio as string}</span>
                                      </div>
                                    </div>
                                    <div className="text-xs text-neutral-500">
                                      Subtotal: <span className="font-medium text-blue-600">${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                  </div>
                                );
                              }
                              
                              // Es un campo simple
                              return (
                                <div key={key} className="bg-white p-2 rounded border border-neutral-200">
                                  <span className="text-xs text-neutral-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                                  <p className="text-sm font-medium text-neutral-800">{value as string}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}