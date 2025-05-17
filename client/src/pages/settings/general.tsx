import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Loader2, Globe, Database, Settings, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Esquema de validación para la configuración general
const generalSettingsSchema = z.object({
  language: z.string(),
  region: z.string(),
  dateFormat: z.string(),
  timeFormat: z.string(),
  currency: z.string(),
  weightUnit: z.string(),
  areaUnit: z.string(),
  temperatureUnit: z.string(),
  autoSync: z.boolean().default(true),
  syncInterval: z.string().optional(),
  darkMode: z.boolean().default(false),
  reducedAnimations: z.boolean().default(false),
  highContrastMode: z.boolean().default(false),
  farmName: z.string().min(1, 'El nombre de la granja es obligatorio'),
  farmLocation: z.string().optional()
});

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;

const GeneralSettingsPage = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Formulario para configuración general
  const form = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      language: 'es-AR',
      region: 'AR',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      currency: 'ARS',
      weightUnit: 'kg',
      areaUnit: 'hectareas',
      temperatureUnit: 'celsius',
      autoSync: true,
      syncInterval: '5',
      darkMode: false,
      reducedAnimations: false,
      highContrastMode: false,
      farmName: 'Mi Establecimiento Agropecuario',
      farmLocation: 'Buenos Aires, Argentina'
    }
  });

  const onSubmit = async (data: GeneralSettingsValues) => {
    setIsSaving(true);
    setSettingsError(null);
    
    try {
      // Simulamos una llamada a la API para guardar la configuración
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Configuración guardada',
        description: 'Los cambios en la configuración han sido guardados correctamente',
        variant: 'default'
      });
      
      // Aquí normalmente actualizaríamos el tema y otras configuraciones en tiempo real
      // Por ejemplo:
      // if (data.darkMode !== currentTheme) {
      //   document.documentElement.classList.toggle('dark', data.darkMode);
      // }
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setSettingsError('No se pudieron guardar los cambios en la configuración');
      
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios en la configuración',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Configuración General</h1>
      
      <div className="grid gap-6">
        {settingsError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{settingsError}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Configuración Regional */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <CardTitle>Configuración Regional</CardTitle>
                </div>
                <CardDescription>
                  Configura el idioma, formato de fecha y otras preferencias regionales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idioma</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar idioma" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="es-AR">Español (Argentina)</SelectItem>
                            <SelectItem value="es-UY">Español (Uruguay)</SelectItem>
                            <SelectItem value="es-PY">Español (Paraguay)</SelectItem>
                            <SelectItem value="es-CL">Español (Chile)</SelectItem>
                            <SelectItem value="es-BO">Español (Bolivia)</SelectItem>
                            <SelectItem value="pt-BR">Portugués (Brasil)</SelectItem>
                            <SelectItem value="en-US">Inglés (EE.UU.)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Región</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar región" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AR">Argentina</SelectItem>
                            <SelectItem value="UY">Uruguay</SelectItem>
                            <SelectItem value="PY">Paraguay</SelectItem>
                            <SelectItem value="CL">Chile</SelectItem>
                            <SelectItem value="BO">Bolivia</SelectItem>
                            <SelectItem value="BR">Brasil</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="dateFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Formato de fecha</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar formato" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="timeFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Formato de hora</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar formato" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="24h">24 horas</SelectItem>
                            <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar moneda" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
                          <SelectItem value="UYU">Peso Uruguayo (UYU)</SelectItem>
                          <SelectItem value="PYG">Guaraní Paraguayo (PYG)</SelectItem>
                          <SelectItem value="CLP">Peso Chileno (CLP)</SelectItem>
                          <SelectItem value="BOB">Boliviano (BOB)</SelectItem>
                          <SelectItem value="BRL">Real Brasileño (BRL)</SelectItem>
                          <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* Unidades de Medida */}
            <Card>
              <CardHeader>
                <CardTitle>Unidades de Medida</CardTitle>
                <CardDescription>
                  Configura las unidades de medida preferidas para el sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="weightUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidad de peso</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar unidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                            <SelectItem value="lb">Libras (lb)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="areaUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidad de área</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar unidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hectareas">Hectáreas (ha)</SelectItem>
                            <SelectItem value="acres">Acres</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="temperatureUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidad de temperatura</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar unidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="celsius">Celsius (°C)</SelectItem>
                            <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Configuración de Sincronización */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <CardTitle>Sincronización</CardTitle>
                </div>
                <CardDescription>
                  Configura cómo y cuándo sincronizar datos con el servidor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="autoSync"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0 rounded-md border p-4">
                      <div>
                        <FormLabel>Sincronización automática</FormLabel>
                        <FormDescription>
                          Sincronizar automáticamente los datos cuando haya conexión
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {form.watch("autoSync") && (
                  <FormField
                    control={form.control}
                    name="syncInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intervalo de sincronización (minutos)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="60" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Frecuencia con la que se sincronizarán los datos cuando haya conexión
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
            
            {/* Configuración del Establecimiento */}
            <Card>
              <CardHeader>
                <CardTitle>Datos del Establecimiento</CardTitle>
                <CardDescription>
                  Información sobre tu establecimiento agropecuario
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="farmName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del establecimiento</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="farmLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Provincia/Departamento, País del establecimiento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* Accesibilidad */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <CardTitle>Accesibilidad</CardTitle>
                </div>
                <CardDescription>
                  Configura opciones de accesibilidad y visualización
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="darkMode"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0 rounded-md border p-4">
                      <div>
                        <FormLabel>Modo oscuro</FormLabel>
                        <FormDescription>
                          Usar tema oscuro en la aplicación
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reducedAnimations"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0 rounded-md border p-4">
                      <div>
                        <FormLabel>Reducir animaciones</FormLabel>
                        <FormDescription>
                          Minimiza las animaciones y transiciones
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="highContrastMode"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0 rounded-md border p-4">
                      <div>
                        <FormLabel>Modo de alto contraste</FormLabel>
                        <FormDescription>
                          Mejora el contraste para mayor legibilidad
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* Botón de guardar */}
            <CardFooter className="flex justify-end border rounded-lg p-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar configuración
              </Button>
            </CardFooter>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default GeneralSettingsPage;