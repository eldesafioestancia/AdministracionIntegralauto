/**
 * Servicio para la carga de archivos al servidor
 */

// Función para comprimir imagen antes de subirla
export async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calcular nuevas dimensiones manteniendo la relación de aspecto
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto del canvas'));
          return;
        }
        
        // Dibujar imagen en el canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir a Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al comprimir la imagen'));
              return;
            }
            
            const compressedFile = new File(
              [blob], 
              file.name, 
              {
                type: file.type,
                lastModified: Date.now()
              }
            );
            
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Error al cargar la imagen para compresión'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo para compresión'));
    };
  });
}

// Función para subir un archivo al servidor
export async function uploadFile(file: File, entityType: string): Promise<string> {
  try {
    // Comprimir imagen si es un tipo de imagen
    let fileToUpload = file;
    if (file.type.startsWith('image/')) {
      fileToUpload = await compressImage(file);
    }
    
    // Crear FormData para enviar al servidor
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('entityType', entityType);
    
    // Realizar la petición al servidor
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Error al subir el archivo');
    }
    
    const data = await response.json();
    return data.fileUrl;
  } catch (error) {
    console.error('Error en uploadFile:', error);
    throw error;
  }
}

// Función para convertir una URL de imagen a Base64 (para previsualización)
export function imageUrlToBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No se pudo obtener el contexto del canvas'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    
    img.onerror = () => {
      reject(new Error('Error al cargar la imagen para conversión'));
    };
    
    img.src = url;
  });
}