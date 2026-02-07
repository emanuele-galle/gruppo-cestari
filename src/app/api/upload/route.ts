import { NextRequest, NextResponse } from 'next/server';
import { uploadToMinio, generateFileName, deleteFromMinio } from '@/lib/minio';
import { auth } from '@/lib/auth';

// Allowed file types
const ALLOWED_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-rar-compressed',
  // Videos
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-ms-wmv',
  'video/webm',
  'video/ogg',
];

// Max file size (500MB for videos, 100MB for others)
const MAX_FILE_SIZE = 500 * 1024 * 1024;

// POST - Upload file (requires authentication)
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Nessun file fornito' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Tipo di file non supportato' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'File troppo grande (max 100MB)' },
        { status: 400 }
      );
    }

    // Generate unique filename with folder prefix
    const fileName = generateFileName(file.name);
    const key = folder ? `${folder}/${fileName}` : fileName;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to MinIO
    const result = await uploadToMinio(buffer, key, file.type);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Errore durante l\'upload' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        key,
        name: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante l\'upload' },
      { status: 500 }
    );
  }
}

// DELETE - Delete file (requires authentication)
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { success: false, message: 'Chiave file richiesta' },
        { status: 400 }
      );
    }

    const success = await deleteFromMinio(key);

    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Errore durante l\'eliminazione' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File eliminato con successo',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante l\'eliminazione' },
      { status: 500 }
    );
  }
}
