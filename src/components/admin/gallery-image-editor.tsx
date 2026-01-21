'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { GalleryImage } from '@/lib/types/gallery';

interface GalleryImageEditorProps {
  image: GalleryImage | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (image: GalleryImage) => void;
}

export function GalleryImageEditor({
  image,
  isOpen,
  onClose,
  onSave,
}: GalleryImageEditorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Update form when image changes
  useEffect(() => {
    if (image) {
      setTitle(image.title || '');
      setDescription(image.description || '');
    }
  }, [image]);

  const handleSave = () => {
    if (!image) return;

    onSave({
      ...image,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
    });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle className="text-slate-900">Modifica Caption</DialogTitle>
          <DialogDescription>
            Aggiungi titolo e descrizione per questa immagine della galleria.
          </DialogDescription>
        </DialogHeader>

        {image && (
          <div className="space-y-4 py-4">
            {/* Image preview */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
              <img
                src={image.url}
                alt={image.title || 'Preview'}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title input */}
            <div className="space-y-2">
              <Label htmlFor="image-title" className="text-slate-900">
                Titolo
              </Label>
              <Input
                id="image-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Inserisci un titolo..."
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>

            {/* Description input */}
            <div className="space-y-2">
              <Label htmlFor="image-description" className="text-slate-900">
                Descrizione
              </Label>
              <Textarea
                id="image-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Aggiungi una descrizione..."
                rows={3}
                className="bg-white border-slate-300 text-slate-900 resize-none"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Salva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
