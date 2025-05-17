import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Finance form schema
const financeFormSchema = z.object({
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  type: z.enum(["income", "expense"], {
    required_error: "El tipo de registro es requerido",
  }),
  concept: z.string().min(1, { message: "El concepto es requerido" }),
  amount: z.string().min(1, { message: "El monto es requerido" }),
});

type FinanceFormValues = z.infer<typeof financeFormSchema>;

export default function MachineDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [financeDialogOpen, setFinanceDialogOpen] = useState(false);
  const numericId = parseInt(id);

  // Get machine details
  const { data: machine, isLoading: machineLoading, error: machineError } = useQuery({
    queryKey: [`/api/machines/${id}`],
  });

  // Get maintenance records
  const { data: maintenances, isLoading: maintenanceLoading, error: maintenanceError } = useQuery({
    queryKey: [`/api/maintenance?machineId=${id}`],
  });

  // Get financial records
  const { data: finances, isLoading: financesLoading, error: financesError } = useQuery({
    queryKey: [`/api/machine-finances?machineId=${id}`],
  });
  
  // Get work records (trabajos agrícolas)
  const { data: allPastureWorks, isLoading: worksLoading, error: worksError } = useQuery({
    queryKey: ["/api/pasture-works"],
  });
  
  // Get all pastures to display their names
  const { data: pastures, isLoading: pasturesLoading } = useQuery({
    queryKey: ["/api/pastures"],
  });
  
  // Filter works for this machine
  const machineWorks = allPastureWorks && Array.isArray(allPastureWorks) 
    ? allPastureWorks.filter((work) => work.machineId === numericId)
    : [];

  const financeForm = useForm<FinanceFormValues>({
    resolver: zodResolver(financeFormSchema),
    defaultValues: {
      date: new Date(),
      type: "expense",
      concept: "",
      amount: "",
    },
  });

  const getMachineTypeLabel = (type: string) => {
    switch (type) {
      case "tractor": return "Tractor";
      case "topadora": return "Topadora";
      case "camion": return "Camión";
      default: return type;
    }
  }
  
  const getMaintenanceTypeLabel = (type: string) => {
    switch (type) {
      case "pre_start_check": return "Control previo puesta en marcha";
      case "oil_filter_change": return "Cambio de aceite y filtros";
      case "maintenance_repair": return "Mantenimiento y reparación";
      default: return type;
    }
  };

  const getMachineImage = (type: string) => {
    switch (type) {
      case "tractor":
        return "https://images.unsplash.com/photo-1593613128698-1a5de600051a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80";
      case "topadora":
        return "https://images.unsplash.com/photo-1613046561926-371d5403d504?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80";
      case "camion":
        return "https://images.unsplash.com/photo-1626078427472-7811789ed2dc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80";
      default:
        return "https://images.unsplash.com/photo-1605654145610-2f65428be306?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80";
    }
  };

  // Handle new finance record submission
  async function onSubmitFinance(values: FinanceFormValues) {
    try {
      await apiRequest("POST", "/api/machine-finances", {
        ...values,
        machineId: numericId
      });

      // Invalidate finances query to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/machine-finances?machineId=${id}`] });

      toast({
        title: "Registro creado",
        description: "El registro financiero ha sido creado exitosamente",
      });

      setFinanceDialogOpen(false);
      financeForm.reset({
        date: new Date(),
        type: "expense",
        concept: "",
        amount: "",
      });

    } catch (error) {
      console.error("Error creating finance record:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el registro financiero",
        variant: "destructive",
      });
    }
  }

  if (machineLoading) {
    return <div className="py-10 text-center">Cargando información de la unidad...</div>;
  }

  if (machineError || !machine) {
    return (
      <div className="py-10 text-center">
        <div className="text-destructive mb-2">Error al cargar la unidad productiva</div>
        <Button
          variant="outline"
          onClick={() => navigate("/machines")}
        >
          Volver a la lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with machine info */}
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="md:w-1/3 h-64 md:h-auto relative">
          <img
            src={getMachineImage(machine.type)}
            alt={`${machine.brand} ${machine.model}`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6 md:w-2/3">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-header font-bold text-neutral-500">
                  {machine.brand} {machine.model}
                </h1>
                <Badge className="ml-3">{getMachineTypeLabel(machine.type)}</Badge>
              </div>
              <p className="text-neutral-400 mt-1">Año: {machine.year}</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/machines/${id}/maintenance`}>
                  <i className="ri-tools-line mr-1"></i> Mantenimiento
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <i className="ri-edit-line mr-1"></i> Editar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-neutral-50 p-3 rounded-md">
              <div className="text-sm text-neutral-400 mb-1">Horas de trabajo</div>
              <div className="text-lg font-semibold text-neutral-500">{machine.hours}</div>
            </div>
            <div className="bg-neutral-50 p-3 rounded-md">
              <div className="text-sm text-neutral-400 mb-1">Fecha de compra</div>
              <div className="text-lg font-semibold text-neutral-500">
                {format(new Date(machine.purchaseDate), "dd/MM/yyyy")}
              </div>
            </div>
            <div className="bg-neutral-50 p-3 rounded-md">
              <div className="text-sm text-neutral-400 mb-1">Próximo servicio</div>
              <div className="text-lg font-semibold text-neutral-500">
                {parseInt(machine.hours) + 500} hrs
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="bg-neutral-100 w-full rounded-full h-2.5">
              <div 
                className="bg-primary rounded-full h-2.5" 
                style={{ width: `${Math.min(100, (parseInt(machine.hours) % 500) / 5)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-neutral-400">Último servicio: {Math.floor(parseInt(machine.hours) / 500) * 500} hrs</span>
              <span className="text-neutral-400">Próximo: {Math.floor(parseInt(machine.hours) / 500) * 500 + 500} hrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for history */}
      <Tabs defaultValue="maintenance" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="maintenance">Historial de Mantenimiento</TabsTrigger>
          <TabsTrigger value="finances">Ingresos y Gastos</TabsTrigger>
          <TabsTrigger value="works">Trabajos Realizados</TabsTrigger>
        </TabsList>

        {/* Maintenance History Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-header font-semibold text-neutral-500">Historial de Mantenimiento</h2>
            <Button asChild>
              <Link href={`/machines/${id}/maintenance`}>
                <i className="ri-add-line mr-1"></i> Nuevo registro
              </Link>
            </Button>
          </div>

          {maintenanceLoading ? (
            <div className="text-center py-10">Cargando registros de mantenimiento...</div>
          ) : maintenanceError ? (
            <div className="text-center py-10 text-destructive">
              Error al cargar los registros de mantenimiento
            </div>
          ) : !maintenances || maintenances.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <i className="ri-tools-line text-4xl text-neutral-300 mb-2"></i>
                <h3 className="text-lg font-medium text-neutral-500 mb-1">No hay registros de mantenimiento</h3>
                <p className="text-neutral-400 mb-4">Registre el primer mantenimiento para esta unidad</p>
                <Button asChild>
                  <Link href={`/machines/${id}/maintenance`}>
                    <i className="ri-add-line mr-1"></i> Nuevo mantenimiento
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-neutral-500">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-500">Tipo</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-500">Detalles</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-500">Costo</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {maintenances.map((maintenance) => (
                    <tr key={maintenance.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                      <td className="py-3 px-4">{format(new Date(maintenance.date), "dd/MM/yyyy")}</td>
                      <td className="py-3 px-4">
                        <Badge className={
                          maintenance.type === "maintenance_repair" 
                            ? "bg-red-100 text-red-800" 
                            : "bg-blue-100 text-blue-800"
                        }>
                          {getMaintenanceTypeLabel(maintenance.type)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {maintenance.diagnosis ? maintenance.diagnosis.substring(0, 50) + "..." : 
                         maintenance.workshopName ? "Taller: " + maintenance.workshopName : 
                         "Conductor: " + (maintenance.driver || "No registrado")}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {maintenance.totalCost ? 
                          <span className="text-destructive">-${maintenance.totalCost}</span> : 
                          "N/A"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-neutral-400 hover:text-neutral-600"
                          onClick={() => navigate(`/machines/${id}/maintenance/${maintenance.id}`)}
                        >
                          <i className="ri-eye-line"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Finances Tab */}
        <TabsContent value="finances" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-header font-semibold text-neutral-500">Ingresos y Gastos</h2>
            <Dialog open={financeDialogOpen} onOpenChange={setFinanceDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <i className="ri-add-line mr-1"></i> Nuevo registro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar ingreso/gasto</DialogTitle>
                  <DialogDescription>
                    Complete los datos del nuevo registro financiero
                  </DialogDescription>
                </DialogHeader>

                <Form {...financeForm}>
                  <form onSubmit={financeForm.handleSubmit(onSubmitFinance)} className="space-y-4">
                    <FormField
                      control={financeForm.control}
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
                      control={financeForm.control}
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
                              <SelectItem value="income">Ingreso</SelectItem>
                              <SelectItem value="expense">Gasto</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={financeForm.control}
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
                              {financeForm.watch("type") === "income" ? (
                                <>
                                  <SelectItem value="alquiler">Alquiler</SelectItem>
                                  <SelectItem value="trabajo_agricola">Trabajo agrícola</SelectItem>
                                  <SelectItem value="venta">Venta</SelectItem>
                                  <SelectItem value="otro">Otro</SelectItem>
                                </>
                              ) : (
                                <>
                                  <SelectItem value="combustible">Combustible</SelectItem>
                                  <SelectItem value="repuestos">Repuestos</SelectItem>
                                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                                  <SelectItem value="seguro">Seguro</SelectItem>
                                  <SelectItem value="otro">Otro</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={financeForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monto</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button type="submit">Guardar</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {financesLoading ? (
            <div className="text-center py-10">Cargando registros financieros...</div>
          ) : financesError ? (
            <div className="text-center py-10 text-destructive">
              Error al cargar los registros financieros
            </div>
          ) : !finances || finances.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <i className="ri-bank-line text-4xl text-neutral-300 mb-2"></i>
                <h3 className="text-lg font-medium text-neutral-500 mb-1">No hay registros financieros</h3>
                <p className="text-neutral-400 mb-4">Registre el primer ingreso o gasto para esta unidad</p>
                <Button onClick={() => setFinanceDialogOpen(true)}>
                  <i className="ri-add-line mr-1"></i> Nuevo registro
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-neutral-500">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-500">Concepto</th>
                    <th className="py-3 px-4 font-medium text-neutral-500">Tipo</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-500">Monto</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {finances.map((finance) => (
                    <tr key={finance.id} className="border-b last:border-b-0 hover:bg-neutral-50">
                      <td className="py-3 px-4 text-sm text-neutral-500">
                        {format(new Date(finance.date), "dd/MM/yyyy")}
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-500">{finance.concept}</td>
                      <td className="py-3 px-4">
                        <Badge className={finance.type === "income" ? "bg-success" : "bg-destructive"}>
                          {finance.type === "income" ? "Ingreso" : "Gasto"}
                        </Badge>
                      </td>
                      <td className={`py-3 px-4 text-sm font-medium text-right ${
                        finance.type === "income" ? "text-success" : "text-destructive"
                      }`}>
                        {finance.type === "income" ? "+" : "-"}${finance.amount}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-neutral-400 hover:text-neutral-600"
                        >
                          <i className="ri-more-line"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Trabajos Realizados Tab */}
        <TabsContent value="works" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-header font-semibold text-neutral-500">Trabajos Realizados</h2>
            <Button asChild>
              <Link href={`/pastures?workForm=true&preSelectMachine=${id}`}>
                <i className="ri-add-line mr-1"></i> Nuevo trabajo
              </Link>
            </Button>
          </div>

          {worksLoading ? (
            <div className="text-center py-10">Cargando registros de trabajos agrícolas...</div>
          ) : worksError ? (
            <div className="text-center py-10 text-destructive">
              Error al cargar los trabajos agrícolas
            </div>
          ) : !machineWorks || machineWorks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <i className="ri-tractor-line text-4xl text-neutral-300 mb-2"></i>
                <h3 className="text-lg font-medium text-neutral-500 mb-1">No hay trabajos registrados</h3>
                <p className="text-neutral-400 mb-4">Registre el primer trabajo agrícola para esta máquina</p>
                <Button asChild>
                  <Link href={`/pastures?workForm=true&preSelectMachine=${id}`}>
                    <i className="ri-add-line mr-1"></i> Registrar trabajo
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-neutral-500">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-500">Tipo</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-500">Parcela</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-500">Área/Dist.</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-500">Costo</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {machineWorks.map((work) => (
                    <tr key={work.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                      <td className="py-3 px-4 whitespace-nowrap">
                        {format(new Date(work.startDate), "dd/MM/yyyy")}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {work.workType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {work.pastureId ? (
                          <Link href={`/pastures/${work.pastureId}`} className="text-primary hover:underline">
                            {pastures && Array.isArray(pastures) && 
                             pastures.find(p => p.id === work.pastureId)?.name || `Parcela #${work.pastureId}`}
                          </Link>
                        ) : (
                          "Sin parcela"
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {work.areaWorked ? `${work.areaWorked} Ha` : work.distance ? `${work.distance} Km` : "N/A"}
                      </td>
                      <td className="py-3 px-4 text-right text-neutral-600 font-medium">
                        {work.totalCost ? `$${work.totalCost}` : work.operativeCost ? `$${work.operativeCost}` : "N/A"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-neutral-400 hover:text-neutral-600"
                            onClick={() => navigate(`/machines/${id}/work?workId=${work.id}`)}
                          >
                            <i className="ri-eye-line"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-neutral-400 hover:text-blue-600"
                            asChild
                          >
                            <Link href={`/machines/${id}/work/edit/${work.id}`}>
                              <i className="ri-edit-line"></i>
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}