import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Database, AlertTriangle, Save, Trash2, RefreshCw, FileDown, FileUp } from 'lucide-react';
import axios from 'axios';

// Esquema de validación para confirmación
const confirmResetSchema = z.object({
  confirmText: z.string().refine(val => val === 'CONFIRMAR', {
    message: "Debe escribir 'CONFIRMAR' para continuar"
  })
});

// Esquema para respaldo
const backupSchema = z.object({
  backupName: z.string().min(1, 'Ingrese un nombre para el respaldo'),
  description: z.string().optional()
});

type ConfirmResetFormValues = z.infer<typeof confirmResetSchema>;
type BackupFormValues = z.infer<typeof backupSchema>;

// Módulos disponibles para resetear
const resetableModules = [
  { id: 'all', name: 'Todos los datos' },
  { id: 'animals', name: 'Animales' },
  { id: 'machines', name: 'Maquinarias' },
  { id: 'pastures', name: 'Pasturas' },
  { id: 'finances', name: 'Finanzas' },
  { id: 'warehouse', name: 'Depósito' },
  { id: 'employees', name: 'Empleados' },
  { id: 'investments', name: 'Inversiones' }
];

const DatabaseSettingsPage = () => {
  const { toast } = useToast();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [isOpened, setIsOpened] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [databaseStats, setDatabaseStats] = useState({
    totalRecords: 0,
    tablesCount: 0,
    dbSize: '0 MB',
    lastBackup: 'Nunca',
    dataModified: 'Desconocido'
  });

  // Formulario para confirmar reseteo
  const confirmForm = useForm<ConfirmResetFormValues>({
    resolver: zodResolver(confirmResetSchema),
    defaultValues: {
      confirmText: ''
    }
  });

  // Formulario para crear respaldo
  const backupForm = useForm<BackupFormValues>({
    resolver: zodResolver(backupSchema),
    defaultValues: {
      backupName: `respaldo_${new Date().toISOString().split('T')[0]}`,
      description: ''
    }
  });

  // Simular obtención de estadísticas de la BD
  useState(() => {
    // En una implementación real, esto vendría de una API
    setDatabaseStats({
      totalRecords: 12547,
      tablesCount: 24,
      dbSize: '45.8 MB',
      lastBackup: '17/05/2025 14:30',
      dataModified: '17/05/2025 19:15'
    });
  });

  // Manejar reseteo de datos
  const handleResetData = async (data: ConfirmResetFormValues) => {
    if (!selectedModule) {
      toast({
        title: 'Error',
        description: 'Seleccione un módulo para resetear',
        variant: 'destructive'
      });
      return;
    }

    setIsResetting(true);

    try {
      // Según el módulo seleccionado, llamar al endpoint específico
      if (selectedModule === 'animals') {
        // Endpoint específico para reset de animales
        const response = await fetch('/api/database/reset-animals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }

        const result = await response.json();
        console.log('Respuesta del servidor:', result);

        if (result.success) {
          toast({
            title: 'Datos de animales reseteados correctamente',
            description: `Se eliminaron ${result.stats.animalesEliminados} animales, ${result.stats.registrosVeterinariosEliminados} registros veterinarios, ${result.stats.registrosFinancierosEliminados} registros financieros y ${result.stats.registrosPesosEliminados} registros de pesos.`,
            variant: 'default'
          });
        } else {
          throw new Error(result.message || 'Error desconocido');
        }
      } else {
        // Para otros módulos, endpoint genérico (simulado por ahora)
        console.log(`Reiniciando módulo: ${selectedModule}`);
        
        // Simular una llamada para otros módulos por ahora
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: 'Datos reseteados correctamente',
          description: selectedModule === 'all' 
            ? 'Todos los datos del sistema han sido reseteados'
            : `Los datos del módulo ${resetableModules.find(m => m.id === selectedModule)?.name} han sido reseteados`,
          variant: 'default'
        });
      }

      // Resetear el formulario y cerrar el diálogo
      confirmForm.reset();
      setIsOpened(false);
      setSelectedModule(null);
    } catch (error) {
      console.error('Error reiniciando datos:', error);
      toast({
        title: 'Error',
        description: `No se pudieron resetear los datos: ${(error as Error).message}`,
        variant: 'destructive'
      });
    } finally {
      setIsResetting(false);
    }
  };

  // Manejar creación de respaldo
  const handleCreateBackup = async (data: BackupFormValues) => {
    setIsCreatingBackup(true);

    try {
      // En una implementación real, esto sería una llamada a la API
      // Simulamos la llamada con un setTimeout
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Respaldo creado',
        description: `El respaldo "${data.backupName}" ha sido creado correctamente`,
        variant: 'default'
      });

      // Actualizar la fecha del último respaldo
      setDatabaseStats(prev => ({
        ...prev,
        lastBackup: new Date().toLocaleString('es-AR')
      }));

      // Resetear el formulario
      backupForm.reset({
        backupName: `respaldo_${new Date().toISOString().split('T')[0]}`,
        description: ''
      });
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el respaldo',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  // Manejar exportación de datos
  const handleExportData = async () => {
    setIsExporting(true);

    try {
      // En una implementación real, esto generaría un archivo para descargar
      // Simulamos la llamada con un setTimeout
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Datos exportados',
        description: 'Se ha generado un archivo con los datos del sistema',
        variant: 'default'
      });

      // Simular descarga del archivo
      const link = document.createElement('a');
      link.href = '#';
      link.download = `exportacion_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron exportar los datos',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Manejar importación de datos
  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      // En una implementación real, esto enviaría el archivo al servidor
      // Simulamos la llamada con un setTimeout
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Datos importados',
        description: `Se han importado los datos desde ${file.name}`,
        variant: 'default'
      });

      // Actualizar la fecha de modificación
      setDatabaseStats(prev => ({
        ...prev,
        dataModified: new Date().toLocaleString('es-AR')
      }));
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron importar los datos',
        variant: 'destructive'
      });
    } finally {
      setIsImporting(false);
      // Limpiar el input de archivo
      event.target.value = '';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Configuración de Base de Datos</h1>
      
      <div className="grid gap-6">
        {/* Estadísticas de la base de datos */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Información de la Base de Datos</CardTitle>
            </div>
            <CardDescription>
              Estadísticas y métricas de la base de datos del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total de registros</p>
                <p className="text-2xl font-bold">{databaseStats.totalRecords.toLocaleString()}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Tablas</p>
                <p className="text-2xl font-bold">{databaseStats.tablesCount}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Tamaño de la BD</p>
                <p className="text-2xl font-bold">{databaseStats.dbSize}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Último respaldo</p>
                <p className="text-xl font-semibold">{databaseStats.lastBackup}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Datos modificados</p>
                <p className="text-xl font-semibold">{databaseStats.dataModified}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Respaldos */}
        <Card>
          <CardHeader>
            <CardTitle>Respaldo de Datos</CardTitle>
            <CardDescription>
              Crea respaldos de seguridad de la base de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...backupForm}>
              <form onSubmit={backupForm.handleSubmit(handleCreateBackup)} className="space-y-4">
                <FormField
                  control={backupForm.control}
                  name="backupName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del respaldo</FormLabel>
                      <FormControl>
                        <Input placeholder="respaldo_20250517" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nombre para identificar este respaldo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={backupForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Respaldo antes de actualización..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Información adicional sobre este respaldo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={isCreatingBackup}
                  className="mt-2 w-full"
                >
                  {isCreatingBackup && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Crear respaldo
                </Button>
              </form>
            </Form>
            
            <div className="grid gap-4 grid-cols-2 mt-6">
              <div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleExportData}
                  disabled={isExporting}
                >
                  {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar datos
                </Button>
              </div>
              <div className="relative">
                <Input
                  type="file"
                  id="import-file"
                  accept=".json"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImportData}
                  disabled={isImporting}
                />
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={isImporting}
                  onClick={() => document.getElementById('import-file')?.click()}
                >
                  {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <FileUp className="mr-2 h-4 w-4" />
                  Importar datos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Reseteo de datos */}
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-600">Reiniciar Base de Datos</CardTitle>
            </div>
            <CardDescription className="text-red-500">
              ¡ATENCIÓN! Esta es una operación destructiva y no se puede deshacer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Zona de peligro</AlertTitle>
              <AlertDescription>
                El reseteo de datos eliminará permanentemente la información seleccionada. 
                Asegúrese de tener un respaldo antes de continuar.
              </AlertDescription>
            </Alert>
            
            <div className="mb-4">
              <label htmlFor="module-select" className="block text-sm font-medium mb-2">
                Seleccionar módulo a reiniciar
              </label>
              <Select onValueChange={setSelectedModule}>
                <SelectTrigger id="module-select">
                  <SelectValue placeholder="Seleccionar módulo" />
                </SelectTrigger>
                <SelectContent>
                  {resetableModules.map(module => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <AlertDialog open={isOpened} onOpenChange={setIsOpened}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full mt-2"
                  disabled={!selectedModule}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Reiniciar datos
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-600">
                    Confirmar reinicio de datos
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esta acción eliminará permanentemente 
                    {selectedModule === 'all' 
                      ? ' TODOS los datos del sistema.' 
                      : ` los datos del módulo ${resetableModules.find(m => m.id === selectedModule)?.name}.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <Form {...confirmForm}>
                  <form className="space-y-4">
                    <FormField
                      control={confirmForm.control}
                      name="confirmText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Para confirmar, escriba "CONFIRMAR":</FormLabel>
                          <FormControl>
                            <Input placeholder="CONFIRMAR" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
                
                <AlertDialogFooter className="mt-4">
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isResetting || !confirmForm.formState.isValid}
                    onClick={confirmForm.handleSubmit(handleResetData)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sí, reiniciar datos
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseSettingsPage;