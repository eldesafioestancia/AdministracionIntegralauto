import { Link } from "wouter";

interface Maintenance {
  id: number;
  machineId: number;
  machineName: string;
  type: string;
  description: string;
  daysRemaining: number;
  status: "warning" | "error" | "info";
}

interface MaintenanceListProps {
  maintenances: Maintenance[];
}

export default function MaintenanceList({ maintenances }: MaintenanceListProps) {
  const getStatusClasses = (status: Maintenance["status"]) => {
    switch (status) {
      case "warning":
        return "bg-warning bg-opacity-10 text-warning";
      case "error":
        return "bg-destructive bg-opacity-10 text-destructive";
      case "info":
        return "bg-info bg-opacity-10 text-info";
      default:
        return "bg-neutral-200 text-neutral-500";
    }
  };

  const getStatusText = (maintenance: Maintenance) => {
    if (maintenance.status === "error") return "Vencido";
    return `${maintenance.daysRemaining} día${maintenance.daysRemaining !== 1 ? 's' : ''}`;
  };

  const getMaintenanceIcon = (type: string) => {
    switch (type) {
      case "oil_change":
        return "ri-oil-line";
      case "filter_change":
        return "ri-filter-line";
      default:
        return "ri-tools-line";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <h2 className="font-header font-semibold text-neutral-500">Mantenimientos Próximos</h2>
        <Link href="/machines">
          <a className="text-sm text-accent hover:text-accent-dark">Ver todos</a>
        </Link>
      </div>
      <div className="p-4">
        <ul className="divide-y divide-neutral-200">
          {maintenances.map((maintenance) => (
            <li key={maintenance.id} className="py-3 flex items-center">
              <div className="flex-shrink-0 w-10 h-10 rounded bg-neutral-100 flex items-center justify-center">
                <i className={`${getMaintenanceIcon(maintenance.type)} text-xl text-primary`}></i>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-neutral-500">{maintenance.description}</p>
                <p className="text-xs text-neutral-400">{maintenance.machineName}</p>
              </div>
              <div className={`text-xs ${getStatusClasses(maintenance.status)} px-2 py-1 rounded`}>
                {getStatusText(maintenance)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
