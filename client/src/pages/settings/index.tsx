import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, User, Settings, Database, AlertTriangle } from 'lucide-react';

const SettingsPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Configuración</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/settings/notifications">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <Bell className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>
                Configura las alertas y notificaciones del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Personaliza qué alertas quieres recibir y cómo prefieres ser notificado
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/settings/profile">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <User className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Perfil de Usuario</CardTitle>
              <CardDescription>
                Administra tu información personal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Actualiza tus datos, cambia contraseña y configura preferencias personales
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/settings/general">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <Settings className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Ajustes generales del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Administra idioma, región, unidades de medida y otras preferencias generales
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/settings/database">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <Database className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Base de Datos</CardTitle>
              <CardDescription>
                Administración y mantenimiento de la base de datos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Crea respaldos, reinicia datos del sistema o exporta/importa información
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default SettingsPage;