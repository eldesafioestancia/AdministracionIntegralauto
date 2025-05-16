import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface MobileMenuProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function MobileMenu({ open, setOpen }: MobileMenuProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-neutral-500 bg-opacity-75"
        onClick={() => setOpen(false)}
      ></div>
      <div className="absolute bottom-0 w-full bg-white rounded-t-xl p-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-header font-semibold text-lg text-neutral-700">
            Menú
          </h3>
          <button
            onClick={() => setOpen(false)}
            className="text-neutral-500 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 p-2 rounded-full"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Link href="/pastures">
            <a
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-green-50"
              onClick={() => setOpen(false)}
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <i className="ri-plant-line text-xl text-green-600"></i>
              </div>
              <span className="text-xs font-medium text-green-700 text-center">
                Pasturas
              </span>
            </a>
          </Link>

          <Link href="/warehouse">
            <a
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-amber-50"
              onClick={() => setOpen(false)}
            >
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                <i className="ri-store-2-line text-xl text-amber-600"></i>
              </div>
              <span className="text-xs font-medium text-amber-700 text-center">
                Depósito
              </span>
            </a>
          </Link>

          <Link href="/services">
            <a
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-blue-50"
              onClick={() => setOpen(false)}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <i className="ri-service-line text-xl text-blue-600"></i>
              </div>
              <span className="text-xs font-medium text-blue-700 text-center">
                Servicios
              </span>
            </a>
          </Link>
          
          <Link href="/investments">
            <a
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-purple-50"
              onClick={() => setOpen(false)}
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <i className="ri-funds-line text-xl text-purple-600"></i>
              </div>
              <span className="text-xs font-medium text-purple-700 text-center">
                Inversiones
              </span>
            </a>
          </Link>

          <Link href="/taxes">
            <a
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-indigo-50"
              onClick={() => setOpen(false)}
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                <i className="ri-bank-line text-xl text-indigo-600"></i>
              </div>
              <span className="text-xs font-medium text-indigo-700 text-center">
                Impuestos
              </span>
            </a>
          </Link>

          <Link href="/repairs">
            <a
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-orange-50"
              onClick={() => setOpen(false)}
            >
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                <i className="ri-tools-line text-xl text-orange-600"></i>
              </div>
              <span className="text-xs font-medium text-orange-700 text-center">
                Reparaciones
              </span>
            </a>
          </Link>

          <Link href="/salaries">
            <a
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-neutral-100"
              onClick={() => setOpen(false)}
            >
              <div className="w-12 h-12 bg-success bg-opacity-10 rounded-full flex items-center justify-center mb-2">
                <i className="ri-user-star-line text-xl text-success"></i>
              </div>
              <span className="text-xs text-neutral-500 text-center">
                Sueldos
              </span>
            </a>
          </Link>

          <Link href="/capital">
            <a
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-neutral-100"
              onClick={() => setOpen(false)}
            >
              <div className="w-12 h-12 bg-error bg-opacity-10 rounded-full flex items-center justify-center mb-2">
                <i className="ri-money-dollar-circle-line text-xl text-error"></i>
              </div>
              <span className="text-xs text-neutral-500 text-center">
                Capital
              </span>
            </a>
          </Link>

          <Link href="/reports">
            <a
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-neutral-100"
              onClick={() => setOpen(false)}
            >
              <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center mb-2">
                <i className="ri-file-chart-line text-xl text-neutral-500"></i>
              </div>
              <span className="text-xs text-neutral-500 text-center">
                Reportes
              </span>
            </a>
          </Link>
        </div>
        <div className="mt-6 border-t border-neutral-200 pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center text-error p-3 w-full"
          >
            <i className="ri-logout-box-line mr-2"></i>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}
