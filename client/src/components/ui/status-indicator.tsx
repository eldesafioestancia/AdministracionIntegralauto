interface StatusIndicatorProps {
  isOffline: boolean;
  showText?: boolean;
}

export default function StatusIndicator({ isOffline, showText = true }: StatusIndicatorProps) {
  return (
    <div className="flex items-center">
      <span 
        className={`inline-block h-2 w-2 rounded-full ${
          isOffline ? 'bg-destructive sync-pulse' : 'bg-success'
        } mr-2`}
      ></span>
      {showText && (
        <span className="text-xs text-neutral-400">
          {isOffline ? 'Sin conexión' : 'En línea'}
        </span>
      )}
    </div>
  );
}
