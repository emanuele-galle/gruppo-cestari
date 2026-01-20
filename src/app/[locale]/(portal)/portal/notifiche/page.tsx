'use client';

import { useState } from 'react';
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
  ArrowLeft,
  Filter,
  Trash2,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { it } from 'date-fns/locale';

const notificationIcons: Record<string, typeof Bell> = {
  APPLICATION_STATUS: FileText,
  BANDO_UPDATE: AlertCircle,
  SYSTEM: Info,
  default: Bell,
};

const notificationTypeLabels: Record<string, string> = {
  APPLICATION_STATUS: 'Candidature',
  BANDO_UPDATE: 'Bandi',
  SYSTEM: 'Sistema',
};

export default function NotifichePage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const utils = trpc.useUtils();

  // Fetch notifications
  const { data, isLoading, refetch } = trpc.portal.getNotifications.useQuery({
    limit: 100,
    unreadOnly: filter === 'unread',
  });

  // Mark single notification as read
  const markReadMutation = trpc.portal.markNotificationRead.useMutation({
    onSuccess: () => {
      refetch();
      utils.portal.getNotifications.invalidate();
    },
  });

  // Mark all as read
  const markAllReadMutation = trpc.portal.markAllNotificationsRead.useMutation({
    onSuccess: () => {
      refetch();
      utils.portal.getNotifications.invalidate();
    },
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = format(new Date(notification.createdAt), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, typeof notifications>);

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Oggi';
    }
    if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Ieri';
    }
    return format(date, 'd MMMM yyyy', { locale: it });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/portal"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Notifiche</h1>
            <p className="text-sm text-slate-500">
              {unreadCount > 0
                ? `${unreadCount} notifiche non lette`
                : 'Tutte le notifiche sono state lette'}
            </p>
          </div>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            {markAllReadMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCheck className="w-4 h-4" />
            )}
            Segna tutte come lette
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Tutte
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === 'unread'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Non lette
            {unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-primary text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="w-14 h-14 text-slate-200 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-600 mb-1">
              {filter === 'unread'
                ? 'Nessuna notifica non letta'
                : 'Nessuna notifica'}
            </p>
            <p className="text-sm text-slate-500">
              {filter === 'unread'
                ? 'Hai letto tutte le notifiche!'
                : 'Le notifiche appariranno qui quando ci saranno aggiornamenti.'}
            </p>
          </div>
        ) : (
          <div>
            {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {formatDateHeader(date)}
                  </p>
                </div>

                {/* Notifications for this date */}
                <div className="divide-y divide-slate-100">
                  {dateNotifications.map((notification) => {
                    const Icon = notificationIcons[notification.type] || notificationIcons.default;
                    const isUnread = !notification.isRead;

                    const content = (
                      <div
                        className={`flex gap-4 p-4 transition-colors ${
                          isUnread ? 'bg-primary/5' : 'hover:bg-slate-50'
                        } ${notification.link ? 'cursor-pointer' : ''}`}
                        onClick={() => {
                          if (!isUnread) return;
                          markReadMutation.mutate({ id: notification.id });
                        }}
                      >
                        {/* Icon */}
                        <div
                          className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            isUnread ? 'bg-primary/10' : 'bg-slate-100'
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${isUnread ? 'text-primary' : 'text-slate-500'}`}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                  {notificationTypeLabels[notification.type] || notification.type}
                                </span>
                                {isUnread && (
                                  <span className="w-2 h-2 bg-primary rounded-full" />
                                )}
                              </div>
                              <p
                                className={`text-sm ${
                                  isUnread ? 'font-semibold text-slate-800' : 'text-slate-700'
                                }`}
                              >
                                {notification.title}
                              </p>
                              {notification.message && (
                                <p className="text-sm text-slate-500 mt-1">
                                  {notification.message}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-slate-400">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                  locale: it,
                                })}
                              </span>
                              {isUnread && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    markReadMutation.mutate({ id: notification.id });
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                  title="Segna come letta"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );

                    return notification.link ? (
                      <Link key={notification.id} href={notification.link} className="block">
                        {content}
                      </Link>
                    ) : (
                      <div key={notification.id}>{content}</div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
