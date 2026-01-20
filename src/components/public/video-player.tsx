'use client';

// Re-export YouTubePlayer as VideoPlayer per compatibilità
// Il componente YouTubePlayer fornisce controlli custom completi
// senza riferimenti visibili a YouTube

export { YouTubePlayer as VideoPlayer } from '@/components/ui/youtube-player';
export type { } from '@/components/ui/youtube-player';
