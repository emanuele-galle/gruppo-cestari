/**
 * Attachment type for project PDFs and documents
 * Used with Json[] field in Prisma for flexible file management
 */
export interface ProjectAttachment {
  /** File URL from MinIO storage */
  url: string;
  /** File title/name */
  title: string;
  /** File description (optional) */
  description?: string;
  /** Display order (0-based) */
  order: number;
}

/**
 * Parse raw JSON attachments data to typed ProjectAttachment array
 */
export function parseAttachments(data: unknown): ProjectAttachment[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const parsed: ProjectAttachment[] = [];

  data.forEach((item, index) => {
    // Handle Json[] format
    if (typeof item === 'object' && item !== null && 'url' in item && 'title' in item) {
      const obj = item as Record<string, unknown>;
      parsed.push({
        url: String(obj.url),
        title: String(obj.title),
        description: obj.description ? String(obj.description) : undefined,
        order: typeof obj.order === 'number' ? obj.order : index,
      });
    }
  });

  return parsed;
}

/**
 * Sort attachments by order field
 */
export function sortAttachments(attachments: ProjectAttachment[]): ProjectAttachment[] {
  return [...attachments].sort((a, b) => a.order - b.order);
}

/**
 * Normalize attachments order (ensure consecutive order numbers starting from 0)
 */
export function normalizeAttachmentsOrder(attachments: ProjectAttachment[]): ProjectAttachment[] {
  return attachments.map((item, index) => ({
    ...item,
    order: index,
  }));
}

/**
 * Get file extension from URL
 */
export function getFileExtension(url: string): string {
  const match = url.match(/\.([^./?]+)(?:[?#]|$)/);
  return match ? match[1].toLowerCase() : '';
}

/**
 * Get file icon based on extension
 */
export function getFileIcon(url: string): string {
  const ext = getFileExtension(url);
  const iconMap: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    ppt: '📽️',
    pptx: '📽️',
    zip: '🗜️',
    rar: '🗜️',
  };
  return iconMap[ext] || '📎';
}
