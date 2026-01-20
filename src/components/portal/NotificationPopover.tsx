'use client';

import { useState, useRef, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc';
import {
  Bell,
  Check,
  CheckCheck,
  FileText,
  AlertCircle,
  Info,
  Loader2,
  X,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

const notificationIcons: Record<string, typeof Bell> = {
  APPLICATION_STATUS: FileText,
  BANDO_UPDATE: AlertCircle,
  SYSTEM: Info,
  default: Bell,
};

export default function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const { data, isLoading, refetch } = trpc.portal.getNotifications.useQuery(
    { limit: 10, unreadOnly: false },
    { enabled: isOpen }
  );

  // Mark single notification as read
  const markReadMutation = trpc.portal.markNotificationRead.useMutation({
    onSuccess: () => refetch(),
  });

  // Mark all as read
  const markAllReadMutation = trpc.portal.markAllNotificationsRead.useMutation({
    onSuccess: () => refetch(),
  });

  // Unread count for badge (always fetch)
  const { data: unreadData } = trpc.portal.getNotifications.useQuery(
    { limit: 1, unreadOnly: true },
    { refetchInterval: 30000 } // Refetch every 30 seconds
  );

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notificationId: string, isRead: boolean, link?: string | null) => {
    if (!isRead) {
      markReadMutation.mutate({ id: notificationId });
    }
    if (link) {
      setIsOpen(false);
    }
  };

  const unreadCount = unreadData?.unreadCount || 0;

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-800 transition-colors"
        aria-label="Notifiche"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-primary rounded-full px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-32px)] bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-800">Notifiche</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                  className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                >
                  {markAllReadMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCheck className="w-3 h-3" />
                  )}
                  Segna tutte lette
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : !data?.notifications || data.notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Nessuna notifica</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type] || notificationIcons.default;
                  const isUnread = !notification.isRead;

                  const content = (
                    <div
                      className={`flex gap-3 p-4 transition-colors ${
                        isUnread ? 'bg-primary/5' : 'hover:bg-slate-50'
                      } ${notification.link ? 'cursor-pointer' : ''}`}
                      onClick={() => handleNotificationClick(notification.id, notification.isRead, notification.link)}
                    >
                      {/* Icon */}
                      <div
                        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                          isUnread ? 'bg-primary/10' : 'bg-slate-100'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isUnread ? 'text-primary' : 'text-slate-500'}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm ${
                              isUnread ? 'font-semibold text-slate-800' : 'text-slate-700'
                            }`}
                          >
                            {notification?.title ?? 'Notifica'}
                          </p>
                          {isUnread && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                markReadMutation.mutate({ id: notification.id });
                              }}
                              className="shrink-0 p-1 text-slate-400 hover:text-primary"
                              title="Segna come letta"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {notification.message && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-[11px] text-slate-400 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: it,
                          })}
                        </p>
                      </div>
                    </div>
                  );

                  return notification.link ? (
                    <Link
                      key={notification.id}
                      href={notification.link}
                      onClick={() => setIsOpen(false)}
                      className="block"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={notification.id}>{content}</div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 p-3 bg-slate-50">
            <Link
              href="/portal/notifiche"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm text-primary hover:text-primary/80 font-medium"
            >
              Vedi tutte le notifiche
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
