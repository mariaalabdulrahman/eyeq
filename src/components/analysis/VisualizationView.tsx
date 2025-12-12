import { useState, useRef, useEffect } from "react";
import { ScanAnalysis } from "@/types/scan";
import { cn } from "@/lib/utils";
import { Thermometer, Grid3X3, Circle, Contrast, Eye, Microscope } from "lucide-react";

interface VisualizationViewProps {
  scan: ScanAnalysis;
}

type FilterType = 'original' | 'thermal' | 'segmentation' | 'contrast';

const filters: { type: FilterType; icon: React.ElementType; label: string }[] = [
  { type: 'original', icon: Circle, label: 'Original' },
  { type: 'thermal', icon: Thermometer, label: 'Thermal' },
  { type: 'segmentation', icon: Grid3X3, label: 'Segmentation' },
  { type: 'contrast', icon: Contrast, label: 'High Contrast' },
];

export function VisualizationView({ scan }: VisualizationViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('original');
  const [activeImage, setActiveImage] = useState<'fundus' | 'oct'>('fundus');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [segmentedImageUrl, setSegmentedImageUrl] = useState<string | null>(null);
  const [thermalImageUrl, setThermalImageUrl] = useState<string | null>(null);

  const currentImageUrl = activeImage === 'fundus' ? scan.imageUrl : scan.linkedOctUrl;

  // Generate vessel segmentation overlay with improved algorithm
  useEffect(() => {
    if (activeFilter === 'segmentation' && activeImage === 'fundus' && scan.imageUrl) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Create grayscale and green channel for vessel detection
        const width = canvas.width;
        const height = canvas.height;
        const greenChannel = new Float32Array(width * height);
        
        // Extract green channel (best for vessel visibility in fundus)
        for (let i = 0; i < data.length; i += 4) {
          const idx = i / 4;
          greenChannel[idx] = data[i + 1]; // Green channel
        }
        
        // Apply adaptive thresholding for vessel detection
        const windowSize = Math.floor(Math.min(width, height) / 30);
        const vesselMask = new Uint8Array(width * height);
        
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            
            // Calculate local mean in window
            let sum = 0;
            let count = 0;
            for (let wy = Math.max(0, y - windowSize); wy < Math.min(height, y + windowSize); wy++) {
              for (let wx = Math.max(0, x - windowSize); wx < Math.min(width, x + windowSize); wx++) {
                sum += greenChannel[wy * width + wx];
                count++;
              }
            }
            const localMean = sum / count;
            
            // Vessel detection: darker than local mean with threshold
            const threshold = localMean * 0.85;
            if (greenChannel[idx] < threshold && greenChannel[idx] < 180) {
              vesselMask[idx] = 1;
            }
          }
        }
        
        // Apply vessel overlay to image
        for (let i = 0; i < data.length; i += 4) {
          const idx = i / 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          if (vesselMask[idx] === 1) {
            // Highlight vessels in bright green
            data[i] = 0;       // R
            data[i + 1] = 220; // G
            data[i + 2] = 50;  // B
            data[i + 3] = 230; // A
          } else {
            // Desaturate background
            const gray = (r * 0.3 + g * 0.59 + b * 0.11);
            data[i] = gray * 0.7;
            data[i + 1] = gray * 0.7;
            data[i + 2] = gray * 0.7;
            data[i + 3] = 255;
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        setSegmentedImageUrl(canvas.toDataURL());
      };
      img.src = scan.imageUrl;
    }
  }, [activeFilter, activeImage, scan.imageUrl]);

  // Generate thermal/heat map visualization
  useEffect(() => {
    if (activeFilter === 'thermal' && currentImageUrl) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Convert to thermal color map based on intensity
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calculate intensity (luminance)
          const intensity = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
          
          // Map to thermal colors (blue -> cyan -> green -> yellow -> red)
          let tr, tg, tb;
          if (intensity < 0.2) {
            // Deep blue to blue
            tr = 0;
            tg = 0;
            tb = Math.floor(128 + intensity * 5 * 127);
          } else if (intensity < 0.4) {
            // Blue to cyan
            const t = (intensity - 0.2) * 5;
            tr = 0;
            tg = Math.floor(t * 255);
            tb = 255;
          } else if (intensity < 0.6) {
            // Cyan to green
            const t = (intensity - 0.4) * 5;
            tr = 0;
            tg = 255;
            tb = Math.floor(255 * (1 - t));
          } else if (intensity < 0.8) {
            // Green to yellow
            const t = (intensity - 0.6) * 5;
            tr = Math.floor(t * 255);
            tg = 255;
            tb = 0;
          } else {
            // Yellow to red
            const t = (intensity - 0.8) * 5;
            tr = 255;
            tg = Math.floor(255 * (1 - t));
            tb = 0;
          }
          
          data[i] = tr;
          data[i + 1] = tg;
          data[i + 2] = tb;
        }
        
        ctx.putImageData(imageData, 0, 0);
        setThermalImageUrl(canvas.toDataURL());
      };
      img.src = currentImageUrl;
    }
  }, [activeFilter, currentImageUrl]);

  const getFilterStyle = (): React.CSSProperties => {
    switch (activeFilter) {
      case 'contrast':
        return {
          filter: 'contrast(200%) brightness(1.1) saturate(1.2)',
        };
      default:
        return {};
    }
  };

  const getDisplayImage = () => {
    if (activeFilter === 'segmentation' && segmentedImageUrl && activeImage === 'fundus') {
      return segmentedImageUrl;
    }
    if (activeFilter === 'thermal' && thermalImageUrl) {
      return thermalImageUrl;
    }
    return currentImageUrl;
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Image Toggle (if OCT available) */}
      {scan.linkedOctUrl && (
        <div className="flex gap-2 bg-card border border-border rounded-xl p-3">
          <button
            onClick={() => setActiveImage('fundus')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeImage === 'fundus'
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            <Eye className="w-4 h-4" />
            Fundus
          </button>
          <button
            onClick={() => setActiveImage('oct')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeImage === 'oct'
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            <Microscope className="w-4 h-4" />
            OCT
          </button>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 bg-card border border-border rounded-xl p-4">
        {filters.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              activeFilter === type
                ? "bg-primary text-primary-foreground glow-primary"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Images Display - Side by side if both available */}
      <div className={cn("flex-1 bg-card border border-border rounded-xl p-4 flex flex-col", scan.linkedOctUrl && activeFilter === 'original' && "grid grid-cols-2 gap-4")}>
        {scan.linkedOctUrl && activeFilter === 'original' ? (
          // Show both images side by side
          <>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">Fundus Image</h3>
              </div>
              <div className="flex-1 flex items-center justify-center bg-secondary/30 rounded-lg overflow-hidden">
                <img
                  src={scan.imageUrl}
                  alt="Fundus"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Microscope className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">OCT Scan</h3>
              </div>
              <div className="flex-1 flex items-center justify-center bg-secondary/30 rounded-lg overflow-hidden">
                <img
                  src={scan.linkedOctUrl}
                  alt="OCT"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          </>
        ) : (
          // Single image with filter
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">
                {activeImage === 'fundus' ? 'Fundus Image' : 'OCT Scan'}
              </h3>
              <span className="text-sm text-muted-foreground capitalize">
                {activeFilter} View
              </span>
            </div>
            
            <div className="flex-1 flex items-center justify-center bg-secondary/30 rounded-lg overflow-hidden relative">
              <img
                src={getDisplayImage()}
                alt={scan.name}
                className="max-w-full max-h-full object-contain transition-all duration-300"
                style={activeFilter === 'contrast' ? getFilterStyle() : {}}
              />
              
              {/* Thermal color bar */}
              {activeFilter === 'thermal' && (
                <div className="absolute right-4 top-4 bottom-4 w-6 rounded-lg overflow-hidden border border-border">
                  <div className="w-full h-full" style={{
                    background: 'linear-gradient(to bottom, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff)',
                  }} />
                  <div className="absolute -top-1 left-full ml-2 text-xs text-foreground font-medium">High</div>
                  <div className="absolute -bottom-1 left-full ml-2 text-xs text-foreground font-medium">Low</div>
                </div>
              )}
            </div>

            {/* Info Panel */}
            <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {activeFilter === 'original' && "Original scan without any processing. Shows the raw image as captured."}
                {activeFilter === 'thermal' && "Thermal heat map visualization showing intensity distribution. Red/yellow indicates high intensity areas, blue indicates low intensity. Useful for identifying areas of increased vascular activity or abnormal tissue."}
                {activeFilter === 'segmentation' && "Automated vessel segmentation using adaptive thresholding on the green channel. Blood vessels are highlighted in green. The algorithm analyzes local contrast to detect the dark vessel structures against the brighter retinal background."}
                {activeFilter === 'contrast' && "High contrast mode with enhanced saturation to reveal subtle features and tissue boundaries. Useful for detecting early-stage pathological changes."}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
