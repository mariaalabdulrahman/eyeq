import { useState, useEffect } from 'react';
import UTIF from 'utif';

interface TifImageProps {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

export function TifImage({ src, alt = '', style, className, onClick }: TifImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      // If it's already a data URL or regular image URL, just use it
      if (src.startsWith('data:') || src.startsWith('http')) {
        setImageSrc(src);
        setLoading(false);
        return;
      }

      // Check if it's a TIF/TIFF file by URL extension
      const isTif = src.toLowerCase().endsWith('.tif') || src.toLowerCase().endsWith('.tiff');
      
      if (isTif) {
        try {
          const response = await fetch(src);
          const arrayBuffer = await response.arrayBuffer();
          const ifds = UTIF.decode(arrayBuffer);
          
          if (ifds.length === 0) {
            throw new Error('No images found in TIF file');
          }
          
          UTIF.decodeImage(arrayBuffer, ifds[0]);
          const rgba = UTIF.toRGBA8(ifds[0]);
          
          const canvas = document.createElement('canvas');
          canvas.width = ifds[0].width;
          canvas.height = ifds[0].height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Could not get canvas context');
          }
          
          const imageData = ctx.createImageData(canvas.width, canvas.height);
          imageData.data.set(rgba);
          ctx.putImageData(imageData, 0, 0);
          
          setImageSrc(canvas.toDataURL('image/png'));
          setLoading(false);
        } catch (err) {
          console.error('Failed to load TIF image:', err);
          setError(true);
          setLoading(false);
        }
      } else {
        // For non-TIF, just use the URL directly
        setImageSrc(src);
        setLoading(false);
      }
    };

    if (src) {
      loadImage();
    }
  }, [src]);

  if (loading) {
    return (
      <div 
        style={{ 
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
        }}
        className={className}
      >
        <div style={{ 
          width: '24px', 
          height: '24px', 
          border: '2px solid #e5e7eb',
          borderTopColor: '#0891b2',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !imageSrc) {
    return (
      <div 
        style={{ 
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          color: '#9ca3af',
          fontSize: '12px',
        }}
        className={className}
      >
        Failed to load image
      </div>
    );
  }

  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      style={style} 
      className={className}
      onClick={onClick}
    />
  );
}
