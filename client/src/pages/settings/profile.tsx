import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
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
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Loader2, User, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Esquema de validación para formulario de perfil
const profileFormSchema = z.object({
  username: z.string().min(2, 'El nombre de usuario debe tener al menos 2 caracteres'),
  fullName: z.string().min(3, 'El nombre completo debe tener al menos 3 caracteres'),
  email: z.string().email('Introduce un email válido'),
  phone: z.string().optional(),
  position: z.string().optional(),
  bio: z.string().optional()
});

// Esquema para cambio de contraseña
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, 'Introduce tu contraseña actual'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string().min(8, 'Confirma tu nueva contraseña')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  // Formulario de perfil
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      fullName: '',
      email: '',
      phone: '',
      position: '',
      bio: ''
    }
  });
  
  // Formulario de cambio de contraseña
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });
  
  // Cargar datos del usuario
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoadingProfile(true);
        setProfileError(null);
        
        // Aquí normalmente cargaríamos datos del API
        // Por ahora usaremos el usuario del contexto
        if (user) {
          profileForm.reset({
            username: user.username,
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            position: user.position || '',
            bio: user.bio || ''
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        setProfileError('No se pudo cargar el perfil de usuario');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (user) {
      loadUserProfile();
    }
  }, [user, profileForm]);
  
  // Enviar formulario de perfil
  const onSubmitProfile = async (data: ProfileFormValues) => {
    setIsSavingProfile(true);
    setProfileError(null);
    
    try {
      // Simulamos una llamada a la API para guardar el perfil
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Perfil actualizado',
        description: 'Tu información de perfil ha sido actualizada correctamente',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      setProfileError('No se pudo guardar la información del perfil');
      
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil',
        variant: 'destructive'
      });
    } finally {
      setIsSavingProfile(false);
    }
  };
  
  // Enviar formulario de cambio de contraseña
  const onSubmitPassword = async (data: PasswordFormValues) => {
    setIsSavingPassword(true);
    setPasswordError(null);
    
    try {
      // Simulamos una llamada a la API para cambiar contraseña
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reseteamos el formulario
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña ha sido cambiada correctamente',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('No se pudo cambiar la contraseña');
      
      toast({
        title: 'Error',
        description: 'No se pudo cambiar la contraseña',
        variant: 'destructive'
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Perfil de Usuario</h1>
      
      <div className="grid gap-6">
        {/* Información de Perfil */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Información Personal</CardTitle>
            </div>
            <CardDescription>
              Actualiza tu información personal y de contacto
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profileError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{profileError}</AlertDescription>
              </Alert>
            )}
            
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de usuario</FormLabel>
                        <FormControl>
                          <Input placeholder="usuario123" {...field} />
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
                          <Input placeholder="Juan Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo electrónico</FormLabel>
                        <FormControl>
                          <Input placeholder="correo@ejemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="+54 9 11 1234 5678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={profileForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo / Posición</FormLabel>
                      <FormControl>
                        <Input placeholder="Administrador" {...field} />
                      </FormControl>
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
                        <Textarea 
                          placeholder="Escribe una breve descripción sobre ti..." 
                          className="resize-none min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isSavingProfile} className="mt-2">
                  {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Guardar cambios
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Cambio de Contraseña */}
        <Card>
          <CardHeader>
            <CardTitle>Cambiar Contraseña</CardTitle>
            <CardDescription>
              Actualiza tu contraseña para mantener la seguridad de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {passwordError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
            
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña actual</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator className="my-4" />
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nueva contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar nueva contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button type="submit" disabled={isSavingPassword}>
                  {isSavingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cambiar contraseña
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;