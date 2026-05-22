import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useNotificationStore, Notification } from '../../store/useNotificationStore';
import { notificationTypeColors } from '../../services/notification.service';

type FilterTab = 'all' | 'unread' | 'errors';

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  const color = notificationTypeColors[type];
  switch (type) {
    case 'success':
      return <CheckCircle2 className={color} size={18} />;
    case 'warning':
      return <AlertTriangle className={color} size={18} />;
    case 'error':
      return <XCircle className={color} size={18} />;
    case 'info':
    default:
      return <Info className={color} size={18} />;
  }
};

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'errors', label: 'Errors' },
];

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<FilterTab>('all');
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case 'unread':
        return notifications.filter((n) => !n.read);
      case 'errors':
        return notifications.filter((n) => n.type === 'error');
      default:
        return notifications;
    }
  }, [notifications, filter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative grid h-10 w-10 place-items-center rounded-xl bg-white/[0.04] text-zinc-400 transition-all hover:bg-white/[0.08] hover:text-white"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#7a1026] text-[10px] font-bold text-white shadow-lg ring-2 ring-[#100c0c]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 origin-top-right overflow-hidden rounded-2xl border border-[#d6b66b]/20 bg-[#070606]/95 shadow-[0_20px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-[#d6b66b]/20 p-4 bg-white/[0.02]">
            <h3 className="font-black text-white">Notifications</h3>
            <div className="flex gap-2">
              <button 
                onClick={markAllAsRead}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                title="Mark all as read"
              >
                <Check size={16} />
              </button>
              <button 
                onClick={clearAll}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                title="Clear all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="flex gap-1 border-b border-[#d6b66b]/10 px-3 py-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-black transition-colors ${
                  filter === tab.id
                    ? 'bg-[#d6b66b]/15 text-[#d6b66b]'
                    : 'text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-h-[400px] overflow-y-auto py-2">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="mb-3 rounded-full bg-white/[0.02] p-4 text-zinc-600">
                  <Bell size={32} />
                </div>
                <p className="font-bold text-zinc-500">
                  {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
                </p>
                <p className="text-xs text-zinc-600">We'll notify you when something happens</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`relative flex gap-3 px-4 py-3 transition-colors cursor-pointer ${
                    notification.read ? 'opacity-60' : 'bg-white/[0.02]'
                  } hover:bg-white/[0.06]`}
                >
                  {!notification.read && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#d6b66b] rounded-full" />
                  )}
                  <div className={`mt-1 flex-shrink-0 rounded-lg p-2 ${
                    notification.type === 'success' ? 'bg-green-500/10' :
                    notification.type === 'warning' ? 'bg-yellow-500/10' :
                    notification.type === 'error' ? 'bg-red-500/10' : 'bg-blue-500/10'
                  }`}>
                    <NotificationIcon type={notification.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-sm font-bold ${notification.read ? 'text-zinc-400' : 'text-white'}`}>
                        {notification.title}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 whitespace-nowrap">
                        <Clock size={10} />
                        {formatTime(notification.createdAt)}
                      </div>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500 leading-relaxed line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-[#d6b66b]/20 p-3 bg-white/[0.01]">
              <button className="w-full text-center text-xs font-black text-[#d6b66b] hover:text-[#e5c98d] transition-colors">
                View All History
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
