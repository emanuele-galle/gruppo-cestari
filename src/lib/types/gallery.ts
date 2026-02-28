/**
 * Gallery image type for projects, news, and bandi
 * Used with Json[] field in Prisma for flexible image management
 */
export interface GalleryImage {
  /** Image URL from MinIO storage */
  url: string;
  /** Image title (optional caption) */
  title?: string;
  /** Image description (optional longer caption) */
  description?: string;
  /** Display order (0-based) */
  order: number;
}

/**
 * Parse raw JSON gallery data to typed GalleryImage array
 * Handles migration from old String[] format
 */
export function parseGallery(data: unknown): GalleryImage[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item, index) => {
    // Handle old String[] format (just URLs)
    if (typeof item === 'string') {
      return {
        url: item,
        order: index,
      };
    }

    // Handle new Json[] format
    if (typeof item === 'object' && item !== null && 'url' in item) {
      const obj = item as Record<string, unknown>;
      return {
        url: String(obj.url),
        title: obj.title ? String(obj.title) : undefined,
        description: obj.description ? String(obj.description) : undefined,
        order: typeof obj.order === 'number' ? obj.order : index,
      };
    }

    // Fallback for invalid items
    return null;
  }).filter((item): item is GalleryImage => item !== null);
}

/**
 * Sort gallery images by order field
 */
function sortGallery(gallery: GalleryImage[]): GalleryImage[] {
  return [...gallery].sort((a, b) => a.order - b.order);
}

/**
 * Normalize gallery order (ensure consecutive order numbers starting from 0)
 */
export function normalizeGalleryOrder(gallery: GalleryImage[]): GalleryImage[] {
  return gallery.map((item, index) => ({
    ...item,
    order: index,
  }));
}

/**
 * Convert GalleryImage array to LightboxImage array for the Lightbox component
 */
export function galleryToLightboxImages(gallery: GalleryImage[]) {
  return sortGallery(gallery).map((item) => ({
    src: item.url,
    alt: item.title || 'Gallery image',
    title: item.title,
    description: item.description,
  }));
}
