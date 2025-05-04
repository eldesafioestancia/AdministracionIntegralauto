import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Esquema para el formulario de capital
const capitalFormSchema = z.object({
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  type: z.string({
    required_error: "El tipo es requerido",
  }).min(1, {
    message: "El tipo es requerido"
  }),
  partner: z.string({
    required_error: "El socio es requerido",
  }).min(1, {
    message: "El socio es requerido"
  }),
  amount: z.string({
    required_error: "El monto es requerido",
  }).min(1, {
    message: "El monto es requerido"
  }),
});

type CapitalFormValues = z.infer<typeof capitalFormSchema>;

export default function Capital() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // Consultar los registros de capital
  const { data: capitalRecords, isLoading } = useQuery({
    queryKey: ["/api/capital"],
  });

  const form = useForm<CapitalFormValues>({
    resolver: zodResolver(capitalFormSchema),
    defaultValues: {
      date: new Date(),
      type: "",
      partner: "",
      amount: "",
    },
  });

  // Opciones para tipos de transacciones
  const transactionTypes = [
    { value: "contribution", label: "Aporte" },
    { value: "withdrawal", label: "Retiro" },
  ];

  // Opciones para socios
  const partners = [
    { value: "juan_carlos", label: "Juan Carlos" },
    { value: "juan_alberto", label: "Juan Alberto" },
    { value: "nacho", label: "Nacho" },
  ];

  async function onSubmit(values: CapitalFormValues) {
    try {
      await apiRequest("POST", "/api/capital", values);

      // Invalidar consulta de capital
      queryClient.invalidateQueries({ queryKey: ["/api/capital"] });
      
      toast({
        title: "Registro guardado",
        description: "La transacción de capital ha sido registrada exitosamente",
      });
      
      setSheetOpen(false);
      form.reset();
      
    } catch (error) {
      console.error("Error creating capital record:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar la transacción de capital",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Está seguro de eliminar este registro de capital?")) return;
    
    try {
      await apiRequest("DELETE", `/api/capital/${id}`, {});
      
      // Invalidar consulta de capital
      queryClient.invalidateQueries({ queryKey: ["/api/capital"] });
      
      toast({
        title: "Registro eliminado",
        description: "El registro ha sido eliminado exitosamente",
      });
      
    } catch (error) {
      console.error("Error deleting capital record:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro",
        variant: "destructive",
      });
    }
  }

  // Filtrar por tipo
  const contributionRecords = capitalRecords && Array.isArray(capitalRecords)
    ? capitalRecords.filter((record: any) => record.type === "contribution")
    : [];
  
  const withdrawalRecords = capitalRecords && Array.isArray(capitalRecords)
    ? capitalRecords.filter((record: any) => record.type === "withdrawal")
    : [];

  // Filtrar por socio y tipo
  const getRecordsByPartner = (partner: string, type: string) => {
    if (!capitalRecords || !Array.isArray(capitalRecords)) return [];
    
    return capitalRecords.filter((record: any) => 
      record.partner === partner && record.type === type
    );
  };

  // Calcular saldos por socio
  const calculateBalanceByPartner = (partner: string) => {
    if (!capitalRecords || !Array.isArray(capitalRecords)) return 0;
    
    return capitalRecords.reduce((balance: number, record: any) => {
      if (record.partner !== partner) return balance;
      
      return record.type === "contribution" 
        ? balance + parseFloat(record.amount)
        : balance - parseFloat(record.amount);
    }, 0);
  };

  // Calcular saldo total
  const totalBalance = capitalRecords && Array.isArray(capitalRecords)
    ? capitalRecords.reduce((balance: number, record: any) => {
        return record.type === "contribution" 
          ? balance + parseFloat(record.amount)
          : balance - parseFloat(record.amount);
      }, 0)
    : 0;

  if (isLoading) {
    return <div className="py-10 text-center">Cargando datos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-header font-bold text-neutral-500">Capital</h1>
          <p className="text-neutral-400 text-sm">
            Gestiona los aportes y retiros de capital de los socios
          </p>
        </div>
        
        <div className="mt-2 sm:mt-0">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <i className="ri-add-line mr-1"></i> Nueva transacción
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Registrar transacción de capital</SheetTitle>
                <SheetDescription>
                  Complete los datos de la transacción
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
                        <FormLabel>Tipo de transacción</FormLabel>
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
                            {transactionTypes.map(type => (
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
                    name="partner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Socio</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un socio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {partners.map(partner => (
                              <SelectItem key={partner.value} value={partner.value}>
                                {partner.label}
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
                    <Button type="submit">Guardar transacción</Button>
                  </SheetFooter>
                </form>
              </Form>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Resumen de capital */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Capital</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-semibold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        {partners.map(partner => (
          <Card key={partner.value}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{partner.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-semibold ${calculateBalanceByPartner(partner.value) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${calculateBalanceByPartner(partner.value).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Acordeón de transacciones por tipo */}
      <div className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="contributions">
            <AccordionTrigger className="text-lg font-semibold">
              Aportes
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {partners.map(partner => (
                  <Accordion key={partner.value} type="single" collapsible className="w-full border rounded-lg px-4">
                    <AccordionItem value={`${partner.value}-contributions`}>
                      <AccordionTrigger className="text-base font-medium">
                        {partner.label}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-2">
                          {getRecordsByPartner(partner.value, 'contribution').length === 0 ? (
                            <p className="text-sm text-neutral-400 italic">No hay registros de aportes</p>
                          ) : (
                            getRecordsByPartner(partner.value, 'contribution').map((record: any) => (
                              <Card key={record.id} className="overflow-hidden">
                                <div className="flex items-center p-3">
                                  <div className="flex-1">
                                    <div className="flex flex-col">
                                      <div className="flex items-center">
                                        <span className="text-sm font-medium text-neutral-800">
                                          {format(new Date(record.date), "dd/MM/yyyy")}
                                        </span>
                                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                          Aporte
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="pr-5 mr-3 border-r border-neutral-200">
                                    <span className="text-lg font-semibold text-green-600">
                                      ${parseFloat(record.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-1 pr-3">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleDelete(record.id)}
                                    >
                                      <i className="ri-delete-bin-line text-lg"></i>
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="withdrawals">
            <AccordionTrigger className="text-lg font-semibold">
              Retiros
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {partners.map(partner => (
                  <Accordion key={partner.value} type="single" collapsible className="w-full border rounded-lg px-4">
                    <AccordionItem value={`${partner.value}-withdrawals`}>
                      <AccordionTrigger className="text-base font-medium">
                        {partner.label}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-2">
                          {getRecordsByPartner(partner.value, 'withdrawal').length === 0 ? (
                            <p className="text-sm text-neutral-400 italic">No hay registros de retiros</p>
                          ) : (
                            getRecordsByPartner(partner.value, 'withdrawal').map((record: any) => (
                              <Card key={record.id} className="overflow-hidden">
                                <div className="flex items-center p-3">
                                  <div className="flex-1">
                                    <div className="flex flex-col">
                                      <div className="flex items-center">
                                        <span className="text-sm font-medium text-neutral-800">
                                          {format(new Date(record.date), "dd/MM/yyyy")}
                                        </span>
                                        <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                          Retiro
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="pr-5 mr-3 border-r border-neutral-200">
                                    <span className="text-lg font-semibold text-red-600">
                                      ${parseFloat(record.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-1 pr-3">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleDelete(record.id)}
                                    >
                                      <i className="ri-delete-bin-line text-lg"></i>
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}