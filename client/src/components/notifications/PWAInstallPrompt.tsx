import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Download, X } from 'lucide-react';

// Interfaz para el evento beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detectar si es un dispositivo iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOSDevice(isIOS);

    // Capturar el evento beforeinstallprompt para dispositivos no iOS
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar el diálogo automáticamente después de 30 segundos
      // para no interrumpir inmediatamente la experiencia del usuario
      setTimeout(() => {
        setIsOpen(true);
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar cuándo la PWA fue instalada
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    
    await installPrompt.prompt();
    
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setInstallPrompt(null);
    setIsOpen(false);
  };

  // No mostrar nada si ya está instalada o no hay prompt disponible
  if (isInstalled || (!installPrompt && !isIOSDevice)) {
    return null;
  }

  return (
    <>
      <Button 
        variant="outline" 
        className="fixed bottom-4 right-4 z-50 shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <Download className="mr-2 h-4 w-4" />
        Instalar app
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Instalar Agro Gestión Integral</AlertDialogTitle>
            <AlertDialogDescription>
              {isIOSDevice ? (
                <>
                  Para instalar esta aplicación en su dispositivo iOS:
                  <ol className="mt-2 list-decimal pl-5 space-y-2">
                    <li>Toque el botón de compartir <span className="inline-block bg-gray-200 px-2 rounded">🔄</span></li>
                    <li>Desplácese y toque "Añadir a pantalla de inicio"</li>
                    <li>Confirme tocando "Añadir"</li>
                  </ol>
                </>
              ) : (
                <>
                  Instale esta aplicación en su dispositivo para acceder fácilmente desde la pantalla principal.
                  <ul className="mt-2 space-y-2">
                    <li>• Funciona sin conexión</li>
                    <li>• Acceso rápido a la cámara</li>
                    <li>• Reciba notificaciones importantes</li>
                    <li>• No ocupa espacio de almacenamiento</li>
                  </ul>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ahora no</AlertDialogCancel>
            {!isIOSDevice && (
              <AlertDialogAction onClick={handleInstall}>
                <Download className="mr-2 h-4 w-4" />
                Instalar
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}