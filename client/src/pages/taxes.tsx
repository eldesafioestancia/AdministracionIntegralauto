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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Esquema para el formulario de impuestos
const taxFormSchema = z.object({
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  type: z.string({
    required_error: "El tipo es requerido",
  }),
  subtype: z.string({
    required_error: "El subtipo es requerido",
  }),
  code: z.string().optional(),
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

type TaxFormValues = z.infer<typeof taxFormSchema>;

// Definir las categorías de impuestos
const taxCategories = {
  provincial: {
    label: "Provinciales",
    subtypes: [
      { id: "25-1430-3", label: "25-1430-3" },
      { id: "25-1711-6", label: "25-1711-6" },
      { id: "19-1047104-4", label: "19-1047104-4" },
      { id: "19-1047105-2", label: "19-1047105-2" },
      { id: "19-1047106-a", label: "19-1047106-a" },
      { id: "19-1047102-8", label: "19-1047102-8" },
      { id: "moratoria_provincial", label: "Moratoria" },
    ]
  },
  municipal: {
    label: "Municipales",
    subtypes: [
      { id: "tasas", label: "Tasas" },
      { id: "moratoria_municipal", label: "Moratoria" },
    ]
  },
  iibb: {
    label: "IIBB",
    subtypes: [
      { id: "iibb_regular", label: "IIBB" },
      { id: "moratoria_iibb", label: "Moratoria" },
    ]
  }
};

export default function Taxes() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // Consultar los impuestos
  const { data: taxes, isLoading } = useQuery({
    queryKey: ["/api/taxes"],
  });

  const form = useForm<TaxFormValues>({
    resolver: zodResolver(taxFormSchema),
    defaultValues: {
      date: new Date(),
      type: "provincial",
      subtype: "25-1430-3",
      code: "",
      description: "",
      amount: "",
    },
  });

  // Obtener el tipo de impuesto actual para mostrar subtypes
  const currentTaxType = form.watch("type");

  const handleTypeChange = (value: string) => {
    form.setValue("type", value);
    // Establecer el primer subtipo como valor predeterminado cuando cambia el tipo
    const firstSubtype = taxCategories[value as keyof typeof taxCategories]?.subtypes[0]?.id || "";
    form.setValue("subtype", firstSubtype);
  };

  async function onSubmit(values: TaxFormValues) {
    try {
      // Combinar tipo y subtipo para enviar al servidor
      const taxData = {
        ...values,
        // El campo type contendrá el subtipo para que la API lo maneje correctamente
        type: values.subtype,
      };
      
      await apiRequest("POST", "/api/taxes", taxData);

      // Invalidar consulta de impuestos
      queryClient.invalidateQueries({ queryKey: ["/api/taxes"] });
      
      toast({
        title: "Impuesto registrado",
        description: "El impuesto ha sido registrado exitosamente",
      });
      
      setSheetOpen(false);
      form.reset();
      
    } catch (error) {
      console.error("Error creating tax:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el impuesto",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(taxId: number) {
    if (!confirm("¿Está seguro de eliminar este impuesto?")) return;
    
    try {
      await apiRequest("DELETE", `/api/taxes/${taxId}`, {});
      
      // Invalidar consulta de impuestos
      queryClient.invalidateQueries({ queryKey: ["/api/taxes"] });
      
      toast({
        title: "Impuesto eliminado",
        description: "El impuesto ha sido eliminado exitosamente",
      });
      
    } catch (error) {
      console.error("Error deleting tax:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el impuesto",
        variant: "destructive",
      });
    }
  }

  // Filtrar impuestos según la pestaña activa
  const filteredTaxes = taxes && Array.isArray(taxes) 
    ? taxes.filter((tax: any) => {
        if (activeTab === "all") return true;
        
        // Verificar si el tipo comienza con el valor de activeTab
        return tax.type.startsWith(activeTab);
      }) 
    : [];

  // Agrupar impuestos por categoría y subcategoría
  const groupedTaxes = filteredTaxes.reduce((acc: any, tax: any) => {
    let category = "";
    let subcategory = tax.type;
    
    // Determinar la categoría basada en el tipo
    if (tax.type.startsWith("25-") || tax.type.startsWith("19-") || tax.type === "moratoria_provincial") {
      category = "provincial";
    } else if (tax.type === "tasas" || tax.type === "moratoria_municipal") {
      category = "municipal";
    } else if (tax.type === "iibb_regular" || tax.type === "moratoria_iibb") {
      category = "iibb";
    }
    
    if (!acc[category]) {
      acc[category] = {};
    }
    
    if (!acc[category][subcategory]) {
      acc[category][subcategory] = [];
    }
    
    acc[category][subcategory].push(tax);
    return acc;
  }, {});

  // Calcular total de impuestos
  const totalTaxes = taxes && Array.isArray(taxes)
    ? taxes.reduce((acc: number, tax: any) => {
        return acc + parseFloat(tax.amount);
      }, 0) 
    : 0;

  // Calcular totales por tipo
  const taxesByCategory = taxes && Array.isArray(taxes)
    ? taxes.reduce((acc: any, tax: any) => {
        let category = "";
        
        // Determinar la categoría basada en el tipo
        if (tax.type.startsWith("25-") || tax.type.startsWith("19-") || tax.type === "moratoria_provincial") {
          category = "provincial";
        } else if (tax.type === "tasas" || tax.type === "moratoria_municipal") {
          category = "municipal";
        } else if (tax.type === "iibb_regular" || tax.type === "moratoria_iibb") {
          category = "iibb";
        }
        
        if (!acc[category]) {
          acc[category] = 0;
        }
        
        acc[category] += parseFloat(tax.amount);
        return acc;
      }, {}) 
    : {};

  // Obtener etiqueta para categoría de impuesto
  const getCategoryLabel = (category: string) => {
    return taxCategories[category as keyof typeof taxCategories]?.label || category;
  };

  // Obtener etiqueta para subcategoría de impuesto
  const getSubtypeLabel = (type: string, subtype: string) => {
    const category = taxCategories[type as keyof typeof taxCategories];
    if (!category) return subtype;
    
    const subtypeItem = category.subtypes.find(item => item.id === subtype);
    return subtypeItem?.label || subtype;
  };

  if (isLoading) {
    return <div className="py-10 text-center">Cargando impuestos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-header font-bold text-neutral-500">Impuestos</h1>
          <p className="text-neutral-400 text-sm">
            Gestiona los pagos de impuestos
          </p>
        </div>
        
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button className="mt-2 sm:mt-0">
              <i className="ri-add-line mr-1"></i> Nuevo impuesto
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Registrar impuesto</SheetTitle>
              <SheetDescription>
                Complete los datos del nuevo impuesto
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
                      <FormLabel>Categoría</FormLabel>
                      <Select 
                        onValueChange={handleTypeChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(taxCategories).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subtype"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategoría</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una subcategoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currentTaxType && taxCategories[currentTaxType as keyof typeof taxCategories]?.subtypes.map(subtype => (
                            <SelectItem key={subtype.id} value={subtype.id}>{subtype.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Código de referencia"
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
                          placeholder="Describa el impuesto"
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
                  <Button type="submit">Guardar impuesto</Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Resumen de impuestos */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total impuestos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-blue-600">
              ${totalTaxes.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Impuestos por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(taxesByCategory).map(([category, amount]) => (
                <div key={category} className="flex flex-col items-center bg-gray-50 p-2 rounded-md">
                  <span className="text-sm text-neutral-600">{getCategoryLabel(category)}</span>
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
          <TabsTrigger value="iibb">IIBB</TabsTrigger>
          <TabsTrigger value="provincial">Provinciales</TabsTrigger>
          <TabsTrigger value="municipal">Municipales</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-4">
          {filteredTaxes.length === 0 ? (
            <div className="text-center py-10 text-neutral-400">
              No hay impuestos para mostrar
            </div>
          ) : (
            <div className="space-y-6">
              {/* Mostrar impuestos agrupados por categoría */}
              {Object.entries(groupedTaxes).map(([category, subtypes]) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-medium text-lg text-neutral-700">{getCategoryLabel(category)}</h3>
                  
                  <Accordion type="multiple" className="space-y-3">
                    {Object.entries(subtypes as Record<string, any[]>).map(([subtype, taxes]) => (
                      <AccordionItem key={subtype} value={subtype} className="border rounded-md overflow-hidden">
                        <AccordionTrigger className="px-4 py-3 hover:bg-neutral-50">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span>{getSubtypeLabel(category, subtype)}</span>
                            <span className="text-blue-600 font-medium">
                              ${taxes.reduce((acc, tax) => acc + parseFloat(tax.amount), 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 p-2">
                            {taxes.map((tax: any) => (
                              <Card key={tax.id} className="overflow-hidden border-l-4 border-l-blue-500">
                                <div className="flex items-center p-3">
                                  <div className="flex-1">
                                    <div className="flex flex-col">
                                      <div className="flex items-center">
                                        <h4 className="font-medium text-neutral-800">
                                          {tax.description}
                                        </h4>
                                        {tax.code && (
                                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                            Código: {tax.code}
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-sm text-neutral-500 flex flex-wrap items-center gap-3">
                                        <span className="flex items-center">
                                          <i className="ri-calendar-line mr-1"></i>
                                          {format(new Date(tax.date), "dd/MM/yyyy")}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="pr-5 mr-3 border-r border-neutral-200">
                                    <span className="text-lg font-semibold text-blue-600">
                                      ${parseFloat(tax.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-1 pr-3">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleDelete(tax.id)}
                                    >
                                      <i className="ri-delete-bin-line text-lg"></i>
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}