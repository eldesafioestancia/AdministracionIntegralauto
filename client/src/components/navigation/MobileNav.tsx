import { Link, useLocation } from "wouter";

interface MobileNavProps {
  openMoreMenu: () => void;
}

export default function MobileNav({ openMoreMenu }: MobileNavProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path || location.startsWith(`${path}/`);
  };

  return (
    <nav className="lg:hidden bg-white border-t border-neutral-200 fixed bottom-0 w-full z-40">
      <div className="grid grid-cols-5 h-16">
        <Link 
          href="/"
          className={`flex flex-col items-center justify-center ${
            isActive("/")
              ? "text-primary border-t-2 border-primary"
              : "text-neutral-400 hover:text-primary"
          }`}
        >
          <i className="ri-dashboard-line text-xl"></i>
          <span className="text-xs mt-1">Inicio</span>
        </Link>

        <Link 
          href="/machines"
          className={`flex flex-col items-center justify-center ${
            isActive("/machines")
              ? "text-primary border-t-2 border-primary"
              : "text-neutral-400 hover:text-primary"
          }`}
        >
          <i className="ri-truck-line text-xl"></i>
          <span className="text-xs mt-1">Unidades</span>
        </Link>

        <Link 
          href="/animals"
          className={`flex flex-col items-center justify-center ${
            isActive("/animals")
              ? "text-primary border-t-2 border-primary"
              : "text-neutral-400 hover:text-primary"
          }`}
        >
          <i className="ri-bear-smile-line text-xl"></i>
          <span className="text-xs mt-1">Animales</span>
        </Link>

        <Link 
          href="/finances"
          className={`flex flex-col items-center justify-center ${
            isActive("/finances")
              ? "text-primary border-t-2 border-primary"
              : "text-neutral-400 hover:text-primary"
          }`}
        >
          <i className="ri-money-dollar-circle-line text-xl"></i>
          <span className="text-xs mt-1">Finanzas</span>
        </Link>

        <button
          onClick={openMoreMenu}
          className="flex flex-col items-center justify-center text-neutral-400 hover:text-primary"
        >
          <i className="ri-more-line text-xl"></i>
          <span className="text-xs mt-1">Más</span>
        </button>
      </div>
    </nav>
  );
}
