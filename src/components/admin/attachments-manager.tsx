'use client';

import { useState } from 'react';
import { FileText, Trash2, Edit2, GripVertical, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export interface AttachmentData {
  id?: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  caption?: string | null;
  captionEn?: string | null;
  captionFr?: string | null;
}

interface AttachmentsManagerProps {
  value: AttachmentData[];
  onChange: (attachments: AttachmentData[]) => void;
  maxAttachments?: number;
}

export function AttachmentsManager({
  value,
  onChange,
  maxAttachments = 10,
}: AttachmentsManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<AttachmentData | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check total limit
    if (value.length + files.length > maxAttachments) {
      alert(`Massimo ${maxAttachments} allegati permessi. Hai selezionato ${files.length} file ma puoi aggiungerne solo ${maxAttachments - value.length}.`);
      return;
    }

    setUploading(true);
    const newAttachments: AttachmentData[] = [];
    let errorCount = 0;

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Valida dimensione (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        alert(`File "${file.name}" troppo grande. Massimo 100MB`);
        errorCount++;
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          const fileUrl = data.data?.url || data.url;

          if (fileUrl) {
            newAttachments.push({
              url: fileUrl,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type,
            });
          } else {
            errorCount++;
            console.error(`No URL in response for ${file.name}`);
          }
        } else {
          errorCount++;
          const errorData = await response.json();
          console.error(`Upload failed for ${file.name}:`, errorData.message);
        }
      } catch (error) {
        errorCount++;
        console.error('Upload error:', error);
      }
    }

    if (newAttachments.length > 0) {
      onChange([...value, ...newAttachments]);
    }

    if (errorCount > 0) {
      alert(`${newAttachments.length} file caricati con successo, ${errorCount} falliti.`);
    }

    setUploading(false);
    // Reset input
    e.target.value = '';
  };

  const handleRemove = (index: number) => {
    if (confirm('Rimuovere questo allegato?')) {
      onChange(value.filter((_, i) => i !== index));
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditData({ ...value[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editData) {
      const updated = [...value];
      updated[editingIndex] = editData;
      onChange(updated);
      setEditingIndex(null);
      setEditData(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-500 transition-colors">
        <label className="flex flex-col items-center cursor-pointer">
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <span className="text-sm text-gray-600 mb-1">
            {uploading ? 'Caricamento...' : 'Carica PDF o Documento'}
          </span>
          <span className="text-xs text-gray-500">
            PDF, DOC, DOCX (max 100MB)
          </span>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            multiple
            onChange={handleFileSelect}
            disabled={uploading || value.length >= maxAttachments}
            className="hidden"
            key={value.length}
          />
        </label>
      </div>

      {/* Lista Allegati */}
      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 font-medium">
            Allegati ({value.length}/{maxAttachments})
          </p>
          {value.map((attachment, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
              <FileText className="h-8 w-8 text-red-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {attachment.fileName}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(attachment.fileSize)}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(index)}
                  title="Modifica metadata"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  title="Rimuovi"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog Edit Metadata */}
      {editingIndex !== null && editData && (
        <Dialog open={true} onOpenChange={() => setEditingIndex(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifica Metadata Allegato</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Descrizione (Italiano)
                </label>
                <Textarea
                  value={editData.caption || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, caption: e.target.value })
                  }
                  rows={2}
                  placeholder="Descrizione opzionale in italiano"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Descrizione (English)
                </label>
                <Textarea
                  value={editData.captionEn || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, captionEn: e.target.value })
                  }
                  rows={2}
                  placeholder="Optional description in English"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Descrizione (Français)
                </label>
                <Textarea
                  value={editData.captionFr || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, captionFr: e.target.value })
                  }
                  rows={2}
                  placeholder="Description facultative en français"
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingIndex(null)}
              >
                Annulla
              </Button>
              <Button type="button" onClick={handleSaveEdit}>
                Salva
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
