import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Componentes de UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function ResetPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/admin/reset-data");
      
      if (response.success) {
        toast({
          title: "Datos reiniciados",
          description: "Todos los datos de la aplicación han sido eliminados correctamente.",
        });

        // Redirigir al dashboard después de un tiempo
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        toast({
          title: "Error",
          description: "No se pudieron eliminar los datos de la aplicación.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al reiniciar datos:", error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor para reiniciar los datos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700">Reinicio de Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-neutral-700 space-y-4">
            <p>
              Esta opción eliminará <strong>permanentemente</strong> todos los datos del sistema, incluyendo:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Maquinaria y sus registros de mantenimiento</li>
              <li>Animales y sus registros veterinarios</li>
              <li>Parcelas y trabajos agrícolas</li>
              <li>Registros financieros</li>
              <li>Inversiones y capital</li>
            </ul>
            <p className="text-red-700 font-semibold">
              Esta acción no puede deshacerse. Por favor, considere realizar una copia de seguridad antes de continuar.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="destructive" 
            onClick={() => setIsConfirmOpen(true)}
            disabled={isLoading}
          >
            {isLoading ? "Procesando..." : "Reiniciar Datos"}
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-700">Confirmar Reinicio de Datos</AlertDialogTitle>
            <AlertDialogDescription>
              Está a punto de eliminar <strong>permanentemente</strong> todos los datos de la aplicación. Esta acción no puede deshacerse.
              <Separator className="my-4" />
              ¿Está seguro que desea continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              disabled={isLoading}
              className="bg-red-700 hover:bg-red-800"
            >
              {isLoading ? "Procesando..." : "Sí, eliminar todos los datos"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}