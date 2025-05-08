import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, queryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { insertMachineFinanceSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// UI components
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetClose,
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
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Icons
import { ArrowLeft, Plus, Calendar, Upload, Camera, Trash2 } from "lucide-react";

// Definir el esquema de validación
const financeFormSchema = insertMachineFinanceSchema.extend({
  date: z.string().min(1, "La fecha es obligatoria"),
  type: z.string().min(1, "El tipo es obligatorio"),
  amount: z.string().min(1, "El monto es obligatorio"),
  concept: z.string().min(1, "El concepto es obligatorio"),
  paymentMethod: z.string().optional(),
  attachmentFile: z.string().optional(),
  capturedImage: z.instanceof(File).optional(),
});

// Tipo para los valores del formulario
type FinanceFormValues = z.infer<typeof financeFormSchema>;

export default function MachineFinancesPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useState<HTMLVideoElement | null>(null);
  const canvasRef = useState<HTMLCanvasElement | null>(null);
  const fileInputRef = useState<HTMLInputElement | null>(null);

  // Consulta para obtener la información de la máquina
  const { data: machine, isLoading: isLoadingMachine } = useQuery({
    queryKey: ["/api/machines", Number(id)],
    enabled: !!id
  });

  // Consulta para obtener las finanzas de la máquina
  const { data: finances, isLoading: isLoadingFinances } = useQuery({
    queryKey: ["/api/machine-finances", { machineId: Number(id) }],
    enabled: !!id
  });

  // Form para agregar nueva finanza
  const form = useForm<FinanceFormValues>({
    resolver: zodResolver(financeFormSchema),
    defaultValues: {
      machineId: Number(id),
      date: format(new Date(), "yyyy-MM-dd"),
      type: "",
      paymentMethod: "",
      concept: "",
      amount: "",
      machineType: "",
      originModule: "maquinarias",
      attachmentFile: "",
    },
  });

  // Cuando cambia la máquina, actualizamos el tipo de máquina en el formulario
  useEffect(() => {
    if (machine) {
      form.setValue("machineType", machine.type);
    }
  }, [machine, form]);

  // Mutación para crear una nueva finanza
  const createFinanceMutation = useMutation({
    mutationFn: async (data: FinanceFormValues) => {
      // Si hay una imagen capturada, primero subimos el archivo
      if (capturedImage || data.capturedImage) {
        const file = capturedImage || data.capturedImage;
        const formData = new FormData();
        formData.append("file", file as File);
        
        try {
          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          
          if (!uploadResponse.ok) {
            throw new Error("Error al subir el archivo");
          }
          
          const uploadResult = await uploadResponse.json();
          data.attachmentFile = uploadResult.filePath;
        } catch (error) {
          console.error("Error al subir el archivo:", error);
          // Si falla la subida del archivo, continuamos sin él
        }
      }
      
      // Limpiamos campos temporales
      const { capturedImage, ...dataToSend } = data;
      
      return apiRequest("/api/machine-finances", {
        method: "POST",
        data: dataToSend,
      });
    },
    onSuccess: () => {
      // Invalidamos la consulta para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ["/api/machine-finances"] });
      setIsAddSheetOpen(false);
      form.reset();
      setCapturedImage(null);
      setPreviewUrl(null);
      toast({
        title: "Finanza registrada",
        description: "La transacción financiera ha sido registrada exitosamente",
      });
    },
    onError: (error) => {
      console.error("Error al crear la finanza:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al registrar la transacción",
      });
    },
  });

  // Mutación para eliminar una finanza
  const deleteFinanceMutation = useMutation({
    mutationFn: (financeId: number) =>
      apiRequest(`/api/machine-finances/${financeId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/machine-finances"] });
      toast({
        title: "Finanza eliminada",
        description: "La transacción financiera ha sido eliminada exitosamente",
      });
    },
    onError: (error) => {
      console.error("Error al eliminar la finanza:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al eliminar la transacción",
      });
    },
  });

  const onSubmit = (data: FinanceFormValues) => {
    createFinanceMutation.mutate(data);
  };

  const handleDelete = (financeId: number) => {
    if (confirm("¿Estás seguro de eliminar esta transacción?")) {
      deleteFinanceMutation.mutate(financeId);
    }
  };

  // Función para manejar la carga de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCapturedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Función para activar la cámara
  const activateCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef[0]) {
        videoRef[0].srcObject = stream;
        videoRef[0].play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error("Error al acceder a la cámara: ", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo acceder a la cámara",
      });
    }
  };

  // Función para capturar foto
  const capturePhoto = () => {
    if (videoRef[0] && canvasRef[0]) {
      const video = videoRef[0];
      const canvas = canvasRef[0];
      const context = canvas.getContext("2d");
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "captura.jpg", { type: "image/jpeg" });
            setCapturedImage(file);
            setPreviewUrl(URL.createObjectURL(blob));
            
            // Detenemos la cámara
            stopCamera();
          }
        }, "image/jpeg");
      }
    }
  };

  // Función para detener la cámara
  const stopCamera = () => {
    if (videoRef[0]?.srcObject) {
      const stream = videoRef[0].srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef[0].srcObject = null;
    }
    setCameraActive(false);
  };

  const totalIncome = finances 
    ? finances
        .filter(f => f.type === "ingreso")
        .reduce((sum, f) => sum + parseFloat(f.amount), 0) 
    : 0;

  const totalExpense = finances 
    ? finances
        .filter(f => f.type === "egreso")
        .reduce((sum, f) => sum + parseFloat(f.amount), 0) 
    : 0;

  const balance = totalIncome - totalExpense;

  if (isLoadingMachine) {
    return (
      <div className="container py-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/machines">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Cargando...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/machines">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            Finanzas: {machine?.brand} {machine?.model}
          </h1>
        </div>
        <p className="text-muted-foreground">
          Gestiona los ingresos y egresos relacionados con esta máquina
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-3">
          <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <CardTitle className="text-lg">Resumen financiero</CardTitle>
            <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
              <SheetTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva transacción
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Registrar transacción financiera</SheetTitle>
                  <SheetDescription>
                    Ingresa los datos de la transacción relacionada con esta máquina
                  </SheetDescription>
                </SheetHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="date"
                                {...field}
                              />
                              <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            </div>
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
                          <FormLabel>Tipo *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ingreso">Ingreso</SelectItem>
                              <SelectItem value="egreso">Egreso</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
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
                                <SelectValue placeholder="Selecciona la forma de pago" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="efectivo">Efectivo</SelectItem>
                              <SelectItem value="deposito">Depósito</SelectItem>
                              <SelectItem value="transferencia">Transferencia</SelectItem>
                              <SelectItem value="cheque">Cheque</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="originModule"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Módulo de Origen</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                readOnly
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="machineType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Maquinaria</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                readOnly
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="concept"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Concepto *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej: Combustible, Repuestos, Alquiler..."
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
                          <FormLabel>Monto *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <Label>Adjuntar archivo/foto</Label>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          ref={(el) => fileInputRef[1] = el}
                          accept="image/*,application/pdf"
                        />
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => fileInputRef[0]?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Seleccionar archivo
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={activateCamera}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Capturar
                        </Button>
                      </div>
                      
                      {cameraActive && (
                        <div className="relative border rounded-md p-2 mt-2">
                          <video 
                            ref={(el) => videoRef[1] = el} 
                            width="100%" 
                            height="auto" 
                            className="rounded-md"
                          ></video>
                          <div className="flex justify-center mt-2">
                            <Button type="button" onClick={capturePhoto}>
                              Capturar foto
                            </Button>
                            <Button type="button" variant="outline" className="ml-2" onClick={stopCamera}>
                              Cancelar
                            </Button>
                          </div>
                          <canvas ref={(el) => canvasRef[1] = el} className="hidden"></canvas>
                        </div>
                      )}
                      
                      {previewUrl && (
                        <div className="relative border rounded-md p-2 mt-2">
                          <img 
                            src={previewUrl} 
                            alt="Vista previa" 
                            className="max-h-40 rounded-md mx-auto"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setCapturedImage(null);
                              setPreviewUrl(null);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <p className="text-xs text-center mt-2">
                            {capturedImage?.name || "Imagen capturada"}
                          </p>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        Adjunte una factura, recibo u otro documento relevante
                      </p>
                    </div>
                    
                    <SheetFooter className="flex flex-col sm:flex-row sm:justify-between pt-4">
                      <SheetClose asChild>
                        <Button type="button" variant="outline">
                          Cancelar
                        </Button>
                      </SheetClose>
                      <Button 
                        type="submit" 
                        disabled={createFinanceMutation.isPending}
                      >
                        {createFinanceMutation.isPending ? "Guardando..." : "Guardar"}
                      </Button>
                    </SheetFooter>
                  </form>
                </Form>
              </SheetContent>
            </Sheet>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-800">Ingresos totales</h3>
                <p className="text-2xl font-bold text-green-700">
                  ${totalIncome.toFixed(2)}
                </p>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <h3 className="text-sm font-medium text-red-800">Egresos totales</h3>
                <p className="text-2xl font-bold text-red-700">
                  ${totalExpense.toFixed(2)}
                </p>
              </div>
              <div className={cn(
                "border rounded-lg p-4",
                balance >= 0
                  ? "bg-blue-50 border-blue-100"
                  : "bg-amber-50 border-amber-100"
              )}>
                <h3 className={cn(
                  "text-sm font-medium",
                  balance >= 0 ? "text-blue-800" : "text-amber-800"
                )}>
                  Balance
                </h3>
                <p className={cn(
                  "text-2xl font-bold",
                  balance >= 0 ? "text-blue-700" : "text-amber-700"
                )}>
                  ${balance.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de transacciones</CardTitle>
          <CardDescription>
            Registro completo de ingresos y egresos de esta máquina
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingFinances ? (
            <div className="py-8 text-center">Cargando transacciones...</div>
          ) : finances && finances.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Forma Pago</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {finances.map((finance) => (
                  <TableRow key={finance.id}>
                    <TableCell>
                      {format(new Date(finance.date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={finance.type === "ingreso" ? "success" : "destructive"}>
                        {finance.type === "ingreso" ? "Ingreso" : "Egreso"}
                      </Badge>
                    </TableCell>
                    <TableCell>{finance.concept}</TableCell>
                    <TableCell>{finance.paymentMethod || "-"}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${parseFloat(finance.amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(finance.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No hay transacciones registradas para esta máquina.
              <div className="mt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddSheetOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar nueva transacción
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}