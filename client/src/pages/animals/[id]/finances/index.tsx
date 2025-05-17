import { useState } from "react";
import { useParams } from "wouter";
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
import { Badge } from "@/components/ui/badge";

// Esquema para el formulario de finanzas
const financeFormSchema = z.object({
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  type: z.string({
    required_error: "El tipo es requerido",
  }),
  concept: z.string({
    required_error: "El concepto es requerido",
  }).min(1, {
    message: "El concepto es requerido"
  }),
  animalIdentification: z.string().optional(),
  animalCategory: z.string().optional(),
  totalKg: z.string().optional(),
  pricePerKg: z.string().optional(),
  amount: z.string({
    required_error: "El monto es requerido",
  }).min(1, {
    message: "El monto es requerido"
  }),
});

type FinanceFormValues = z.infer<typeof financeFormSchema>;

export default function AnimalFinances() {
  const { id } = useParams<{ id: string }>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // Consultar los datos del animal
  const { data: animal, isLoading: isLoadingAnimal } = useQuery({
    queryKey: ["/api/animals", id],
  });

  // Consultar las finanzas del animal
  const { data: finances, isLoading: isLoadingFinances } = useQuery({
    queryKey: ["/api/animal-finances"],
    select: (data) => data.filter((finance: any) => finance.animalId === parseInt(id || "0")),
  });

  const form = useForm<FinanceFormValues>({
    resolver: zodResolver(financeFormSchema),
    defaultValues: {
      date: new Date(),
      type: "expense",
      concept: "",
      animalIdentification: "",
      animalCategory: "",
      totalKg: "",
      pricePerKg: "",
      amount: "",
    },
  });

  async function onSubmit(values: FinanceFormValues) {
    try {
      await apiRequest("POST", "/api/animal-finances", {
        ...values,
        animalId: parseInt(id || "0"),
      });

      // Invalidar consulta de finanzas
      queryClient.invalidateQueries({ queryKey: ["/api/animal-finances"] });
      
      toast({
        title: "Registro financiero creado",
        description: "El registro financiero ha sido creado exitosamente",
      });
      
      setSheetOpen(false);
      form.reset();
      
    } catch (error) {
      console.error("Error creating financial record:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el registro financiero",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(financeId: number) {
    if (!confirm("¿Está seguro de eliminar este registro financiero?")) return;
    
    try {
      await apiRequest("DELETE", `/api/animal-finances/${financeId}`, {});
      
      // Invalidar consulta de finanzas
      queryClient.invalidateQueries({ queryKey: ["/api/animal-finances"] });
      
      toast({
        title: "Registro eliminado",
        description: "El registro financiero ha sido eliminado exitosamente",
      });
      
    } catch (error) {
      console.error("Error deleting finance:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro financiero",
        variant: "destructive",
      });
    }
  }

  // Filtrar finanzas según la pestaña activa
  const filteredFinances = finances ? finances.filter((finance: any) => {
    if (activeTab === "all") return true;
    return finance.type === activeTab;
  }) : [];

  // Calcular totales
  const totals = finances ? finances.reduce((acc: any, finance: any) => {
    if (finance.type === "income") {
      acc.income += parseFloat(finance.amount);
    } else {
      acc.expense += parseFloat(finance.amount);
    }
    return acc;
  }, { income: 0, expense: 0 }) : { income: 0, expense: 0 };

  if (isLoadingAnimal || isLoadingFinances) {
    return <div className="py-10 text-center">Cargando datos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-header font-bold text-neutral-500 mr-2">
              Finanzas
            </h1>
            <Badge className="font-normal">#{animal?.cartagena}</Badge>
          </div>
          <p className="text-neutral-400 text-sm">
            Gestiona los ingresos y gastos asociados al animal
          </p>
        </div>
        
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button className="mt-2 sm:mt-0">
              <i className="ri-add-line mr-1"></i> Nuevo registro
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Agregar registro financiero</SheetTitle>
              <SheetDescription>
                Complete los datos del nuevo registro
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
                          <SelectItem value="expense">Gasto</SelectItem>
                          <SelectItem value="income">Ingreso</SelectItem>
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
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un concepto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {form.watch("type") === "expense" ? (
                            <>
                              <SelectItem value="senasa">Senasa</SelectItem>
                              <SelectItem value="vaccine">Vacuna</SelectItem>
                              <SelectItem value="vet">Veterinario</SelectItem>
                              <SelectItem value="food">Alimentación</SelectItem>
                              <SelectItem value="other">Otro</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="sale">Venta</SelectItem>
                              <SelectItem value="rent">Alquiler</SelectItem>
                              <SelectItem value="other">Otro</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("type") === "income" && form.watch("concept") === "sale" && (
                  <>
                    <FormField
                      control={form.control}
                      name="animalCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione una categoría" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ternero">Ternero</SelectItem>
                              <SelectItem value="novillo">Novillo</SelectItem>
                              <SelectItem value="vaquillona">Vaquillona</SelectItem>
                              <SelectItem value="vaca">Vaca</SelectItem>
                              <SelectItem value="toro">Toro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="totalKg"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kg Totales</FormLabel>
                            <FormControl>
                              <Input placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pricePerKg"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio por Kg</FormLabel>
                            <FormControl>
                              <Input placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}
                
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
                  <Button type="submit">Guardar registro</Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Resumen de finanzas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600">
              ${totals.income.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-red-600">
              ${totals.expense.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-semibold ${(totals.income - totals.expense) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(totals.income - totals.expense).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabla de finanzas */}
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="income">Ingresos</TabsTrigger>
          <TabsTrigger value="expense">Gastos</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-4">
          {filteredFinances.length === 0 ? (
            <div className="text-center py-10 text-neutral-400">
              No hay registros financieros para mostrar
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFinances.map((finance: any) => (
                <Card key={finance.id} className="p-0 overflow-hidden">
                  <div className="flex items-center">
                    <div 
                      className={`w-16 h-16 flex-shrink-0 flex items-center justify-center ${
                        finance.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      <i className={`text-2xl ${finance.type === 'income' ? 'ri-arrow-up-circle-line' : 'ri-arrow-down-circle-line'}`}></i>
                    </div>
                    
                    <div className="flex-1 px-4 py-3">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <h3 className="font-medium text-neutral-800">
                            {finance.concept === 'senasa' ? 'Senasa' :
                             finance.concept === 'vaccine' ? 'Vacuna' :
                             finance.concept === 'vet' ? 'Veterinario' :
                             finance.concept === 'food' ? 'Alimentación' :
                             finance.concept === 'sale' ? 'Venta' :
                             finance.concept === 'rent' ? 'Alquiler' : 'Otro'}
                          </h3>
                          <Badge className="ml-2 px-2 py-0 h-5" variant={finance.type === 'income' ? 'default' : 'destructive'}>
                            {finance.type === 'income' ? 'Ingreso' : 'Gasto'}
                          </Badge>
                        </div>
                        <div className="text-sm text-neutral-500 flex flex-wrap items-center gap-3">
                          <span className="flex items-center">
                            <i className="ri-calendar-line mr-1"></i>
                            {format(new Date(finance.date), "dd/MM/yyyy")}
                          </span>
                          
                          {finance.animalCategory && (
                            <span className="flex items-center">
                              <i className="ri-price-tag-3-line mr-1"></i>
                              {finance.animalCategory === 'ternero' ? 'Ternero' :
                               finance.animalCategory === 'novillo' ? 'Novillo' :
                               finance.animalCategory === 'vaquillona' ? 'Vaquillona' :
                               finance.animalCategory === 'vaca' ? 'Vaca' :
                               finance.animalCategory === 'toro' ? 'Toro' : finance.animalCategory}
                            </span>
                          )}
                          
                          {finance.totalKg && (
                            <span className="flex items-center">
                              <i className="ri-scales-line mr-1"></i>
                              {finance.totalKg} kg
                            </span>
                          )}
                          
                          {finance.pricePerKg && (
                            <span className="flex items-center">
                              <i className="ri-money-dollar-circle-line mr-1"></i>
                              ${finance.pricePerKg}/kg
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="pr-5 mr-4 border-r border-neutral-200">
                      <span className={`text-lg font-semibold ${finance.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        ${parseFloat(finance.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <div className="pr-3">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(finance.id)}
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