import { ReactNode } from "react";

interface LoginLayoutProps {
  children: ReactNode;
}

export default function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80"
            alt="AgroGest Logo"
            className="w-20 h-20 mx-auto mb-4 rounded-xl"
          />
          <h1 className="font-header text-2xl font-bold text-primary mb-2">AgroGest</h1>
          <p className="text-neutral-400">Sistema de Gestión Agropecuaria</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          {children}
          <div className="mt-4 text-center">
            <p className="text-sm text-neutral-400">
              Versión 1.0.1 | Developed by AgroTech
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
