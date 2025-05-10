import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onChange: (file: File | null) => void;
  value?: string | null;
  className?: string;
  label?: string;
  accept?: string;
  maxSize?: number; // en MB
}

export function ImageUpload({
  onChange,
  value,
  className,
  label = "Imagen",
  accept = "image/jpeg,image/png,image/webp",
  maxSize = 5, // 5MB por defecto
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      setError(`El archivo excede el tamaño máximo permitido (${maxSize}MB)`);
      return;
    }

    // Validar tipo de archivo
    if (!accept.includes(file.type)) {
      setError(`Tipo de archivo no permitido. Use: ${accept.replace(/image\//g, '')}`);
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onChange(file);
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      
      <div className="flex flex-col items-center space-y-4">
        {preview ? (
          <div className="relative w-full max-w-xs">
            <img 
              src={preview} 
              alt="Vista previa" 
              className="w-full h-auto rounded-md object-cover max-h-64"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-6 w-full max-w-xs flex flex-col items-center justify-center gap-2">
            <ImageIcon className="h-12 w-12 text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Capture una foto o seleccione un archivo
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleCameraCapture}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            <span>Cámara</span>
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleFileSelect}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            <span>Archivo</span>
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept={accept}
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}