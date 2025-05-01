interface OfflineBannerProps {
  pendingChanges: number;
}

export default function OfflineBanner({ pendingChanges }: OfflineBannerProps) {
  return (
    <div 
      className="fixed bottom-16 lg:bottom-4 left-0 right-0 mx-auto w-full max-w-sm bg-destructive bg-opacity-90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center justify-between z-50"
    >
      <div className="flex items-center">
        <i className="ri-wifi-off-line mr-2"></i>
        <span>Modo sin conexión</span>
      </div>
      {pendingChanges > 0 && (
        <div className="sync-pulse flex items-center">
          <span className="text-xs mr-1">Cambios por sincronizar</span>
          <span className="inline-flex items-center justify-center bg-white bg-opacity-20 text-white text-xs rounded-full h-5 w-5">
            {pendingChanges}
          </span>
        </div>
      )}
    </div>
  );
}
