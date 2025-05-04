import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Definición de esquemas de formularios con Zod
const profileFormSchema = z.object({
  username: z.string().min(2, "El nombre de usuario debe tener al menos 2 caracteres"),
  email: z.string().email("Ingrese un correo electrónico válido"),
  fullName: z.string().min(3, "El nombre completo debe tener al menos 3 caracteres"),
  role: z.string(),
  bio: z.string().optional(),
  photo: z.string().optional(),
});

const generalSettingsSchema = z.object({
  establishmentName: z.string().min(3, "El nombre del establecimiento debe tener al menos 3 caracteres"),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  phone: z.string().min(8, "El número de teléfono debe tener al menos 8 caracteres"),
  currency: z.string(),
  timezone: z.string(),
  dateFormat: z.string(),
  language: z.string(),
});

const syncSettingsSchema = z.object({
  syncEnabled: z.boolean(),
  syncInterval: z.string(),
  syncOnlyOnWifi: z.boolean(),
  autoBackup: z.boolean(),
  backupInterval: z.string(),
  maxBackups: z.string(),
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  notifyMaintenance: z.boolean(),
  notifyHealth: z.boolean(),
  notifyFinancial: z.boolean(),
  notifySystem: z.boolean(),
  notificationTime: z.string(),
  digestFrequency: z.string(),
});

const systemSettingsSchema = z.object({
  debugMode: z.boolean(),
  dataRetention: z.string(),
  autoLogout: z.string(),
  mobileDataSaving: z.boolean(),
  allowGPS: z.boolean(),
  allowAnalytics: z.boolean(),
  defaultView: z.string(),
});

// Tipos para los formularios
type ProfileFormValues = z.infer<typeof profileFormSchema>;
type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;
type SyncSettingsValues = z.infer<typeof syncSettingsSchema>;
type NotificationSettingsValues = z.infer<typeof notificationSettingsSchema>;
type SystemSettingsValues = z.infer<typeof systemSettingsSchema>;

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();
  
  // Formulario de perfil
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "usuario1",
      email: "usuario@ejemplo.com",
      fullName: "Usuario Ejemplo",
      role: "admin",
      bio: "Administrador del sistema de gestión agropecuaria",
      photo: "/avatar.png",
    },
  });

  // Formulario de configuración general
  const generalForm = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      establishmentName: "Establecimiento La Esperanza",
      address: "Ruta 40 Km 100, Provincia de Buenos Aires",
      phone: "1123456789",
      currency: "ARS",
      timezone: "America/Argentina/Buenos_Aires",
      dateFormat: "DD/MM/YYYY",
      language: "es",
    },
  });

  // Formulario de configuración de sincronización
  const syncForm = useForm<SyncSettingsValues>({
    resolver: zodResolver(syncSettingsSchema),
    defaultValues: {
      syncEnabled: true,
      syncInterval: "15",
      syncOnlyOnWifi: true,
      autoBackup: true,
      backupInterval: "weekly",
      maxBackups: "5",
    },
  });

  // Formulario de configuración de notificaciones
  const notificationForm = useForm<NotificationSettingsValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      notifyMaintenance: true,
      notifyHealth: true,
      notifyFinancial: true,
      notifySystem: true,
      notificationTime: "morning",
      digestFrequency: "daily",
    },
  });

  // Formulario de configuración del sistema
  const systemForm = useForm<SystemSettingsValues>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      debugMode: false,
      dataRetention: "3months",
      autoLogout: "30",
      mobileDataSaving: true,
      allowGPS: true,
      allowAnalytics: false,
      defaultView: "dashboard",
    },
  });

  // Manejar envío de formulario de perfil
  async function onProfileSubmit(values: ProfileFormValues) {
    try {
      // Aquí iría la lógica para guardar los datos en la API
      console.log("Datos de perfil:", values);
      toast({
        title: "Perfil actualizado",
        description: "Los datos de perfil han sido actualizados correctamente",
      });
    } catch (error) {
      console.error("Error al guardar perfil:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    }
  }

  // Manejar envío de formulario de configuración general
  async function onGeneralSubmit(values: GeneralSettingsValues) {
    try {
      // Aquí iría la lógica para guardar los datos en la API
      console.log("Configuración general:", values);
      toast({
        title: "Configuración guardada",
        description: "La configuración general ha sido actualizada correctamente",
      });
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración general",
        variant: "destructive",
      });
    }
  }

  // Manejar envío de formulario de sincronización
  async function onSyncSubmit(values: SyncSettingsValues) {
    try {
      // Aquí iría la lógica para guardar los datos en la API
      console.log("Configuración de sincronización:", values);
      toast({
        title: "Configuración guardada",
        description: "La configuración de sincronización ha sido actualizada correctamente",
      });
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración de sincronización",
        variant: "destructive",
      });
    }
  }

  // Manejar envío de formulario de notificaciones
  async function onNotificationSubmit(values: NotificationSettingsValues) {
    try {
      // Aquí iría la lógica para guardar los datos en la API
      console.log("Configuración de notificaciones:", values);
      toast({
        title: "Configuración guardada",
        description: "La configuración de notificaciones ha sido actualizada correctamente",
      });
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración de notificaciones",
        variant: "destructive",
      });
    }
  }

  // Manejar envío de formulario del sistema
  async function onSystemSubmit(values: SystemSettingsValues) {
    try {
      // Aquí iría la lógica para guardar los datos en la API
      console.log("Configuración del sistema:", values);
      toast({
        title: "Configuración guardada",
        description: "La configuración del sistema ha sido actualizada correctamente",
      });
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración del sistema",
        variant: "destructive",
      });
    }
  }

  // Función para ejecutar sincronización manual
  const handleManualSync = () => {
    toast({
      title: "Sincronización iniciada",
      description: "La sincronización manual ha comenzado...",
    });
    // Aquí iría la lógica para sincronizar los datos
    setTimeout(() => {
      toast({
        title: "Sincronización completada",
        description: "Todos los datos han sido sincronizados correctamente",
      });
    }, 2000);
  };

  // Función para crear copia de seguridad manual
  const handleManualBackup = () => {
    toast({
      title: "Copia de seguridad iniciada",
      description: "La copia de seguridad manual ha comenzado...",
    });
    // Aquí iría la lógica para crear copia de seguridad
    setTimeout(() => {
      toast({
        title: "Copia de seguridad completada",
        description: "Se ha creado una nueva copia de seguridad con fecha 4/5/2025",
      });
    }, 2000);
  };

  // Función para restaurar datos
  const handleRestoreData = () => {
    toast({
      title: "Restauración iniciada",
      description: "La restauración de datos ha comenzado...",
    });
    // Aquí iría la lógica para restaurar los datos
    setTimeout(() => {
      toast({
        title: "Restauración completada",
        description: "Los datos han sido restaurados correctamente",
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-header font-bold text-neutral-500">Configuración</h1>
          <p className="text-neutral-400 text-sm">Administre las preferencias y configuraciones del sistema</p>
        </div>
      </div>

      {/* Contenido principal */}
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 max-w-full overflow-x-auto whitespace-nowrap">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="profile">Perfil de Usuario</TabsTrigger>
          <TabsTrigger value="sync">Sincronización</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        {/* Configuración General */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Configure los ajustes básicos del establecimiento agrícola
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-4">
                  <FormField
                    control={generalForm.control}
                    name="establishmentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Establecimiento</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del establecimiento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input placeholder="Dirección del establecimiento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="Teléfono de contacto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={generalForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Moneda</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar moneda" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
                              <SelectItem value="USD">Dólar estadounidense (USD)</SelectItem>
                              <SelectItem value="EUR">Euro (EUR)</SelectItem>
                              <SelectItem value="BRL">Real brasileño (BRL)</SelectItem>
                              <SelectItem value="UYU">Peso uruguayo (UYU)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zona horaria</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar zona horaria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="America/Argentina/Buenos_Aires">Argentina (GMT-3)</SelectItem>
                              <SelectItem value="America/Sao_Paulo">Brasil (GMT-3)</SelectItem>
                              <SelectItem value="America/Montevideo">Uruguay (GMT-3)</SelectItem>
                              <SelectItem value="America/Santiago">Chile (GMT-4)</SelectItem>
                              <SelectItem value="America/Asuncion">Paraguay (GMT-4)</SelectItem>
                              <SelectItem value="America/La_Paz">Bolivia (GMT-4)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={generalForm.control}
                      name="dateFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Formato de fecha</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar formato de fecha" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DD/MM/YYYY">DD/MM/AAAA (31/12/2023)</SelectItem>
                              <SelectItem value="MM/DD/YYYY">MM/DD/AAAA (12/31/2023)</SelectItem>
                              <SelectItem value="YYYY-MM-DD">AAAA-MM-DD (2023-12-31)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Idioma</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar idioma" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="es">Español</SelectItem>
                              <SelectItem value="en">Inglés</SelectItem>
                              <SelectItem value="pt">Portugués</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="mt-4">Guardar configuración</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Perfil de Usuario */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Perfil de Usuario</CardTitle>
              <CardDescription>
                Administre su información personal y de cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-32 h-32 rounded-full bg-primary-light flex items-center justify-center text-white text-4xl">
                    UE
                  </div>
                  <Button variant="outline" size="sm">Cambiar foto</Button>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-700">Usuario Ejemplo</h3>
                  <p className="text-neutral-500 text-sm">usuario@ejemplo.com</p>
                  
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline">Administrador</Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Activo</Badge>
                  </div>
                  
                  <p className="mt-2 text-neutral-600 text-sm">
                    Último acceso: 4 de mayo de 2025, 13:45
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de usuario</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre de usuario" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo electrónico</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Correo electrónico" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rol</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="manager">Gerente</SelectItem>
                            <SelectItem value="operator">Operador</SelectItem>
                            <SelectItem value="viewer">Visualizador</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biografía</FormLabel>
                        <FormControl>
                          <Input placeholder="Descripción breve" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <Button type="submit">Guardar perfil</Button>
                    <Button variant="outline" type="button">
                      Cambiar contraseña
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sincronización */}
        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Sincronización</CardTitle>
              <CardDescription>
                Administre cómo y cuándo se sincronizan los datos para uso offline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <i className="ri-information-line h-4 w-4"></i>
                <AlertTitle>Información sobre sincronización</AlertTitle>
                <AlertDescription>
                  Este sistema está diseñado para trabajar offline. La configuración de sincronización determina cómo se manejan
                  los datos cuando hay conexión disponible.
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-neutral-700">Estado actual</p>
                  <p className="text-sm text-neutral-500">Última sincronización: 4/5/2025, 13:15</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Sincronizado
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <Button onClick={handleManualSync}>
                  <i className="ri-refresh-line mr-2"></i>
                  Sincronizar ahora
                </Button>
                <Button variant="outline" onClick={handleManualBackup}>
                  <i className="ri-save-line mr-2"></i>
                  Crear copia de seguridad
                </Button>
                <Button variant="outline" onClick={handleRestoreData}>
                  <i className="ri-history-line mr-2"></i>
                  Restaurar datos
                </Button>
              </div>

              <Separator className="my-6" />

              <Form {...syncForm}>
                <form onSubmit={syncForm.handleSubmit(onSyncSubmit)} className="space-y-4">
                  <FormField
                    control={syncForm.control}
                    name="syncEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Sincronización automática</FormLabel>
                          <FormDescription>
                            Permite que los datos se sincronicen automáticamente cuando hay conexión
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
                    control={syncForm.control}
                    name="syncInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intervalo de sincronización (minutos)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar intervalo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="5">Cada 5 minutos</SelectItem>
                            <SelectItem value="15">Cada 15 minutos</SelectItem>
                            <SelectItem value="30">Cada 30 minutos</SelectItem>
                            <SelectItem value="60">Cada hora</SelectItem>
                            <SelectItem value="360">Cada 6 horas</SelectItem>
                            <SelectItem value="720">Cada 12 horas</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={syncForm.control}
                    name="syncOnlyOnWifi"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Solo sincronizar con WiFi</FormLabel>
                          <FormDescription>
                            Evita usar datos móviles para la sincronización
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
                    control={syncForm.control}
                    name="autoBackup"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Copia de seguridad automática</FormLabel>
                          <FormDescription>
                            Crea copias de seguridad automáticas periódicamente
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={syncForm.control}
                      name="backupInterval"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frecuencia de copia de seguridad</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar frecuencia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Diaria</SelectItem>
                              <SelectItem value="weekly">Semanal</SelectItem>
                              <SelectItem value="biweekly">Quincenal</SelectItem>
                              <SelectItem value="monthly">Mensual</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={syncForm.control}
                      name="maxBackups"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Máximo de copias de seguridad</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar cantidad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="3">3 copias</SelectItem>
                              <SelectItem value="5">5 copias</SelectItem>
                              <SelectItem value="10">10 copias</SelectItem>
                              <SelectItem value="20">20 copias</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="mt-4">Guardar configuración</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificaciones */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>
                Administre sus preferencias de notificaciones y alertas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Notificaciones por email</FormLabel>
                            <FormDescription>
                              Recibir notificaciones por correo electrónico
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
                      control={notificationForm.control}
                      name="pushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Notificaciones push</FormLabel>
                            <FormDescription>
                              Recibir notificaciones push en el dispositivo
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
                  </div>

                  <Separator className="my-4" />
                  <h3 className="text-lg font-semibold text-neutral-700 mb-3">Tipos de notificaciones</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={notificationForm.control}
                      name="notifyMaintenance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Mantenimiento</FormLabel>
                            <FormDescription>
                              Recordatorios y alertas de mantenimiento
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
                      control={notificationForm.control}
                      name="notifyHealth"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Salud animal</FormLabel>
                            <FormDescription>
                              Recordatorios veterinarios y alertas sanitarias
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
                      control={notificationForm.control}
                      name="notifyFinancial"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Finanzas</FormLabel>
                            <FormDescription>
                              Alertas financieras y recordatorios de pagos
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
                      control={notificationForm.control}
                      name="notifySystem"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Sistema</FormLabel>
                            <FormDescription>
                              Actualizaciones y mensajes del sistema
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
                  </div>

                  <Separator className="my-4" />
                  <h3 className="text-lg font-semibold text-neutral-700 mb-3">Preferencias de entrega</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={notificationForm.control}
                      name="notificationTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horario preferido</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar horario" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="morning">Mañana (8:00 - 12:00)</SelectItem>
                              <SelectItem value="afternoon">Tarde (12:00 - 18:00)</SelectItem>
                              <SelectItem value="evening">Noche (18:00 - 22:00)</SelectItem>
                              <SelectItem value="anytime">Cualquier momento</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="digestFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frecuencia de resumen</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar frecuencia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="immediate">Inmediata (cada notificación)</SelectItem>
                              <SelectItem value="daily">Resumen diario</SelectItem>
                              <SelectItem value="weekly">Resumen semanal</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="mt-4">Guardar configuración</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sistema */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Sistema</CardTitle>
              <CardDescription>
                Administre los parámetros técnicos del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6 bg-yellow-50 border-yellow-200">
                <i className="ri-alert-line h-4 w-4 text-yellow-600"></i>
                <AlertTitle className="text-yellow-800">Configuración avanzada</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  Estos ajustes pueden afectar el rendimiento y funcionamiento del sistema. 
                  Realice cambios solo si está seguro de lo que hace.
                </AlertDescription>
              </Alert>

              <Form {...systemForm}>
                <form onSubmit={systemForm.handleSubmit(onSystemSubmit)} className="space-y-4">
                  <FormField
                    control={systemForm.control}
                    name="debugMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Modo de depuración</FormLabel>
                          <FormDescription>
                            Activa el registro detallado para solución de problemas
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
                    control={systemForm.control}
                    name="dataRetention"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Retención de datos</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar periodo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1month">1 mes</SelectItem>
                            <SelectItem value="3months">3 meses</SelectItem>
                            <SelectItem value="6months">6 meses</SelectItem>
                            <SelectItem value="1year">1 año</SelectItem>
                            <SelectItem value="indefinite">Indefinida</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Tiempo que se mantienen los datos de registros y eventos antes de eliminarlos automáticamente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={systemForm.control}
                    name="autoLogout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cierre de sesión automático (minutos)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tiempo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="15">15 minutos</SelectItem>
                            <SelectItem value="30">30 minutos</SelectItem>
                            <SelectItem value="60">1 hora</SelectItem>
                            <SelectItem value="120">2 horas</SelectItem>
                            <SelectItem value="240">4 horas</SelectItem>
                            <SelectItem value="0">Nunca</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={systemForm.control}
                    name="mobileDataSaving"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Ahorro de datos móviles</FormLabel>
                          <FormDescription>
                            Reduce el consumo de datos en conexiones móviles
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
                    control={systemForm.control}
                    name="allowGPS"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Permitir GPS</FormLabel>
                          <FormDescription>
                            Utilizar GPS para ubicación de parcelas y animales
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
                    control={systemForm.control}
                    name="allowAnalytics"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Analíticas de uso</FormLabel>
                          <FormDescription>
                            Compartir datos anónimos de uso para mejorar el sistema
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
                    control={systemForm.control}
                    name="defaultView"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vista predeterminada</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar vista" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dashboard">Dashboard</SelectItem>
                            <SelectItem value="animals">Animales</SelectItem>
                            <SelectItem value="machines">Maquinaria</SelectItem>
                            <SelectItem value="pastures">Pasturas</SelectItem>
                            <SelectItem value="finances">Finanzas</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Pantalla que se muestra al iniciar la aplicación
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator className="my-6" />

                  <div className="flex flex-col space-y-4">
                    <Button type="submit" className="mt-4">Guardar configuración</Button>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button variant="outline" type="button" className="w-full">
                        <i className="ri-database-2-line mr-2"></i>
                        Optimizar base de datos
                      </Button>
                      
                      <Button variant="outline" type="button" className="w-full">
                        <i className="ri-delete-bin-line mr-2"></i>
                        Limpiar caché
                      </Button>
                    </div>
                    
                    <Button variant="destructive" type="button" className="mt-2">
                      <i className="ri-restart-line mr-2"></i>
                      Restaurar valores predeterminados
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-500">Versión</h4>
                  <p className="text-base">1.2.0 (Build 20250504)</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-500">Última actualización</h4>
                  <p className="text-base">4 de mayo de 2025</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-500">Espacio de almacenamiento</h4>
                  <p className="text-base">234 MB / 2 GB (11.7% usado)</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-500">Estado de sincronización</h4>
                  <p className="text-base">Completamente sincronizado</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-neutral-500 mb-2">Registro de cambios recientes</h4>
                <ul className="text-sm space-y-2">
                  <li>
                    <span className="font-medium">v1.2.0 (4/5/2025):</span> Añadido módulo de reportes y análisis avanzados
                  </li>
                  <li>
                    <span className="font-medium">v1.1.5 (15/4/2025):</span> Mejoras en el sistema de sincronización offline
                  </li>
                  <li>
                    <span className="font-medium">v1.1.0 (1/4/2025):</span> Añadido módulo de gestión de depósito
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="px-0">
                <i className="ri-external-link-line mr-1"></i>
                Ver historial completo de cambios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}