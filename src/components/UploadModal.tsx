import { useState, useCallback } from "react";
import { Upload, X, Eye, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, type: 'eye' | 'ultrasound') => void;
}

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanType, setScanType] = useState<'eye' | 'ultrasound'>('eye');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile, scanType);
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-lg animate-fade-in">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-secondary transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <h2 className="text-xl font-semibold text-foreground mb-6">Upload Medical Scan</h2>

        {/* Scan Type Selection */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setScanType('eye')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all duration-200",
              scanType === 'eye'
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye className="w-5 h-5" />
            <span className="font-medium">Eye Scan</span>
          </button>
          <button
            onClick={() => setScanType('ultrasound')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all duration-200",
              scanType === 'ultrasound'
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            <Radio className="w-5 h-5" />
            <span className="font-medium">Ultrasound</span>
          </button>
        </div>

        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground",
            previewUrl && "border-solid border-primary"
          )}
        >
          {previewUrl ? (
            <div className="space-y-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-48 mx-auto rounded-lg object-contain"
              />
              <p className="text-sm text-muted-foreground">{selectedFile?.name}</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-foreground font-medium mb-2">
                Drop your scan here or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG, DICOM formats
              </p>
            </>
          )}
          
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="glow"
            onClick={handleSubmit}
            disabled={!selectedFile}
            className="flex-1"
          >
            Analyze Scan
          </Button>
        </div>
      </div>
    </div>
  );
}
