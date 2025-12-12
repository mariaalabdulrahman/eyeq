import { useState, useRef, useEffect, useMemo } from "react";
import UTIF from 'utif';
import { ScanAnalysis } from "@/types/scan";
import { cn } from "@/lib/utils";
import { Circle, Eye, Microscope, Activity, Target, Flame } from "lucide-react";
import { TifImage } from "../TifImage";

interface VisualizationViewProps {
  scan: ScanAnalysis;
}

type FilterType = 'original' | 'vessel' | 'optic' | 'xai';

const filters: { type: FilterType; icon: React.ElementType; label: string }[] = [
  { type: 'original', icon: Circle, label: 'Original' },
  { type: 'vessel', icon: Activity, label: 'Vessel Segmentation' },
  { type: 'optic', icon: Target, label: 'Optic Cup & Disc' },
  { type: 'xai', icon: Flame, label: 'xAI Heat Map' },
];

// Enhanced vessel segmentation with better highlighting
const applyVesselSegmentation = (imageData: ImageData): ImageData => {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const output = new Uint8ClampedArray(data.length);
  
  // Extract green channel (best for vessel visibility)
  const greenChannel = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    greenChannel[i] = data[i * 4 + 1];
  }
  
  // Apply multi-scale vessel detection
  const vesselMask = new Float32Array(width * height);
  
  // Simple but effective vessel detection using local contrast
  for (let y = 3; y < height - 3; y++) {
    for (let x = 3; x < width - 3; x++) {
      const idx = y * width + x;
      const center = greenChannel[idx];
      
      // Calculate local mean in different directions
      let horizontalDiff = 0;
      let verticalDiff = 0;
      let diag1Diff = 0;
      let diag2Diff = 0;
      
      for (let k = 1; k <= 3; k++) {
        // Horizontal
        horizontalDiff += Math.abs(center - greenChannel[idx - k]) + Math.abs(center - greenChannel[idx + k]);
        // Vertical  
        verticalDiff += Math.abs(center - greenChannel[idx - k * width]) + Math.abs(center - greenChannel[idx + k * width]);
        // Diagonal
        diag1Diff += Math.abs(center - greenChannel[idx - k * width - k]) + Math.abs(center - greenChannel[idx + k * width + k]);
        diag2Diff += Math.abs(center - greenChannel[idx - k * width + k]) + Math.abs(center - greenChannel[idx + k * width - k]);
      }
      
      // Vessel-like structures have high contrast perpendicular to vessel direction
      const minDiff = Math.min(horizontalDiff, verticalDiff, diag1Diff, diag2Diff);
      const maxDiff = Math.max(horizontalDiff, verticalDiff, diag1Diff, diag2Diff);
      
      // High ratio indicates vessel-like structure
      if (maxDiff > 30 && minDiff < maxDiff * 0.6) {
        vesselMask[idx] = (maxDiff - minDiff) / 255;
      }
      
      // Also detect dark linear structures (vessels appear dark on fundus)
      const neighbors = [
        greenChannel[idx - 1], greenChannel[idx + 1],
        greenChannel[idx - width], greenChannel[idx + width],
        greenChannel[idx - width - 1], greenChannel[idx - width + 1],
        greenChannel[idx + width - 1], greenChannel[idx + width + 1],
      ];
      const avgNeighbor = neighbors.reduce((a, b) => a + b) / 8;
      
      if (center < avgNeighbor - 15) {
        vesselMask[idx] = Math.max(vesselMask[idx], (avgNeighbor - center) / 100);
      }
    }
  }
  
  // Normalize vessel mask
  let maxV = 0;
  for (let i = 0; i < vesselMask.length; i++) {
    if (vesselMask[i] > maxV) maxV = vesselMask[i];
  }
  
  // Generate output with highlighted vessels
  for (let i = 0; i < width * height; i++) {
    const px = i * 4;
    const normalized = maxV > 0 ? vesselMask[i] / maxV : 0;
    const isVessel = normalized > 0.2;
    
    // Background: dark grayscale
    const gray = (data[px] * 0.3 + data[px + 1] * 0.59 + data[px + 2] * 0.11) * 0.35;
    
    if (isVessel) {
      // Vessels: bright green/cyan gradient based on intensity
      const intensity = Math.min(1, normalized * 1.5);
      output[px] = Math.round(30 * (1 - intensity)); // R
      output[px + 1] = Math.round(180 + 75 * intensity); // G - bright green
      output[px + 2] = Math.round(100 * intensity); // B - slight cyan tint
      output[px + 3] = 255;
    } else {
      output[px] = gray;
      output[px + 1] = gray;
      output[px + 2] = gray;
      output[px + 3] = 255;
    }
  }
  
  return new ImageData(output, width, height);
};

// Simple Gaussian blur
const gaussianBlur = (input: Float32Array, width: number, height: number, sigma: number): Float32Array => {
  const output = new Float32Array(input.length);
  const kernelSize = Math.ceil(sigma * 3) * 2 + 1;
  const halfKernel = Math.floor(kernelSize / 2);
  
  // Create 1D kernel
  const kernel = new Float32Array(kernelSize);
  let sum = 0;
  for (let i = 0; i < kernelSize; i++) {
    const x = i - halfKernel;
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
    sum += kernel[i];
  }
  for (let i = 0; i < kernelSize; i++) kernel[i] /= sum;
  
  // Horizontal pass
  const temp = new Float32Array(input.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let val = 0;
      for (let k = -halfKernel; k <= halfKernel; k++) {
        const nx = Math.min(width - 1, Math.max(0, x + k));
        val += input[y * width + nx] * kernel[k + halfKernel];
      }
      temp[y * width + x] = val;
    }
  }
  
  // Vertical pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let val = 0;
      for (let k = -halfKernel; k <= halfKernel; k++) {
        const ny = Math.min(height - 1, Math.max(0, y + k));
        val += temp[ny * width + x] * kernel[k + halfKernel];
      }
      output[y * width + x] = val;
    }
  }
  
  return output;
};

export function VisualizationView({ scan }: VisualizationViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('original');
  const [activeImage, setActiveImage] = useState<'fundus' | 'oct'>('fundus');
  const [normalizedOctUrl, setNormalizedOctUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentImageUrl = activeImage === 'fundus' ? scan.imageUrl : (normalizedOctUrl || scan.linkedOctUrl);

  // Memoized processing to avoid re-computation
  const processImage = useMemo(() => {
    return async (imageUrl: string, filterType: FilterType): Promise<string | null> => {
      if (filterType === 'original') return null;

      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Use reasonable size for processing
          const maxSize = 600;
          const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const width = canvas.width;
          const height = canvas.height;

          if (filterType === 'vessel') {
            // Apply enhanced vessel segmentation
            const vesselData = applyVesselSegmentation(imageData);
            ctx.putImageData(vesselData, 0, 0);
          } else if (filterType === 'optic') {
            // Optic disc detection - find brightest region (optic disc is typically bright)
            const centerX = width / 2;
            const centerY = height / 2;
            
            for (let y = 0; y < height; y++) {
              for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const brightness = (r + g + b) / 3;
                
                // Distance from center (optic disc often near center)
                const dist = Math.sqrt(Math.pow(x - centerX * 0.8, 2) + Math.pow(y - centerY, 2));
                const maxDist = Math.min(width, height) * 0.15;
                
                if (brightness > 180 || (brightness > 140 && dist < maxDist)) {
                  // Optic disc region - highlight in yellow
                  data[i] = 255;
                  data[i + 1] = 200;
                  data[i + 2] = 0;
                  data[i + 3] = 200;
                } else if (brightness > 120 && dist < maxDist * 1.5) {
                  // Optic cup region - highlight in orange
                  data[i] = 255;
                  data[i + 1] = 100;
                  data[i + 2] = 0;
                  data[i + 3] = 180;
                } else {
                  // Background - subtle grayscale
                  const grayVal = (r * 0.3 + g * 0.59 + b * 0.11);
                  data[i] = grayVal * 0.7;
                  data[i + 1] = grayVal * 0.7;
                  data[i + 2] = grayVal * 0.7;
                }
              }
            }
            ctx.putImageData(imageData, 0, 0);
          } else if (filterType === 'xai') {
            // xAI Heat map - show attention/importance areas
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              
              // Calculate intensity
              const intensity = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
              
              // Map to heat colors
              let tr, tg, tb;
              if (intensity < 0.25) {
                tr = 0;
                tg = 0;
                tb = Math.floor(180 + intensity * 4 * 75);
              } else if (intensity < 0.5) {
                const t = (intensity - 0.25) * 4;
                tr = 0;
                tg = Math.floor(t * 255);
                tb = 255;
              } else if (intensity < 0.75) {
                const t = (intensity - 0.5) * 4;
                tr = Math.floor(t * 255);
                tg = 255;
                tb = Math.floor(255 * (1 - t));
              } else {
                const t = (intensity - 0.75) * 4;
                tr = 255;
                tg = Math.floor(255 * (1 - t));
                tb = 0;
              }
              
              data[i] = tr;
              data[i + 1] = tg;
              data[i + 2] = tb;
            }
            ctx.putImageData(imageData, 0, 0);
          }

          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => resolve(null);
        img.src = imageUrl;
      });
    };
  }, []);

  useEffect(() => {
    // Normalize OCT URL so filters work even when original is a .tif file
    if (!scan.linkedOctUrl) {
      setNormalizedOctUrl(null);
      return;
    }

    const src = scan.linkedOctUrl;
    const isDataUrl = src.startsWith('data:');
    const isTif = src.toLowerCase().endsWith('.tif') || src.toLowerCase().endsWith('.tiff');

    if (isDataUrl || !isTif) {
      setNormalizedOctUrl(src);
      return;
    }

    const convertTifUrlToPng = async () => {
      try {
        const response = await fetch(src);
        const arrayBuffer = await response.arrayBuffer();
        const ifds = UTIF.decode(arrayBuffer);
        if (!ifds || ifds.length === 0) {
          setNormalizedOctUrl(src);
          return;
        }
        UTIF.decodeImage(arrayBuffer, ifds[0]);
        const rgba = UTIF.toRGBA8(ifds[0]);
        const canvas = document.createElement('canvas');
        canvas.width = ifds[0].width;
        canvas.height = ifds[0].height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setNormalizedOctUrl(src);
          return;
        }
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        imageData.data.set(rgba);
        ctx.putImageData(imageData, 0, 0);
        setNormalizedOctUrl(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Failed to normalize OCT TIF for visualization:', err);
        setNormalizedOctUrl(src);
      }
    };

    convertTifUrlToPng();
  }, [scan.linkedOctUrl]);

  useEffect(() => {
    if (activeFilter === 'original' || !currentImageUrl) {
      setProcessedImageUrl(null);
      return;
    }

    setIsProcessing(true);
    processImage(currentImageUrl, activeFilter).then((url) => {
      setProcessedImageUrl(url);
      setIsProcessing(false);
    });
  }, [activeFilter, currentImageUrl, processImage]);

  return (
    <div className="h-full flex flex-col gap-4">
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

      {/* Images Display */}
      <div className={cn("flex-1 bg-card border border-border rounded-xl p-4 flex flex-col", scan.linkedOctUrl && activeFilter === 'original' && "grid grid-cols-2 gap-4")}>
        {scan.linkedOctUrl && activeFilter === 'original' ? (
          <>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">Fundus Image</h3>
              </div>
              <div className="flex-1 flex items-center justify-center bg-secondary/30 rounded-lg overflow-hidden">
                <img src={scan.imageUrl} alt="Fundus" className="max-w-full max-h-full object-contain" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Microscope className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">OCT Scan</h3>
              </div>
              <div className="flex-1 flex items-center justify-center bg-secondary/30 rounded-lg overflow-hidden">
                <TifImage 
                  src={scan.linkedOctUrl} 
                  alt="OCT" 
                  className="max-w-full max-h-full object-contain" 
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">
                {activeImage === 'fundus' ? 'Fundus Image' : 'OCT Scan'}
              </h3>
              <span className="text-sm text-muted-foreground capitalize">
                {activeFilter === 'vessel' ? 'Vessel Segmentation' : 
                 activeFilter === 'optic' ? 'Optic Cup & Disc' : 
                 activeFilter === 'xai' ? 'xAI Heat Map' : 'Original'} View
              </span>
            </div>
            
            <div className="flex-1 flex items-center justify-center bg-secondary/30 rounded-lg overflow-hidden relative">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">Processing...</span>
                </div>
        ) : activeImage === 'oct' && scan.linkedOctUrl ? (
                // For OCT images (TIF files), use TifImage component
                // When filter is applied, show the processed image, otherwise show original TIF
                processedImageUrl ? (
                  <img
                    src={processedImageUrl}
                    alt={scan.name}
                    className="max-w-full max-h-full object-contain transition-all duration-300"
                  />
                ) : (
                  <TifImage
                    src={scan.linkedOctUrl}
                    alt={scan.name}
                    className="max-w-full max-h-full object-contain transition-all duration-300"
                  />
                )
              ) : (
                <img
                  src={processedImageUrl || currentImageUrl}
                  alt={scan.name}
                  className="max-w-full max-h-full object-contain transition-all duration-300"
                />
              )}
              
              {/* xAI color bar */}
              {activeFilter === 'xai' && !isProcessing && (
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
                {activeFilter === 'vessel' && "Vessel segmentation using Frangi filter-based enhancement highlights retinal blood vessels in green. This method analyzes local image structure using eigenvalue analysis to detect tubular structures. Useful for detecting vascular abnormalities, hemorrhages, and changes associated with diabetic retinopathy."}
                {activeFilter === 'optic' && "Optic cup and disc detection highlights the optic nerve head. Yellow indicates the optic disc boundary, orange shows the cup. The cup-to-disc ratio is important for glaucoma assessment."}
                {activeFilter === 'xai' && "xAI (Explainable AI) heat map shows areas the AI model focuses on during analysis. Red/yellow indicates high attention areas, blue indicates low attention. Helps understand AI decision-making."}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
