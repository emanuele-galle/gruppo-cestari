import { Node, mergeAttributes } from '@tiptap/core';

export interface VideoOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string; type: 'youtube' | 'vimeo' | 'upload' }) => ReturnType;
    };
  }
}

export const Video = Node.create<VideoOptions>({
  name: 'video',
  group: 'block',
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      type: {
        default: 'youtube', // 'youtube' | 'vimeo' | 'upload'
      },
      width: {
        default: '100%',
      },
      height: {
        default: 'auto',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'iframe[data-video-type="youtube"]',
      },
      {
        tag: 'iframe[data-video-type="vimeo"]',
      },
      {
        tag: 'video[data-video-type="upload"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, type } = HTMLAttributes;

    if (type === 'youtube') {
      // Converti URL YouTube in embed
      const videoId = extractYouTubeId(src);
      return [
        'div',
        { class: 'video-wrapper relative pb-[56.25%] h-0 overflow-hidden' },
        [
          'iframe',
          mergeAttributes(this.options.HTMLAttributes, {
            src: `https://www.youtube.com/embed/${videoId}`,
            'data-video-type': 'youtube',
            frameborder: '0',
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            allowfullscreen: 'true',
            class: 'absolute top-0 left-0 w-full h-full',
          }),
        ],
      ];
    }

    if (type === 'vimeo') {
      const videoId = extractVimeoId(src);
      return [
        'div',
        { class: 'video-wrapper relative pb-[56.25%] h-0 overflow-hidden' },
        [
          'iframe',
          mergeAttributes(this.options.HTMLAttributes, {
            src: `https://player.vimeo.com/video/${videoId}`,
            'data-video-type': 'vimeo',
            frameborder: '0',
            allow: 'autoplay; fullscreen; picture-in-picture',
            allowfullscreen: 'true',
            class: 'absolute top-0 left-0 w-full h-full',
          }),
        ],
      ];
    }

    if (type === 'upload') {
      return [
        'video',
        mergeAttributes(this.options.HTMLAttributes, {
          src,
          'data-video-type': 'upload',
          controls: 'true',
          class: 'w-full rounded-lg',
        }),
      ];
    }

    return ['div', {}];
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

// Helper functions
function extractYouTubeId(url: string): string {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : url;
}

function extractVimeoId(url: string): string {
  const regex = /vimeo\.com\/(?:video\/)?(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : url;
}
