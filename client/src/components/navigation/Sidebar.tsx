import { Link, useLocation } from "wouter";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path || location.startsWith(`${path}/`);
  };

  const closeSidebar = () => {
    setOpen(false);
  };

  return (
    <nav
      className={`${
        open ? "block absolute inset-y-0 left-0 z-50" : "hidden"
      } lg:block lg:relative lg:w-64 bg-white border-r border-neutral-200 shadow-sm overflow-y-auto flex-shrink-0 h-full`}
    >
      {open && (
        <div
          className="fixed inset-0 bg-black opacity-50 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      <div className="p-4 relative z-10">
        <div className="space-y-1">
          <Link href="/">
            <a
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive("/")
                  ? "bg-primary-light bg-opacity-10 text-primary"
                  : "text-neutral-500 hover:bg-neutral-100"
              }`}
              onClick={closeSidebar}
            >
              <i className="ri-dashboard-line mr-3 text-lg"></i>
              Dashboard
            </a>
          </Link>

          <div className="pt-2">
            <p className="px-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Módulos principales
            </p>
            <div className="mt-1 space-y-1">
              <Link href="/machines">
                <a
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive("/machines")
                      ? "bg-primary-light bg-opacity-10 text-primary"
                      : "text-neutral-500 hover:bg-neutral-100"
                  }`}
                  onClick={closeSidebar}
                >
                  <i className="ri-truck-line mr-3 text-lg"></i>
                  Unidades productivas
                </a>
              </Link>
              <Link href="/animals">
                <a
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive("/animals")
                      ? "bg-primary-light bg-opacity-10 text-primary"
                      : "text-neutral-500 hover:bg-neutral-100"
                  }`}
                  onClick={closeSidebar}
                >
                  <i className="ri-bear-smile-line mr-3 text-lg"></i>
                  Animales
                </a>
              </Link>
              <Link href="/pastures">
                <a
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive("/pastures")
                      ? "bg-primary-light bg-opacity-10 text-primary"
                      : "text-neutral-500 hover:bg-neutral-100"
                  }`}
                  onClick={closeSidebar}
                >
                  <i className="ri-plant-line mr-3 text-lg"></i>
                  Pasturas
                </a>
              </Link>
              <Link href="/investments">
                <a
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive("/investments")
                      ? "bg-primary-light bg-opacity-10 text-primary"
                      : "text-neutral-500 hover:bg-neutral-100"
                  }`}
                  onClick={closeSidebar}
                >
                  <i className="ri-funds-line mr-3 text-lg"></i>
                  Inversiones
                </a>
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <p className="px-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Gestión financiera
            </p>
            <div className="mt-1 space-y-1">
              <Link href="/services">
                <a
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive("/services")
                      ? "bg-primary-light bg-opacity-10 text-primary"
                      : "text-neutral-500 hover:bg-neutral-100"
                  }`}
                  onClick={closeSidebar}
                >
                  <i className="ri-service-line mr-3 text-lg"></i>
                  Servicios
                </a>
              </Link>
              <Link href="/taxes">
                <a
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive("/taxes")
                      ? "bg-primary-light bg-opacity-10 text-primary"
                      : "text-neutral-500 hover:bg-neutral-100"
                  }`}
                  onClick={closeSidebar}
                >
                  <i className="ri-bank-line mr-3 text-lg"></i>
                  Impuestos
                </a>
              </Link>
              <Link href="/repairs">
                <a
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive("/repairs")
                      ? "bg-primary-light bg-opacity-10 text-primary"
                      : "text-neutral-500 hover:bg-neutral-100"
                  }`}
                  onClick={closeSidebar}
                >
                  <i className="ri-tools-line mr-3 text-lg"></i>
                  Reparaciones
                </a>
              </Link>
              <Link href="/salaries">
                <a
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive("/salaries")
                      ? "bg-primary-light bg-opacity-10 text-primary"
                      : "text-neutral-500 hover:bg-neutral-100"
                  }`}
                  onClick={closeSidebar}
                >
                  <i className="ri-user-star-line mr-3 text-lg"></i>
                  Sueldos
                </a>
              </Link>
              <Link href="/capital">
                <a
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive("/capital")
                      ? "bg-primary-light bg-opacity-10 text-primary"
                      : "text-neutral-500 hover:bg-neutral-100"
                  }`}
                  onClick={closeSidebar}
                >
                  <i className="ri-money-dollar-circle-line mr-3 text-lg"></i>
                  Capital
                </a>
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <p className="px-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Sistema
            </p>
            <div className="mt-1 space-y-1">
              <Link href="/reports">
                <a
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive("/reports")
                      ? "bg-primary-light bg-opacity-10 text-primary"
                      : "text-neutral-500 hover:bg-neutral-100"
                  }`}
                  onClick={closeSidebar}
                >
                  <i className="ri-file-chart-line mr-3 text-lg"></i>
                  Reportes
                </a>
              </Link>
              <Link href="/settings">
                <a
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive("/settings")
                      ? "bg-primary-light bg-opacity-10 text-primary"
                      : "text-neutral-500 hover:bg-neutral-100"
                  }`}
                  onClick={closeSidebar}
                >
                  <i className="ri-settings-line mr-3 text-lg"></i>
                  Configuración
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
