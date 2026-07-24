"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  IconCamera,
  IconPhoto,
  IconSparkles,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { compressImages } from "../utils/compress-image";

const MAX_IMAGES = 4;

type ImageImportTabProps = {
  onAnalyze: (images: File[]) => void;
  isAnalyzing: boolean;
};

export const ImageImportTab = ({ onAnalyze, isAnalyzing }: ImageImportTabProps) => {
  const [images, setImages] = useState<Array<{ file: File; preview: string }>>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const addImages = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) return;

    setIsCompressing(true);
    try {
      const remaining = MAX_IMAGES - images.length;
      const toAdd = fileArray.slice(0, remaining);
      const compressed = await compressImages(toAdd);

      const newEntries = compressed.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setImages((prev) => [...prev, ...newEntries].slice(0, MAX_IMAGES));
    } finally {
      setIsCompressing(false);
    }
  }, [images.length]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await addImages(e.target.files);
      e.target.value = "";
    }
  };

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        await addImages(imageFiles);
      }
    },
    [addImages],
  );

  const handleRemove = (index: number) => {
    setImages((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const handleAnalyze = () => {
    if (images.length === 0) return;
    onAnalyze(images.map((img) => img.file));
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      await addImages(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4" onPaste={handlePaste}>
      <Card className="p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <IconPhoto className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              Upload or paste screenshots of your SMS thread, bank app, or payment
              notifications. AI will read and extract transactions.
            </p>
            <p className="text-xs">
              Up to {MAX_IMAGES} images. You can also paste from clipboard (Ctrl+V / Cmd+V).
            </p>
          </div>
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        id="image-file-input"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        id="camera-input"
      />

      {images.length === 0 ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload screenshots"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center gap-3 h-36 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <IconUpload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center px-4">
            Drop screenshots here, click to browse, or paste from clipboard
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {images.map((img, index) => (
            <div key={img.preview} className="relative group rounded-lg overflow-hidden border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.preview}
                alt={`Screenshot ${index + 1}`}
                className="w-full h-28 object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 p-1 rounded-full bg-background/80 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove screenshot ${index + 1}`}
              >
                <IconTrash className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-1 h-28 border-2 border-dashed rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors"
              aria-label="Add another screenshot"
            >
              <IconUpload className="h-5 w-5" />
              <span className="text-xs">Add more</span>
            </button>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => cameraInputRef.current?.click()}
          disabled={images.length >= MAX_IMAGES || isCompressing}
        >
          <IconCamera className="h-4 w-4" />
          Camera
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= MAX_IMAGES || isCompressing}
        >
          <IconPhoto className="h-4 w-4" />
          Gallery
        </Button>
      </div>

      <Button
        onClick={handleAnalyze}
        disabled={isAnalyzing || isCompressing || images.length === 0}
        className="w-full gap-2"
      >
        <IconSparkles className="h-4 w-4" />
        {isAnalyzing ? "Analyzing..." : isCompressing ? "Preparing..." : "Analyze Screenshots"}
      </Button>
    </div>
  );
};
