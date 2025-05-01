import { Link } from "wouter";

interface Machine {
  id: number;
  name: string;
  image: string;
  hours: number;
  nextService: number;
  percentage: number;
  status: "normal" | "warning" | "critical";
}

interface MachineUsageProps {
  machines: Machine[];
}

export default function MachineUsage({ machines }: MachineUsageProps) {
  const getStatusColor = (status: Machine["status"]) => {
    switch (status) {
      case "normal":
        return "bg-primary";
      case "warning":
        return "bg-warning";
      case "critical":
        return "bg-destructive";
      default:
        return "bg-neutral-200";
    }
  };

  const getTextStatusColor = (status: Machine["status"]) => {
    switch (status) {
      case "normal":
        return "text-primary";
      case "warning":
        return "text-warning";
      case "critical":
        return "text-destructive";
      default:
        return "text-neutral-400";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <h2 className="font-header font-semibold text-neutral-500">Uso de Maquinaria</h2>
        <Link href="/machines">
          <a className="text-sm text-accent hover:text-accent-dark">Ver todas</a>
        </Link>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {machines.map((machine) => (
            <div key={machine.id} className="flex items-center">
              <img
                src={machine.image}
                alt={machine.name}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-neutral-500">{machine.name}</h3>
                  <span className="text-xs text-neutral-400">{machine.hours.toLocaleString()} horas</span>
                </div>
                <div className="mt-2">
                  <div className="bg-neutral-200 rounded-full h-2">
                    <div 
                      className={`${getStatusColor(machine.status)} rounded-full h-2`} 
                      style={{ width: `${machine.percentage}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-neutral-400">
                      Próximo servicio: {machine.nextService.toLocaleString()} horas
                    </span>
                    <span className={`font-medium ${getTextStatusColor(machine.status)}`}>
                      {machine.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
