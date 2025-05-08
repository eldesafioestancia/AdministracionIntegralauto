import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// Esquema de validación usando Zod
const financeFormSchema = z.object({
  date: z.date({
    required_error: "Por favor seleccione una fecha",
  }),
  type: z.string({
    required_error: "Por favor seleccione un tipo",
  }),
  paymentMethod: z.string({
    required_error: "Por favor seleccione un método de pago",
  }),
  originModule: z.string().optional(),
  machineType: z.string().optional(),
  concept: z.string({
    required_error: "El concepto es requerido",
  }).min(3, "El concepto debe tener al menos 3 caracteres"),
  amount: z.string({
    required_error: "El monto es requerido",
  }).refine((val) => !isNaN(Number(val)), {
    message: "El monto debe ser un número válido",
  }),
  attachmentFile: z.string().optional(),
});

type FinanceFormValues = z.infer<typeof financeFormSchema>;

interface MachineFinanceFormProps {
  machineId: number;
  onSuccess?: () => void;
}

const MachineFinanceForm: React.FC<MachineFinanceFormProps> = ({ machineId, onSuccess }) => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<FinanceFormValues>({
    resolver: zodResolver(financeFormSchema),
    defaultValues: {
      date: new Date(),
      type: "expense",
      paymentMethod: "cash",
      originModule: "",
      machineType: "",
      concept: "",
      amount: "",
      attachmentFile: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FinanceFormValues) => {
      return await apiRequest('/api/machine-finances', 'POST', {
        ...data,
        machineId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Registro financiero creado",
        description: "El registro financiero ha sido creado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/machine-finances'] });
      form.reset();
      setUploadedFile(null);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Error creando registro financiero:", error);
      toast({
        title: "Error",
        description: "Hubo un error al crear el registro financiero",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir archivo');
      }

      const data = await response.json();
      setUploadedFile(data.filePath);
      form.setValue('attachmentFile', data.filePath);
    } catch (error) {
      console.error('Error al subir archivo:', error);
      setUploadError('Error al subir el archivo. Intente nuevamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: FinanceFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Seleccione una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipo (Ingreso/Egreso) */}
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
                    <SelectItem value="income">Ingreso</SelectItem>
                    <SelectItem value="expense">Egreso</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Método de pago */}
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Método de pago</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione método de pago" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="deposit">Depósito</SelectItem>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                    <SelectItem value="check">Cheque</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Módulo de origen */}
          <FormField
            control={form.control}
            name="originModule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Módulo de origen (opcional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione módulo de origen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="maintenance">Mantenimiento</SelectItem>
                    <SelectItem value="repair">Reparación</SelectItem>
                    <SelectItem value="operation">Operación</SelectItem>
                    <SelectItem value="purchase">Compra</SelectItem>
                    <SelectItem value="sale">Venta</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Concepto */}
          <FormField
            control={form.control}
            name="concept"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Concepto</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describa el concepto del movimiento financiero"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Monto */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto ($)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Carga de archivo */}
          <div className="col-span-1 md:col-span-2">
            <FormLabel className="block mb-2">Adjuntar comprobante (opcional)</FormLabel>
            <div className="flex items-center space-x-2">
              <label className="cursor-pointer">
                <div className="flex items-center justify-center gap-2 px-4 py-2 border rounded-md bg-gray-50 hover:bg-gray-100">
                  <Upload size={18} />
                  <span>Seleccionar archivo</span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
              {isUploading && <span className="text-sm text-muted-foreground">Subiendo...</span>}
              {uploadedFile && <span className="text-sm text-green-600">Archivo subido correctamente</span>}
              {uploadError && <span className="text-sm text-red-600">{uploadError}</span>}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={mutation.isPending || isUploading}
          >
            {mutation.isPending ? "Guardando..." : "Guardar registro"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MachineFinanceForm;