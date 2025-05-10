import React, { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import MachineWorkForm from "@/components/machines/MachineWorkForm";

export default function MachineWorks() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const numericId = parseInt(id);

  // Get machine details
  const { data: machine, isLoading: machineLoading, error: machineError } = useQuery({
    queryKey: [`/api/machines/${id}`],
  });

  // Get machine works
  const { data: works, isLoading: worksLoading, error: worksError, refetch: refetchWorks } = useQuery({
    queryKey: [`/api/machine-works?machineId=${id}`],
  });

  // Helper functions
  const getWorkTypeLabel = (type: string) => {
    const workTypes: Record<string, string> = {
      "siembra": "Siembra",
      "cosecha": "Cosecha",
      "fumigacion": "Fumigación",
      "fertilizacion": "Fertilización",
      "rastra": "Rastra",
      "arado": "Arado",
      "cincel": "Cincel", 
      "corte": "Corte",
      "rastrillado": "Rastrillado",
      "enrollado": "Enrollado"
    };
    return workTypes[type] || type;
  };

  const handleDeleteWork = async (workId: number) => {
    if (!confirm("¿Está seguro que desea eliminar este trabajo?")) {
      return;
    }

    try {
      await apiRequest("DELETE", `/api/machine-works/${workId}`);
      
      toast({
        title: "Trabajo eliminado",
        description: "El trabajo ha sido eliminado exitosamente",
      });
      
      // Recargar la lista de trabajos
      refetchWorks();
    } catch (error) {
      console.error("Error al eliminar trabajo:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el trabajo",
        variant: "destructive",
      });
    }
  };

  // Handle form submission success
  const handleFormSuccess = () => {
    setSheetOpen(false);
    refetchWorks();
    toast({
      title: "Trabajo registrado",
      description: "El trabajo ha sido registrado exitosamente",
    });
  };

  if (machineLoading) {
    return <div className="py-10 text-center">Cargando información de la máquina...</div>;
  }

  if (machineError || !machine) {
    return (
      <div className="py-10 text-center">
        <div className="text-destructive mb-2">Error al cargar la información de la máquina</div>
        <Button
          variant="outline"
          onClick={() => navigate("/machines")}
        >
          Volver a la lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-header font-bold text-neutral-500">Trabajos Realizados</h1>
          <p className="text-neutral-400">
            {machine.brand} {machine.model} - {machine.hours} horas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/machines/${id}`)}>
            <i className="ri-arrow-left-line mr-1"></i> Volver
          </Button>
          
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <i className="ri-add-line mr-1"></i> Nuevo trabajo
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Registrar nuevo trabajo</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <MachineWorkForm 
                  machineId={numericId} 
                  onSuccess={handleFormSuccess} 
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {worksLoading ? (
        <div className="text-center py-10">Cargando trabajos...</div>
      ) : worksError ? (
        <div className="text-center py-10 text-destructive">
          Error al cargar los trabajos
        </div>
      ) : !works || works.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <i className="ri-truck-line text-4xl text-neutral-300 mb-2"></i>
            <h3 className="text-lg font-medium text-neutral-500 mb-1">No hay trabajos registrados</h3>
            <p className="text-neutral-400 mb-4">Registre el primer trabajo para esta máquina</p>
            <Sheet>
              <SheetTrigger asChild>
                <Button>
                  <i className="ri-add-line mr-1"></i> Nuevo trabajo
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Registrar nuevo trabajo</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <MachineWorkForm 
                    machineId={numericId} 
                    onSuccess={handleFormSuccess} 
                  />
                </div>
              </SheetContent>
            </Sheet>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {works.map((work) => (
            <Card key={work.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>{getWorkTypeLabel(work.workType)}</CardTitle>
                    {work.pastureWorkId && (
                      <Badge variant="outline" className="ml-2">
                        Desde parcela
                      </Badge>
                    )}
                  </div>
                  <Badge>
                    {format(new Date(work.startDate), "dd/MM/yyyy")}
                  </Badge>
                </div>
                <CardDescription>
                  {work.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {(work.workArea || work.workTime || work.fuelUsed) && (
                    <div className="grid grid-cols-3 gap-2">
                      {work.workArea && (
                        <div>
                          <div className="text-xs text-neutral-400">Área:</div>
                          <div className="text-sm">{work.workArea} ha</div>
                        </div>
                      )}
                      {work.workTime && (
                        <div>
                          <div className="text-xs text-neutral-400">Tiempo:</div>
                          <div className="text-sm">{work.workTime} hs</div>
                        </div>
                      )}
                      {work.fuelUsed && (
                        <div>
                          <div className="text-xs text-neutral-400">Combustible:</div>
                          <div className="text-sm">{work.fuelUsed} L</div>
                        </div>
                      )}
                    </div>
                  )}

                  {(work.operationalCost || work.suppliesCost || work.totalCost) && (
                    <div className="pt-2 border-t border-neutral-100">
                      <div className="grid grid-cols-3 gap-2">
                        {work.operationalCost && (
                          <div>
                            <div className="text-xs text-neutral-400">Op. Costo:</div>
                            <div className="text-sm">${work.operationalCost}</div>
                          </div>
                        )}
                        {work.suppliesCost && (
                          <div>
                            <div className="text-xs text-neutral-400">Insumos:</div>
                            <div className="text-sm">${work.suppliesCost}</div>
                          </div>
                        )}
                        {work.totalCost && (
                          <div>
                            <div className="text-xs text-neutral-400">Total:</div>
                            <div className="text-sm font-medium">${work.totalCost}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Campos específicos según tipo de trabajo */}
                  {(work.seedType || work.seedPerHectare || 
                    work.agrochemicalType || work.agrochemicalPerHectare || 
                    work.fertilizerType || work.fertilizerPerHectare ||
                    work.threadRollsUsed) && (
                    <div className="pt-2 border-t border-neutral-100">
                      <div className="grid grid-cols-2 gap-2">
                        {work.seedType && (
                          <div>
                            <div className="text-xs text-neutral-400">Tipo de semilla:</div>
                            <div className="text-sm">{work.seedType}</div>
                          </div>
                        )}
                        {work.seedPerHectare && (
                          <div>
                            <div className="text-xs text-neutral-400">Kg/ha:</div>
                            <div className="text-sm">{work.seedPerHectare}</div>
                          </div>
                        )}
                        {work.agrochemicalType && (
                          <div>
                            <div className="text-xs text-neutral-400">Agroquímico:</div>
                            <div className="text-sm">{work.agrochemicalType}</div>
                          </div>
                        )}
                        {work.agrochemicalPerHectare && (
                          <div>
                            <div className="text-xs text-neutral-400">L/ha:</div>
                            <div className="text-sm">{work.agrochemicalPerHectare}</div>
                          </div>
                        )}
                        {work.fertilizerType && (
                          <div>
                            <div className="text-xs text-neutral-400">Fertilizante:</div>
                            <div className="text-sm">{work.fertilizerType}</div>
                          </div>
                        )}
                        {work.fertilizerPerHectare && (
                          <div>
                            <div className="text-xs text-neutral-400">Kg/ha:</div>
                            <div className="text-sm">{work.fertilizerPerHectare}</div>
                          </div>
                        )}
                        {work.threadRollsUsed && (
                          <div>
                            <div className="text-xs text-neutral-400">Rollos de hilo:</div>
                            <div className="text-sm">{work.threadRollsUsed}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Opciones */}
                  <div className="flex justify-end pt-2">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="h-8"
                      onClick={() => handleDeleteWork(work.id)}
                    >
                      <i className="ri-delete-bin-line mr-1"></i>
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}