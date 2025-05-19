import { useState, useEffect } from 'react';
import { Button } from './button';
import { AlertCircle, Camera } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog';

type CameraPermissionStatus = 'prompt' | 'granted' | 'denied' | 'checking' | 'not-supported';

interface CameraPermissionProps {
  onPermissionChange?: (status: CameraPermissionStatus) => void;
  children?: React.ReactNode;
}

export function useCameraPermission() {
  const [permission, setPermission] = useState<CameraPermissionStatus>('checking');

  useEffect(() => {
    // Verificar si la API de permisos está disponible
    if (!navigator.permissions || !navigator.mediaDevices) {
      setPermission('not-supported');
      return;
    }

    const checkPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setPermission(result.state as CameraPermissionStatus);

        // Escuchar cambios en el permiso
        result.onchange = () => {
          setPermission(result.state as CameraPermissionStatus);
        };
      } catch (error) {
        console.error('Error al verificar permiso de cámara:', error);
        setPermission('not-supported');
      }
    };

    checkPermission();
  }, []);

  // Función para solicitar acceso a la cámara
  const requestPermission = async (): Promise<CameraPermissionStatus> => {
    if (!navigator.mediaDevices) {
      setPermission('not-supported');
      return 'not-supported';
    }

    try {
      // Intentar obtener acceso a la cámara
      await navigator.mediaDevices.getUserMedia({ video: true });
      setPermission('granted');
      return 'granted';
    } catch (error) {
      console.error('Error al solicitar acceso a cámara:', error);
      setPermission('denied');
      return 'denied';
    }
  };

  return { permission, requestPermission };
}

export function CameraPermission({ onPermissionChange, children }: CameraPermissionProps) {
  const { permission, requestPermission } = useCameraPermission();
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (onPermissionChange) {
      onPermissionChange(permission);
    }

    // Mostrar el diálogo si es necesario solicitar permisos
    if (permission === 'prompt') {
      setShowDialog(true);
    }
  }, [permission, onPermissionChange]);

  // Manejar la solicitud de permiso
  const handleRequestPermission = async () => {
    await requestPermission();
    setShowDialog(false);
  };

  if (permission === 'not-supported') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Cámara no disponible
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                La funcionalidad de cámara no está disponible en este dispositivo o navegador.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permiso de cámara</AlertDialogTitle>
            <AlertDialogDescription>
              Esta aplicación necesita acceso a la cámara para escanear códigos QR, 
              tomar fotos de documentos y animales. 
              ¿Desea permitir el acceso a la cámara?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No permitir</AlertDialogCancel>
            <AlertDialogAction onClick={handleRequestPermission}>
              <Camera className="mr-2 h-4 w-4" />
              Permitir acceso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Componente de botón para solicitar permiso de cámara explícitamente
export function RequestCameraPermissionButton() {
  const { permission, requestPermission } = useCameraPermission();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleClick = async () => {
    setIsRequesting(true);
    await requestPermission();
    setIsRequesting(false);
  };

  if (permission === 'granted') {
    return (
      <Button variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100" disabled>
        <Camera className="mr-2 h-4 w-4" />
        Permiso concedido
      </Button>
    );
  }

  if (permission === 'not-supported') {
    return (
      <Button variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200" disabled>
        <AlertCircle className="mr-2 h-4 w-4" />
        Cámara no disponible
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleClick} 
      disabled={isRequesting || permission === 'checking'}
      variant={permission === 'denied' ? "destructive" : "default"}
    >
      <Camera className="mr-2 h-4 w-4" />
      {isRequesting ? 'Solicitando...' : 
        permission === 'denied' ? 'Volver a intentar' : 
        'Permitir acceso a cámara'}
    </Button>
  );
}