'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Upload,
  X,
  Loader2,
  GripVertical,
  Pencil,
  Images,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GalleryImageEditor } from './gallery-image-editor';
import type { GalleryImage } from '@/lib/types/gallery';
import { normalizeGalleryOrder } from '@/lib/types/gallery';

interface GalleryUploadProps {
  value: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  folder?: string;
  maxImages?: number;
  className?: string;
}

interface SortableImageItemProps {
  image: GalleryImage;
  onEdit: () => void;
  onRemove: () => void;
}

function SortableImageItem({ image, onEdit, onRemove }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={cn(
        'relative group rounded-xl overflow-hidden border border-slate-200/50 bg-slate-100/30',
        isDragging && 'z-50 shadow-2xl ring-2 ring-primary'
      )}
    >
      {/* Image */}
      <div className="aspect-video relative">
        <img
          src={image.url}
          alt={image.title || `Image ${image.order + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white cursor-grab active:cursor-grabbing transition-colors"
            title="Trascina per riordinare"
          >
            <GripVertical className="w-5 h-5" />
          </button>

          {/* Edit button */}
          <button
            onClick={onEdit}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
            title="Modifica caption"
          >
            <Pencil className="w-5 h-5" />
          </button>

          {/* Remove button */}
          <button
            onClick={onRemove}
            className="p-2 bg-red-500/80 hover:bg-red-600 rounded-lg text-white transition-colors"
            title="Rimuovi immagine"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order badge */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded text-white text-xs font-medium">
          {image.order + 1}
        </div>

        {/* Caption indicator */}
        {(image.title || image.description) && (
          <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-black/50 rounded text-white text-xs truncate">
            {image.title || image.description}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function GalleryUpload({
  value,
  onChange,
  folder = 'gallery',
  maxImages = 20,
  className,
}: GalleryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle file upload
  const handleUpload = useCallback(
    async (files: FileList) => {
      setError(null);

      const validFiles = Array.from(files).filter((file) => {
        if (!file.type.startsWith('image/')) {
          setError('Solo immagini sono consentite');
          return false;
        }
        if (file.size > 10 * 1024 * 1024) {
          setError('Dimensione massima: 10MB per immagine');
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      // Check max images limit
      if (value.length + validFiles.length > maxImages) {
        setError(`Massimo ${maxImages} immagini consentite`);
        return;
      }

      setIsUploading(true);
      const newImages: GalleryImage[] = [];

      for (const file of validFiles) {
        const tempId = `temp-${Date.now()}-${file.name}`;
        setUploadProgress((prev) => ({ ...prev, [tempId]: 0 }));

        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('folder', folder);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.message || 'Upload fallito');
          }

          setUploadProgress((prev) => ({ ...prev, [tempId]: 100 }));

          newImages.push({
            url: result.data.url,
            order: value.length + newImages.length,
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Errore durante l\'upload');
        } finally {
          setUploadProgress((prev) => {
            const next = { ...prev };
            delete next[tempId];
            return next;
          });
        }
      }

      if (newImages.length > 0) {
        onChange(normalizeGalleryOrder([...value, ...newImages]));
      }

      setIsUploading(false);
    },
    [value, onChange, folder, maxImages]
  );

  // Handle drag and drop files
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingFiles(false);
      if (e.dataTransfer.files.length > 0) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [handleUpload]
  );

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFiles(true);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFiles(false);
  }, []);

  // Handle file input change
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleUpload(e.target.files);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [handleUpload]
  );

  // Handle reorder (DnD kit)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex((img) => img.url === active.id);
      const newIndex = value.findIndex((img) => img.url === over.id);

      const newImages = arrayMove(value, oldIndex, newIndex);
      onChange(normalizeGalleryOrder(newImages));
    }
  };

  // Handle remove image
  const handleRemove = (url: string) => {
    const newImages = value.filter((img) => img.url !== url);
    onChange(normalizeGalleryOrder(newImages));
  };

  // Handle edit image caption
  const handleSaveCaption = (updatedImage: GalleryImage) => {
    const newImages = value.map((img) =>
      img.url === updatedImage.url ? updatedImage : img
    );
    onChange(newImages);
  };

  const uploadingCount = Object.keys(uploadProgress).length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload area */}
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={cn(
          'relative rounded-xl border-2 border-dashed transition-all cursor-pointer p-6',
          isDraggingFiles
            ? 'border-primary bg-primary/5'
            : 'border-slate-200/50 bg-slate-100/30 hover:border-primary/50 hover:bg-slate-100/50',
          isUploading && 'pointer-events-none opacity-50'
        )}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          {isUploading ? (
            <>
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-slate-600">
                Caricamento {uploadingCount} {uploadingCount === 1 ? 'immagine' : 'immagini'}...
              </p>
            </>
          ) : (
            <>
              <div className="p-3 bg-primary/10 rounded-xl">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-800">
                  Trascina le immagini qui
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  oppure clicca per selezionare
                </p>
              </div>
              <p className="text-xs text-slate-500">
                PNG, JPG, GIF, WebP (max 10MB) - {value.length}/{maxImages} immagini
              </p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Gallery grid with drag and drop */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Images className="w-4 h-4" />
            <span>Trascina per riordinare</span>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={value.map((img) => img.url)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <AnimatePresence>
                  {value.map((image) => (
                    <SortableImageItem
                      key={image.url}
                      image={image}
                      onEdit={() => setEditingImage(image)}
                      onRemove={() => handleRemove(image.url)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Edit modal */}
      <GalleryImageEditor
        image={editingImage}
        isOpen={!!editingImage}
        onClose={() => setEditingImage(null)}
        onSave={handleSaveCaption}
      />
    </div>
  );
}
