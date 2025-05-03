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

// Esquema para el formulario de impuestos
const taxFormSchema = z.object({
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  type: z.string({
    required_error: "El tipo es requerido",
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

// Esquema para el formulario de reparaciones
const repairFormSchema = z.object({
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

type InvestmentFormValues = z.infer<typeof investmentFormSchema>;
type ServiceFormValues = z.infer<typeof serviceFormSchema>;
type TaxFormValues = z.infer<typeof taxFormSchema>;
type RepairFormValues = z.infer<typeof repairFormSchema>;

export default function FinancialIndex() {
  const [selectedTab, setSelectedTab] = useState("investments");
  const [investmentTab, setInvestmentTab] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { toast } = useToast();

  // Consultar las inversiones
  const { data: investments, isLoading: investmentsLoading } = useQuery({
    queryKey: ["/api/investments"],
  });

  // Consultar los servicios
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/services"],
  });

  // Consultar los impuestos
  const { data: taxes, isLoading: taxesLoading } = useQuery({
    queryKey: ["/api/taxes"],
  });

  // Consultar las reparaciones
  const { data: repairs, isLoading: repairsLoading } = useQuery({
    queryKey: ["/api/repairs"],
  });

  // Filtrar inversiones según la pestaña activa
  const filteredInvestments = investments ? investments.filter((investment: any) => {
    if (investmentTab === "all") return true;
    return investment.type === investmentTab;
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

  // Formulario para inversiones
  const investmentForm = useForm<InvestmentFormValues>({
    resolver: zodResolver(investmentFormSchema),
    defaultValues: {
      date: new Date(),
      type: "machinery",
      description: "",
      amount: "",
      details: {},
    },
  });

  // Formulario para servicios
  const serviceForm = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      date: new Date(),
      type: "edesal",
      description: "",
      amount: "",
    },
  });

  // Formulario para impuestos
  const taxForm = useForm<TaxFormValues>({
    resolver: zodResolver(taxFormSchema),
    defaultValues: {
      date: new Date(),
      type: "municipal",
      code: "",
      description: "",
      amount: "",
    },
  });

  // Formulario para reparaciones
  const repairForm = useForm<RepairFormValues>({
    resolver: zodResolver(repairFormSchema),
    defaultValues: {
      date: new Date(),
      type: "construcciones",
      description: "",
      amount: "",
    },
  });

  // Obtener el tipo de inversión actual para mostrar campos adicionales
  const currentInvestmentType = investmentForm.watch("type");

  // Definir qué campos adicionales mostrar según el tipo
  const getDetailFields = () => {
    switch(currentInvestmentType) {
      case "machinery":
        return ["marca", "modelo", "año"];
      case "fencing":
        return ["mano_de_obra", "alambre", "postes", "horas_topadora"];
      case "construction":
        return ["materiales", "mano_de_obra"];
      case "clearing":
        return ["horas_topadora"];
      case "tools":
        return ["cantidad", "marca"];
      default:
        return [];
    }
  };

  // Función para manejar el envío del formulario de inversiones
  async function onInvestmentSubmit(values: InvestmentFormValues) {
    try {
      await apiRequest("POST", "/api/investments", values);

      // Invalidar consulta de inversiones
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      
      toast({
        title: "Inversión registrada",
        description: "La inversión ha sido registrada exitosamente",
      });
      
      setSheetOpen(false);
      investmentForm.reset();
      
    } catch (error) {
      console.error("Error creating investment:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar la inversión",
        variant: "destructive",
      });
    }
  }

  // Función para manejar la eliminación de inversiones
  async function handleInvestmentDelete(investmentId: number) {
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

  // Función para manejar el envío del formulario de servicios
  async function onServiceSubmit(values: ServiceFormValues) {
    try {
      await apiRequest("POST", "/api/services", values);

      // Invalidar consulta de servicios
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      
      toast({
        title: "Servicio registrado",
        description: "El servicio ha sido registrado exitosamente",
      });
      
      setSheetOpen(false);
      serviceForm.reset();
      
    } catch (error) {
      console.error("Error creating service:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el servicio",
        variant: "destructive",
      });
    }
  }

  // Función para manejar la eliminación de servicios
  async function handleServiceDelete(serviceId: number) {
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

  // Función para manejar el envío del formulario de impuestos
  async function onTaxSubmit(values: TaxFormValues) {
    try {
      await apiRequest("POST", "/api/taxes", values);

      // Invalidar consulta de impuestos
      queryClient.invalidateQueries({ queryKey: ["/api/taxes"] });
      
      toast({
        title: "Impuesto registrado",
        description: "El impuesto ha sido registrado exitosamente",
      });
      
      setSheetOpen(false);
      taxForm.reset();
      
    } catch (error) {
      console.error("Error creating tax:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el impuesto",
        variant: "destructive",
      });
    }
  }

  // Función para manejar la eliminación de impuestos
  async function handleTaxDelete(taxId: number) {
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

  // Función para manejar el envío del formulario de reparaciones
  async function onRepairSubmit(values: RepairFormValues) {
    try {
      await apiRequest("POST", "/api/repairs", values);

      // Invalidar consulta de reparaciones
      queryClient.invalidateQueries({ queryKey: ["/api/repairs"] });
      
      toast({
        title: "Reparación registrada",
        description: "La reparación ha sido registrada exitosamente",
      });
      
      setSheetOpen(false);
      repairForm.reset();
      
    } catch (error) {
      console.error("Error creating repair:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar la reparación",
        variant: "destructive",
      });
    }
  }

  // Función para manejar la eliminación de reparaciones
  async function handleRepairDelete(repairId: number) {
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

  // Obtener etiqueta para tipo de impuesto
  const getTaxTypeLabel = (type: string) => {
    switch(type) {
      case "municipal": return "Municipal";
      case "provincial": return "Provincial";
      default: return type;
    }
  };

  // Obtener etiqueta para tipo de reparación
  const getRepairTypeLabel = (type: string) => {
    switch(type) {
      case "construcciones": return "Construcciones";
      case "electricista": return "Electricista";
      case "albanil": return "Albañil";
      case "plomero": return "Plomero";
      case "materiales": return "Materiales";
      default: return type;
    }
  };

  // Obtener icono para tipo de reparación
  const getRepairTypeIcon = (type: string) => {
    switch(type) {
      case "construcciones": return "ri-building-line";
      case "electricista": return "ri-flashlight-line";
      case "albanil": return "ri-hammer-line";
      case "plomero": return "ri-drop-line";
      case "materiales": return "ri-box-3-line";
      default: return "ri-tools-line";
    }
  };

  if (investmentsLoading) {
    return <div className="py-10 text-center">Cargando datos financieros...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-header font-bold text-neutral-500">Gestión Financiera</h1>
          <p className="text-neutral-400 text-sm">
            Gestiona las finanzas del establecimiento
          </p>
        </div>
        
        <div>
          {selectedTab === "investments" && (
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
                
                <Form {...investmentForm}>
                  <form onSubmit={investmentForm.handleSubmit(onInvestmentSubmit)} className="space-y-4 py-4">
                    <FormField
                      control={investmentForm.control}
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
                      control={investmentForm.control}
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
                      control={investmentForm.control}
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
                    {getDetailFields().map((detailField) => (
                      <FormField
                        key={detailField}
                        control={investmentForm.control}
                        name={`details.${detailField}` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="capitalize">
                              {detailField.replace(/_/g, ' ')}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={detailField.replace(/_/g, ' ')}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                    
                    <FormField
                      control={investmentForm.control}
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
          )}
          
          {selectedTab === "services" && (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button className="mt-2 sm:mt-0">
                  <i className="ri-add-line mr-1"></i> Nuevo servicio
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Registrar servicio</SheetTitle>
                  <SheetDescription>
                    Complete los datos del nuevo servicio
                  </SheetDescription>
                </SheetHeader>
                
                <Form {...serviceForm}>
                  <form onSubmit={serviceForm.handleSubmit((values) => console.log(values))} className="space-y-4 py-4">
                    <FormField
                      control={serviceForm.control}
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
                      control={serviceForm.control}
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
                      control={serviceForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describa el servicio"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={serviceForm.control}
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
          )}
          
          {selectedTab === "taxes" && (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button className="mt-2 sm:mt-0">
                  <i className="ri-add-line mr-1"></i> Nuevo impuesto
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Registrar impuesto</SheetTitle>
                  <SheetDescription>
                    Complete los datos del nuevo impuesto
                  </SheetDescription>
                </SheetHeader>
                
                <Form {...taxForm}>
                  <form onSubmit={taxForm.handleSubmit((values) => console.log(values))} className="space-y-4 py-4">
                    <FormField
                      control={taxForm.control}
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
                      control={taxForm.control}
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
                              <SelectItem value="municipal">Municipal</SelectItem>
                              <SelectItem value="provincial">Provincial</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={taxForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Código del impuesto (opcional)"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={taxForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describa el impuesto"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={taxForm.control}
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
          )}
          
          {selectedTab === "repairs" && (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button className="mt-2 sm:mt-0">
                  <i className="ri-add-line mr-1"></i> Nueva reparación
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Registrar reparación</SheetTitle>
                  <SheetDescription>
                    Complete los datos de la nueva reparación
                  </SheetDescription>
                </SheetHeader>
                
                <Form {...repairForm}>
                  <form onSubmit={repairForm.handleSubmit((values) => console.log(values))} className="space-y-4 py-4">
                    <FormField
                      control={repairForm.control}
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
                      control={repairForm.control}
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
                              <SelectItem value="construcciones">Construcciones</SelectItem>
                              <SelectItem value="electricista">Electricista</SelectItem>
                              <SelectItem value="albanil">Albañil</SelectItem>
                              <SelectItem value="plomero">Plomero</SelectItem>
                              <SelectItem value="materiales">Materiales</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={repairForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describa la reparación"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={repairForm.control}
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
          )}
        </div>
      </div>
      
      {/* Resumen de inversiones si estamos en la pestaña de inversiones */}
      {selectedTab === "investments" && (
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
      )}
      
      {/* Pestañas principales de gestión financiera */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="investments">Inversiones</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="taxes">Impuestos</TabsTrigger>
          <TabsTrigger value="repairs">Reparaciones</TabsTrigger>
        </TabsList>
        
        {/* Sección de Inversiones */}
        <TabsContent value="investments">
          <Tabs defaultValue="all" onValueChange={setInvestmentTab}>
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="machinery">Maquinaria</TabsTrigger>
              <TabsTrigger value="fencing">Alambrados</TabsTrigger>
              <TabsTrigger value="construction">Construcciones</TabsTrigger>
              <TabsTrigger value="clearing">Desmonte</TabsTrigger>
              <TabsTrigger value="tools">Herramientas</TabsTrigger>
            </TabsList>
            
            <TabsContent value={investmentTab} className="mt-4">
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
                              onClick={() => handleInvestmentDelete(investment.id)}
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
                                {Object.entries(investment.details).map(([key, value]) => (
                                  <div key={key} className="bg-white p-2 rounded border border-neutral-200">
                                    <span className="text-xs text-neutral-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                                    <p className="text-sm font-medium text-neutral-800">{value as string}</p>
                                  </div>
                                ))}
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
        </TabsContent>
        
        {/* Sección de Servicios */}
        <TabsContent value="services">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
            <h2 className="text-xl font-semibold mb-4">Servicios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <i className="ri-flashlight-line mr-2 text-yellow-500"></i>
                    <span>EDESAL</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-500">
                    Servicio de electricidad
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <i className="ri-water-flash-line mr-2 text-blue-500"></i>
                    <span>Consorcio de regantes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-500">
                    Servicios de riego
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <i className="ri-drop-line mr-2 text-blue-400"></i>
                    <span>Agua potable</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-500">
                    Servicio de agua potable
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <i className="ri-wifi-line mr-2 text-green-500"></i>
                    <span>Internet</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-500">
                    Servicio de internet
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Sección de Impuestos */}
        <TabsContent value="taxes">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
            <h2 className="text-xl font-semibold mb-4">Impuestos</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Municipales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">IIBB</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-500">
                      Impuesto a los Ingresos Brutos
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Moratoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-500">
                      Plan de regularización
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Provinciales</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">25-1430-3</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-500">
                      Impuesto provincial
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">25-1711-6</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-500">
                      Impuesto provincial
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">19-1047104-4</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-500">
                      Impuesto provincial
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">19-1047105-2</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-500">
                      Impuesto provincial
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">19-1047106-a</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-500">
                      Impuesto provincial
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">19-1047102-8</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-500">
                      Impuesto provincial
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Moratoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-500">
                      Plan de regularización
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Municipales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Tasas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-500">
                      Tasas municipales
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Moratoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-500">
                      Plan de regularización
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Sección de Reparaciones */}
        <TabsContent value="repairs">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
            <h2 className="text-xl font-semibold mb-4">Reparaciones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <i className="ri-building-line mr-2 text-blue-500"></i>
                    <span>Construcciones</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-500">
                    Reparaciones de construcciones
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <i className="ri-flashlight-line mr-2 text-yellow-500"></i>
                    <span>Electricista</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-500">
                    Servicios de electricista
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <i className="ri-hammer-line mr-2 text-orange-500"></i>
                    <span>Albañil</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-500">
                    Servicios de albañilería
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <i className="ri-drop-line mr-2 text-blue-400"></i>
                    <span>Plomero</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-500">
                    Servicios de plomería
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <i className="ri-box-3-line mr-2 text-brown-500"></i>
                    <span>Materiales</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-500">
                    Materiales de construcción
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}