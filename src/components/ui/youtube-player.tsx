'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
} from 'lucide-react';

// Dichiarazione tipi YouTube IFrame API
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        config: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setPlaybackRate: (rate: number) => void;
  getPlaybackRate: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  showControls?: boolean;
  className?: string;
  thumbnailQuality?: 'maxresdefault' | 'hqdefault' | 'mqdefault';
  onReady?: () => void;
  onEnd?: () => void;
}

// Carica API YouTube una sola volta
let apiLoaded = false;
let apiLoading = false;
const apiCallbacks: (() => void)[] = [];

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (apiLoaded) {
      resolve();
      return;
    }

    apiCallbacks.push(resolve);

    if (apiLoading) return;
    apiLoading = true;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      apiLoaded = true;
      apiCallbacks.forEach((cb) => cb());
      apiCallbacks.length = 0;
    };
  });
}

// Formatta tempo in MM:SS
function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function YouTubePlayer({
  videoId,
  title,
  autoPlay = false,
  muted = false,
  loop = false,
  showControls = true,
  className = '',
  thumbnailQuality = 'hqdefault',
  onReady,
  onEnd,
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const playerElementRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isStarted, setIsStarted] = useState(autoPlay);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMutedState, setIsMutedState] = useState(muted);
  const [volume, setVolume] = useState(muted ? 0 : 100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControlsOverlay, setShowControlsOverlay] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  // Thumbnail URL con fallback
  const thumbnailUrl = thumbnailError
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : `https://img.youtube.com/vi/${videoId}/${thumbnailQuality}.jpg`;

  // Inizializza player YouTube
  const initPlayer = useCallback(async () => {
    if (!playerElementRef.current || playerRef.current) return;

    await loadYouTubeAPI();

    const playerId = `yt-player-${videoId}-${Date.now()}`;
    playerElementRef.current.id = playerId;

    playerRef.current = new window.YT.Player(playerId, {
      videoId,
      playerVars: {
        autoplay: 1,
        mute: muted ? 1 : 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        playsinline: 1,
        loop: loop ? 1 : 0,
        playlist: loop ? videoId : '',
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          setDuration(event.target.getDuration());
          setIsMutedState(event.target.isMuted());
          setVolume(event.target.getVolume());
          setIsLoading(false);
          onReady?.();
        },
        onStateChange: (event) => {
          const state = event.data;
          if (state === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            startProgressTracking();
          } else if (state === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
            stopProgressTracking();
          } else if (state === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            stopProgressTracking();
            onEnd?.();
            if (loop && playerRef.current) {
              playerRef.current.seekTo(0, true);
              playerRef.current.playVideo();
            }
          }
        },
        onError: (event) => {
          console.error('YouTube Player Error:', event.data);
        },
      },
    });
  }, [videoId, muted, loop, onReady, onEnd]);

  // Progress tracking
  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) return;
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current) {
        setCurrentTime(playerRef.current.getCurrentTime());
        setDuration(playerRef.current.getDuration());
      }
    }, 250);
  }, []);

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Auto-hide controls
  const resetHideControlsTimer = useCallback(() => {
    setShowControlsOverlay(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    if (isPlaying && showControls) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControlsOverlay(false);
        setShowSpeedMenu(false);
      }, 3000);
    }
  }, [isPlaying, showControls]);

  // Gestione fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      stopProgressTracking();
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [stopProgressTracking]);

  // Controlli
  const handleStart = useCallback(() => {
    setIsStarted(true);
    initPlayer();
  }, [initPlayer]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    resetHideControlsTimer();
  }, [isPlaying, resetHideControlsTimer]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    if (isMutedState) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume || 100);
      setIsMutedState(false);
    } else {
      playerRef.current.mute();
      setIsMutedState(true);
    }
    resetHideControlsTimer();
  }, [isMutedState, volume, resetHideControlsTimer]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
      if (newVolume === 0) {
        playerRef.current.mute();
        setIsMutedState(true);
      } else if (isMutedState) {
        playerRef.current.unMute();
        setIsMutedState(false);
      }
    }
    resetHideControlsTimer();
  }, [isMutedState, resetHideControlsTimer]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const seekTime = pos * duration;
    playerRef.current.seekTo(seekTime, true);
    setCurrentTime(seekTime);
    resetHideControlsTimer();
  }, [duration, resetHideControlsTimer]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
      }
    } catch {
      console.warn('Fullscreen non supportato');
    }
    resetHideControlsTimer();
  }, [resetHideControlsTimer]);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (!playerRef.current) return;
    playerRef.current.setPlaybackRate(rate);
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
    resetHideControlsTimer();
  }, [resetHideControlsTimer]);

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const [isLoading, setIsLoading] = useState(true);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-black ${className}`}
      onMouseMove={resetHideControlsTimer}
      onMouseEnter={resetHideControlsTimer}
      onTouchStart={resetHideControlsTimer}
      style={isFullscreen ? { width: '100vw', height: '100vh' } : undefined}
    >
      <div className="relative aspect-video">
        {!isStarted ? (
          /* Thumbnail iniziale */
          <div
            className="absolute inset-0 cursor-pointer group"
            onClick={handleStart}
          >
            <img
              src={thumbnailUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setThumbnailError(true)}
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <span className="absolute inset-0 w-20 h-20 -m-2 rounded-full bg-white/20 animate-ping" />
                <span className="absolute inset-0 w-16 h-16 rounded-full bg-white/10 animate-pulse" />
                <span className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-blue-600 shadow-2xl shadow-primary/50 group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 md:w-8 md:h-8 text-white ml-1" fill="white" />
                </span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Player YouTube via IFrame API (controls: 0) */}
            <div
              ref={playerElementRef}
              className="absolute inset-0 w-full h-full [&_iframe]:!absolute [&_iframe]:!inset-0 [&_iframe]:!w-full [&_iframe]:!h-full"
            />

            {/* Click overlay - blocca interazione diretta con iframe YouTube */}
            <div
              className="absolute inset-0 z-10"
              onClick={togglePlay}
            />

            {/* Spinner di caricamento */}
            {isLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
              </div>
            )}

            {/* Big Play Button centrale quando in pausa */}
            {!isPlaying && !isLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/50 backdrop-blur-sm">
                  <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="white" />
                </div>
              </div>
            )}

            {/* Controlli custom */}
            {showControls && (
              <div
                className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-3 pt-12 transition-opacity duration-300 ${
                  showControlsOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {/* Progress Bar */}
                <div
                  className="relative w-full h-1 bg-white/30 rounded-full cursor-pointer mb-3 group/progress"
                  onClick={handleSeek}
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity"
                    style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%`, transform: 'translate(-50%, -50%)' }}
                  />
                </div>

                {/* Bottoni controlli */}
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    {/* Play/Pause */}
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                      className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                      aria-label={isPlaying ? 'Pausa' : 'Riproduci'}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" fill="white" />}
                    </button>

                    {/* Volume */}
                    <div className="flex items-center gap-1 group/vol">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                        className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                        aria-label={isMutedState ? 'Attiva audio' : 'Muta'}
                      >
                        {isMutedState ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={isMutedState ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-0 opacity-0 group-hover/vol:w-20 group-hover/vol:opacity-100 transition-all duration-200 accent-white h-1"
                      />
                    </div>

                    {/* Tempo */}
                    <span className="text-xs font-medium tabular-nums ml-1">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Velocità */}
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}
                        className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                        aria-label="Velocità di riproduzione"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                      {showSpeedMenu && (
                        <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg p-1.5 min-w-[100px]">
                          <div className="text-xs text-white/60 mb-1 px-2">Velocità</div>
                          {speedOptions.map((rate) => (
                            <button
                              key={rate}
                              onClick={(e) => { e.stopPropagation(); handlePlaybackRateChange(rate); }}
                              className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors ${
                                playbackRate === rate ? 'text-primary font-semibold bg-white/10' : 'text-white hover:bg-white/20'
                              }`}
                            >
                              {rate}x {rate === 1 && '(Normale)'}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Fullscreen */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                      className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                      aria-label={isFullscreen ? 'Esci da schermo intero' : 'Schermo intero'}
                    >
                      {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
