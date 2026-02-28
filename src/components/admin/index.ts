// Admin Dashboard Components
// Professional UI components for the admin dashboard

export { StatsCard } from './stats-card';
export { PageHeader } from './page-header';
export { Card, CardHeader, CardContent } from './card';
export { StatusBadge, PublishedBadge, ActiveBadge, RoleBadge } from './status-badge';
export { RichTextEditor } from './rich-text-editor';
export { ImageUpload } from './image-upload';
export { FileUpload } from './file-upload';
export { GalleryUpload } from './gallery-upload';
export { AttachmentsManager, type AttachmentData } from './attachments-manager';
export { VideoManager, type VideoData } from './video-manager';
export { BulkActionsBar, bulkActionPresets } from './bulk-actions-bar';
export type { } from './bulk-actions-bar';

// Re-export shared components for convenience
export {
  ActionButton,
  MobileCard,
  MobileCardSkeleton,
} from '@/components/shared';
