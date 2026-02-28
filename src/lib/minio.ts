import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// MinIO client configuration
const minioClient = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT || 'http://127.0.0.1:9000',
  region: 'us-east-1', // MinIO doesn't use regions but requires one
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || '',
    secretAccessKey: process.env.MINIO_SECRET_KEY || '',
  },
  forcePathStyle: true, // Required for MinIO
});

const MINIO_BUCKET = process.env.MINIO_BUCKET || 'gruppo-cestari';
const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || 'https://s3.fodivps1.cloud';

// Generate a unique filename
export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  return `${timestamp}-${randomString}.${extension}`;
}

// Get public URL for a file
function getPublicUrl(key: string): string {
  return `${MINIO_PUBLIC_URL}/${MINIO_BUCKET}/${key}`;
}

// Folders that should have private ACL (sensitive documents)
const PRIVATE_FOLDERS = ['documents', 'applications', 'contracts', 'user-files'];

// Check if a key should be private based on folder
function shouldBePrivate(key: string): boolean {
  return PRIVATE_FOLDERS.some(folder => key.startsWith(`${folder}/`));
}

// Upload file to MinIO
// Uses private ACL for sensitive folders, public-read for images/media
export async function uploadToMinio(
  file: Buffer,
  key: string,
  contentType: string,
  forcePrivate?: boolean
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const isPrivate = forcePrivate || shouldBePrivate(key);

    const command = new PutObjectCommand({
      Bucket: MINIO_BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: isPrivate ? 'private' : 'public-read',
    });

    await minioClient.send(command);

    return {
      success: true,
      url: isPrivate ? key : getPublicUrl(key), // Return key for private files (use presigned URL to access)
    };
  } catch (error) {
    console.error('MinIO upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

// Delete file from MinIO
export async function deleteFromMinio(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: MINIO_BUCKET,
      Key: key,
    });

    await minioClient.send(command);
    return true;
  } catch (error) {
    console.error('MinIO delete error:', error);
    return false;
  }
}

// Generate presigned URL for direct upload (optional, for large files)
async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: MINIO_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(minioClient, command, { expiresIn });
}

// Generate presigned URL for secure download of private files
async function getPresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: MINIO_BUCKET,
    Key: key,
  });

  return getSignedUrl(minioClient, command, { expiresIn });
}

// Check if a file key should use presigned URL for access
function isPrivateFile(key: string): boolean {
  return shouldBePrivate(key);
}
