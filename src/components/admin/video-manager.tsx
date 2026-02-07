'use client';

import { useState } from 'react';
import { Film, Trash2, Edit2, Youtube, Upload as UploadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export interface VideoData {
  id?: string;
  url: string;
  type: 'youtube' | 'vimeo' | 'upload';
  fileName?: string | null;
  fileSize?: number | null;
  thumbnail?: string | null;
  title?: string | null;
  titleEn?: string | null;
  titleFr?: string | null;
  caption?: string | null;
  captionEn?: string | null;
  captionFr?: string | null;
}

interface VideoManagerProps {
  value: VideoData[];
  onChange: (videos: VideoData[]) => void;
  maxVideos?: number;
}

export function VideoManager({
  value,
  onChange,
  maxVideos = 5,
}: VideoManagerProps) {
  const [mode, setMode] = useState<'embed' | 'upload'>('embed');
  const [embedUrl, setEmbedUrl] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<VideoData | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleAddEmbed = () => {
    if (!embedUrl.trim()) {
      alert('Inserisci un URL video');
      return;
    }

    if (value.length >= maxVideos) {
      alert(`Massimo ${maxVideos} video permessi`);
      return;
    }

    // Determina tipo video
    let type: 'youtube' | 'vimeo' | 'upload' = 'upload';
    if (embedUrl.includes('youtube.com') || embedUrl.includes('youtu.be')) {
      type = 'youtube';
    } else if (embedUrl.includes('vimeo.com')) {
      type = 'vimeo';
    }

    const newVideo: VideoData = {
      url: embedUrl,
      type,
    };

    onChange([...value, newVideo]);
    setEmbedUrl('');
  };

  const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (value.length >= maxVideos) {
      alert(`Massimo ${maxVideos} video permessi`);
      return;
    }

    // Valida dimensione (500MB max)
    if (file.size > 500 * 1024 * 1024) {
      alert('File troppo grande. Massimo 500MB');
      return;
    }

    setUploading(true);

    try {
      // Upload via API /api/upload
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // API returns { success, data: { url, ... } }
        const videoUrl = data.data?.url || data.url;

        if (!videoUrl) {
          alert('Errore: URL video mancante nella risposta');
          return;
        }

        const newVideo: VideoData = {
          url: videoUrl,
          type: 'upload',
          fileName: file.name,
          fileSize: file.size,
        };
        onChange([...value, newVideo]);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Errore nell\'upload del video');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Errore nell\'upload del video');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemove = (index: number) => {
    if (confirm('Rimuovere questo video?')) {
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
    if (bytes < 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  return (
    <div className="space-y-3">
      {/* Mode Selector */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setMode('embed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            mode === 'embed'
              ? 'bg-green-100 text-green-700 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Youtube className="h-4 w-4" />
          Embed YouTube/Vimeo
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            mode === 'upload'
              ? 'bg-green-100 text-green-700 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <UploadIcon className="h-4 w-4" />
          Upload Video
        </button>
      </div>

      {/* Embed Mode */}
      {mode === 'embed' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="https://www.youtube.com/watch?v=... o https://vimeo.com/..."
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddEmbed();
                }
              }}
            />
            <Button type="button" onClick={handleAddEmbed}>
              Aggiungi
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Incolla l'URL completo del video YouTube o Vimeo
          </p>
        </div>
      )}

      {/* Upload Mode */}
      {mode === 'upload' && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-500 transition-colors">
          <label className="flex flex-col items-center cursor-pointer">
            <Film className="h-10 w-10 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600 mb-1">
              {uploading ? 'Caricamento...' : 'Carica Video'}
            </span>
            <span className="text-xs text-gray-500">
              MP4, WebM, MOV (max 500MB)
            </span>
            <input
              type="file"
              accept="video/*"
              onChange={handleUploadVideo}
              disabled={uploading || value.length >= maxVideos}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Lista Video */}
      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 font-medium">
            Video ({value.length}/{maxVideos})
          </p>
          {value.map((video, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Film className="h-8 w-8 text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">
                  {video.type === 'youtube' && (
                    <span className="inline-flex items-center gap-1">
                      <Youtube className="h-4 w-4 text-red-600" />
                      YouTube
                    </span>
                  )}
                  {video.type === 'vimeo' && (
                    <span className="inline-flex items-center gap-1">
                      <Film className="h-4 w-4 text-blue-600" />
                      Vimeo
                    </span>
                  )}
                  {video.type === 'upload' && video.fileName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {video.type === 'upload' && video.fileSize
                    ? formatFileSize(video.fileSize)
                    : video.url}
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifica Metadata Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Titolo (IT)
                  </label>
                  <Input
                    value={editData.title || ''}
                    onChange={(e) =>
                      setEditData({ ...editData, title: e.target.value })
                    }
                    placeholder="Titolo video"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Titolo (EN)
                  </label>
                  <Input
                    value={editData.titleEn || ''}
                    onChange={(e) =>
                      setEditData({ ...editData, titleEn: e.target.value })
                    }
                    placeholder="Video title"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Titolo (FR)
                  </label>
                  <Input
                    value={editData.titleFr || ''}
                    onChange={(e) =>
                      setEditData({ ...editData, titleFr: e.target.value })
                    }
                    placeholder="Titre vidéo"
                    className="mt-1"
                  />
                </div>
              </div>
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
                  placeholder="Descrizione opzionale"
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
                  placeholder="Optional description"
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
                  placeholder="Description facultative"
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
