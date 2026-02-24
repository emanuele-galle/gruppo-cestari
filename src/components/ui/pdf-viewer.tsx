'use client';

import { useState } from 'react';
import { FileText, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PdfViewerProps {
  url: string;
  title: string;
}

export function PdfViewer({ url, title }: PdfViewerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:border-primary hover:shadow-md transition-all group w-full text-left"
      >
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-800 truncate group-hover:text-primary transition-colors">
            {title}
          </p>
          <p className="text-sm text-slate-500">Documento PDF</p>
        </div>
        <Eye className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 gap-0 flex flex-col">
          <DialogHeader className="p-4 border-b shrink-0">
            <DialogTitle className="truncate pr-8">{title}</DialogTitle>
          </DialogHeader>
          <div
            className="flex-1 min-h-0"
            onContextMenu={(e) => e.preventDefault()}
          >
            <iframe
              src={`${url}#toolbar=0&navpanes=0&scrollbar=1`}
              className="w-full h-full border-0"
              title={title}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
