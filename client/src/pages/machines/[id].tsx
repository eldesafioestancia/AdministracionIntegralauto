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
  type: z.enum(["income", "expense", "reference"], {
    required_error: "El tipo de registro es requerido",
  }),
  paymentMethod: z.string().optional(),
  originModule: z.string().default("Maquinarias"),
  machineType: z.string().optional(),
  machineBrandModel: z.string().optional(),
  warehouseProductId: z.number().optional().nullable(),
  quantity: z.string().optional(),
  unitPrice: z.string().optional(),
  concept: z.string().min(1, { message: "El concepto es requerido" }),
  amount: z.string().min(1, { message: "El monto es requerido" }),
  attachmentUrl: z.string().optional(),
  notes: z.string().optional(),
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

  // Get warehouse products
  const { data: warehouseProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/warehouse/products'],
  });

  const financeForm = useForm<FinanceFormValues>({
    resolver: zodResolver(financeFormSchema),
    defaultValues: {
      date: new Date(),
      type: "expense",
      paymentMethod: "Efectivo",
      originModule: "Maquinarias",
      machineType: machine?.type || "",
      machineBrandModel: machine ? `${machine.brand} ${machine.model}` : "",
      warehouseProductId: null,
      quantity: "",
      unitPrice: "",
      concept: "",
      amount: "",
      attachmentUrl: "",
      notes: "",
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
        paymentMethod: "Efectivo",
        originModule: "Maquinarias",
        machineType: machine?.type || "",
        machineBrandModel: machine ? `${machine.brand} ${machine.model}` : "",
        warehouseProductId: null,
        quantity: "",
        unitPrice: "",
        concept: "",
        amount: "",
        attachmentUrl: "",
        notes: "",
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
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="maintenance">Historial de Mantenimiento</TabsTrigger>
          <TabsTrigger value="finances">Ingresos y Gastos</TabsTrigger>
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
            <div className="space-y-4">
              {maintenances.map((maintenance) => (
                <Card key={maintenance.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{getMaintenanceTypeLabel(maintenance.type)}</CardTitle>
                      <Badge variant="outline">
                        {format(new Date(maintenance.date), "dd/MM/yyyy")}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          {maintenance.time && `Hora: ${maintenance.time}`}
                        </div>
                        {maintenance.isModified && 
                          <div className="text-amber-500 flex items-center">
                            <i className="ri-edit-line mr-1"></i>
                            <span>Modificado</span>
                          </div>
                        }
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {maintenance.type === "maintenance_repair" ? (
                      <div className="space-y-3">
                        {maintenance.workshopName && (
                          <div className="mb-4">
                            <div className="font-medium text-neutral-600 mb-1">Taller:</div>
                            <div className="text-sm text-neutral-500">{maintenance.workshopName}</div>
                            {maintenance.workshopPhone && (
                              <div className="text-sm text-neutral-500">Tel: {maintenance.workshopPhone}</div>
                            )}
                            {maintenance.workshopAddress && (
                              <div className="text-sm text-neutral-500">{maintenance.workshopAddress}</div>
                            )}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {maintenance.electricalSystem && (
                            <div className="flex items-center">
                              <i className="ri-checkbox-circle-line text-success mr-1"></i>
                              <span className="text-sm">Eléctrico</span>
                            </div>
                          )}
                          {maintenance.mechanicalSystem && (
                            <div className="flex items-center">
                              <i className="ri-checkbox-circle-line text-success mr-1"></i>
                              <span className="text-sm">Mecánico</span>
                            </div>
                          )}
                          {maintenance.frontAxle && (
                            <div className="flex items-center">
                              <i className="ri-checkbox-circle-line text-success mr-1"></i>
                              <span className="text-sm">Tren delantero</span>
                            </div>
                          )}
                          {maintenance.gearbox && (
                            <div className="flex items-center">
                              <i className="ri-checkbox-circle-line text-success mr-1"></i>
                              <span className="text-sm">Caja</span>
                            </div>
                          )}
                          {maintenance.differential && (
                            <div className="flex items-center">
                              <i className="ri-checkbox-circle-line text-success mr-1"></i>
                              <span className="text-sm">Diferencial</span>
                            </div>
                          )}
                          {maintenance.hydraulicSystem && (
                            <div className="flex items-center">
                              <i className="ri-checkbox-circle-line text-success mr-1"></i>
                              <span className="text-sm">Hidráulico</span>
                            </div>
                          )}
                          {maintenance.brakes && (
                            <div className="flex items-center">
                              <i className="ri-checkbox-circle-line text-success mr-1"></i>
                              <span className="text-sm">Frenos</span>
                            </div>
                          )}
                        </div>
                        
                        {maintenance.diagnosis && (
                          <div className="mt-3">
                            <div className="font-medium text-neutral-600 mb-1">Diagnóstico:</div>
                            <div className="text-sm text-neutral-500 bg-neutral-50 p-2 rounded border">
                              {maintenance.diagnosis}
                            </div>
                          </div>
                        )}
                        
                        {(maintenance.spareParts || maintenance.labor || maintenance.totalCost) && (
                          <div className="mt-3 border-t pt-3">
                            <div className="font-medium text-neutral-600 mb-2">Costos:</div>
                            
                            {maintenance.spareParts && (
                              <div className="flex items-start gap-2 mb-2">
                                <div className="text-sm font-medium text-neutral-600 min-w-[80px]">Repuestos:</div>
                                <div className="text-sm text-neutral-500">
                                  <div>{maintenance.spareParts}</div>
                                  {maintenance.sparePartsCost && (
                                    <div className="font-medium">$ {maintenance.sparePartsCost}</div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {maintenance.labor && (
                              <div className="flex items-start gap-2 mb-2">
                                <div className="text-sm font-medium text-neutral-600 min-w-[80px]">Mano de obra:</div>
                                <div className="text-sm text-neutral-500">
                                  <div>{maintenance.labor}</div>
                                  {maintenance.laborCost && (
                                    <div className="font-medium">$ {maintenance.laborCost}</div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {maintenance.totalCost && (
                              <div className="flex justify-end mt-2 pt-2 border-t">
                                <div className="text-sm font-medium">Total: $ {maintenance.totalCost}</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                        {maintenance.motorOil && (
                          <div className="flex items-center">
                            <i className="ri-checkbox-circle-line text-success mr-1"></i>
                            <span className="text-sm">Aceite motor: {maintenance.motorOilQuantity}L</span>
                          </div>
                        )}
                        {maintenance.hydraulicOil && (
                          <div className="flex items-center">
                            <i className="ri-checkbox-circle-line text-success mr-1"></i>
                            <span className="text-sm">Aceite hidráulico: {maintenance.hydraulicOilQuantity}L</span>
                          </div>
                        )}
                        {maintenance.coolant && (
                          <div className="flex items-center">
                            <i className="ri-checkbox-circle-line text-success mr-1"></i>
                            <span className="text-sm">Refrigerante: {maintenance.coolantQuantity}L</span>
                          </div>
                        )}
                        {maintenance.oilFilter && (
                          <div className="flex items-center">
                            <i className="ri-checkbox-circle-line text-success mr-1"></i>
                            <span className="text-sm">Filtro de aceite</span>
                          </div>
                        )}
                        {maintenance.hydraulicFilter && (
                          <div className="flex items-center">
                            <i className="ri-checkbox-circle-line text-success mr-1"></i>
                            <span className="text-sm">Filtro hidráulico</span>
                          </div>
                        )}
                        {maintenance.fuelFilter && (
                          <div className="flex items-center">
                            <i className="ri-checkbox-circle-line text-success mr-1"></i>
                            <span className="text-sm">Filtro de combustible</span>
                          </div>
                        )}
                        {maintenance.airFilter && (
                          <div className="flex items-center">
                            <i className="ri-checkbox-circle-line text-success mr-1"></i>
                            <span className="text-sm">Filtro de aire</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-between">
                      <div className="text-sm text-neutral-400">
                        <div>
                          {maintenance.driver && (
                            <span>Conductor: <span className="text-neutral-500">{maintenance.driver}</span></span>
                          )}
                        </div>
                        <div className="flex flex-col mt-2">
                          <span>Creado: <span className="text-neutral-500">
                            {format(new Date(maintenance.createdAt), "dd/MM/yyyy HH:mm")}
                          </span></span>
                          {maintenance.isModified && maintenance.modifiedAt && (
                            <span>Modificado: <span className="text-neutral-500">
                              {format(new Date(maintenance.modifiedAt), "dd/MM/yyyy HH:mm")}
                            </span></span>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/machines/${id}/maintenance/${maintenance.id}`}>
                          <i className="ri-edit-line mr-1"></i> Editar
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                    {/* Fecha */}
                    <FormField
                      control={financeForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha *</FormLabel>
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

                    {/* Tipo de transacción */}
                    <FormField
                      control={financeForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo *</FormLabel>
                          <div className="text-xs text-slate-500 mb-2">
                            Seleccione "Ingreso" para aumentar inventario, "Egreso" para disminuir, o "Referencia" para transacciones informativas sin impacto en inventario.
                          </div>
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
                              <SelectItem value="expense">Egreso</SelectItem>
                              <SelectItem value="reference">Referencia</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Forma de Pago */}
                    <FormField
                      control={financeForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Forma de Pago</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione forma de pago" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Efectivo">Efectivo</SelectItem>
                              <SelectItem value="Transferencia">Transferencia</SelectItem>
                              <SelectItem value="Cheque">Cheque</SelectItem>
                              <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                              <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Módulo de Origen */}
                    <FormField
                      control={financeForm.control}
                      name="originModule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Módulo de Origen</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione módulo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Maquinarias">Maquinarias</SelectItem>
                              <SelectItem value="Animales">Animales</SelectItem>
                              <SelectItem value="Pasturas">Pasturas</SelectItem>
                              <SelectItem value="Depósito">Depósito</SelectItem>
                              <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tipo de Maquinaria */}
                    <FormField
                      control={financeForm.control}
                      name="machineType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Maquinaria</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="tractor">Tractor</SelectItem>
                              <SelectItem value="camion">Camión</SelectItem>
                              <SelectItem value="topadora">Topadora</SelectItem>
                              <SelectItem value="sembradora">Sembradora</SelectItem>
                              <SelectItem value="cosechadora">Cosechadora</SelectItem>
                              <SelectItem value="vehiculo">Vehículo</SelectItem>
                              <SelectItem value="accesorio">Accesorio</SelectItem>
                              <SelectItem value="otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Marca y Modelo */}
                    <FormField
                      control={financeForm.control}
                      name="machineBrandModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marca y Modelo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Deutz ax180" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Producto de Depósito */}
                    <FormField
                      control={financeForm.control}
                      name="warehouseProductId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Producto de Depósito</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                            value={field.value ? field.value.toString() : ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar producto" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Ninguno</SelectItem>
                              {warehouseProducts && warehouseProducts.map((product) => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                  {product.name} - {product.stock} {product.unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Grid para Cantidad y Precio Unitario */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Cantidad */}
                      <FormField
                        control={financeForm.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Ingrese cantidad"
                                {...field}
                                onChange={(e) => {
                                  // Solo permitir números y punto decimal
                                  const value = e.target.value.replace(/[^\d.]/g, '');
                                  field.onChange(value);
                                  
                                  // Actualizar monto automáticamente si hay precio unitario
                                  const priceValue = financeForm.getValues("unitPrice");
                                  if (priceValue && value) {
                                    const totalAmount = (parseFloat(priceValue) * parseFloat(value)).toFixed(2);
                                    financeForm.setValue("amount", totalAmount);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Precio Unitario */}
                      <FormField
                        control={financeForm.control}
                        name="unitPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio Unitario</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Precio por unidad"
                                {...field}
                                onChange={(e) => {
                                  // Solo permitir números y punto decimal
                                  const value = e.target.value.replace(/[^\d.]/g, '');
                                  field.onChange(value);
                                  
                                  // Actualizar monto automáticamente si hay cantidad
                                  const quantityValue = financeForm.getValues("quantity");
                                  if (quantityValue && value) {
                                    const totalAmount = (parseFloat(value) * parseFloat(quantityValue)).toFixed(2);
                                    financeForm.setValue("amount", totalAmount);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Monto */}
                    <FormField
                      control={financeForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monto *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="$0.00"
                              {...field}
                              onChange={(e) => {
                                // Solo permitir números y punto decimal
                                const value = e.target.value.replace(/[^\d.]/g, '');
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Concepto */}
                    <FormField
                      control={financeForm.control}
                      name="concept"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Concepto *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Repuestos, Combustible, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Notas adicionales */}
                    <FormField
                      control={financeForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas</FormLabel>
                          <FormControl>
                            <textarea
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Notas adicionales..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFinanceDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
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
                <i className="ri-money-dollar-circle-line text-4xl text-neutral-300 mb-2"></i>
                <h3 className="text-lg font-medium text-neutral-500 mb-1">No hay registros financieros</h3>
                <p className="text-neutral-400 mb-4">Registre el primer ingreso o gasto para esta unidad</p>
                <Button onClick={() => setFinanceDialogOpen(true)}>
                  <i className="ri-add-line mr-1"></i> Nuevo registro
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 text-sm font-medium text-neutral-500">Fecha</th>
                        <th className="text-left p-4 text-sm font-medium text-neutral-500">Concepto</th>
                        <th className="text-left p-4 text-sm font-medium text-neutral-500">Tipo</th>
                        <th className="text-left p-4 text-sm font-medium text-neutral-500">F. Pago</th>
                        <th className="text-left p-4 text-sm font-medium text-neutral-500">Producto</th>
                        <th className="text-right p-4 text-sm font-medium text-neutral-500">Monto</th>
                        <th className="p-4 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {finances.map((finance) => (
                        <tr key={finance.id} className="border-b last:border-b-0 hover:bg-neutral-50">
                          <td className="p-4 text-sm text-neutral-500">
                            {format(new Date(finance.date), "dd/MM/yyyy")}
                          </td>
                          <td className="p-4 text-sm text-neutral-500">{finance.concept}</td>
                          <td className="p-4">
                            <Badge 
                              className={
                                finance.type === "income" 
                                  ? "bg-success" 
                                  : finance.type === "expense" 
                                    ? "bg-destructive" 
                                    : "bg-neutral-400"
                              }
                            >
                              {finance.type === "income" 
                                ? "Ingreso" 
                                : finance.type === "expense" 
                                  ? "Egreso" 
                                  : "Referencia"
                              }
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-neutral-500">
                            {finance.paymentMethod || "-"}
                          </td>
                          <td className="p-4 text-sm text-neutral-500">
                            {finance.warehouseProductId 
                              ? warehouseProducts?.find(p => p.id === finance.warehouseProductId)?.name || "Producto" 
                              : "-"
                            }
                          </td>
                          <td className={`p-4 text-sm font-medium text-right ${
                            finance.type === "income" 
                              ? "text-success" 
                              : finance.type === "expense" 
                                ? "text-destructive" 
                                : "text-neutral-500"
                          }`}>
                            {finance.type === "income" 
                              ? "+" 
                              : finance.type === "expense" 
                                ? "-" 
                                : ""
                            }${finance.amount}
                          </td>
                          <td className="p-4">
                            <Button variant="ghost" size="sm">
                              <i className="ri-more-line"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}