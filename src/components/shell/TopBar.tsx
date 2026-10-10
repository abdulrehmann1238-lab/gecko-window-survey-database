import React, { useState } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { useAppStore } from '../../mock/store';
import { Search, Bell, ExternalLink, CheckCircle2 } from 'lucide-react';
import { formatDateTime } from '../../lib/format';

interface TopBarProps {
  onOpenCommandPalette: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenCommandPalette }) => {
  const location = useLocation();
  const { notifications, unreadNotificationCount, markNotificationsRead } = useAppStore();
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Derive breadcrumb path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathParts.map((part, idx) => {
    const url = '/' + pathParts.slice(0, idx + 1).join('/');
    let label = part.charAt(0).toUpperCase() + part.slice(1);
    if (part === 'app') label = 'Workspace';
    if (part.startsWith('cust_')) label = 'Calloway Residence';
    if (part.startsWith('QT-')) label = part;
    return { label, url };
  });

  return (
    <header className="h-14 bg-surface border-b border-line px-6 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] font-ui">
        {breadcrumbItems.map((item, idx) => {
          const isLast = idx === breadcrumbItems.length - 1;
          return (
            <React.Fragment key={item.url}>
              {idx > 0 && <span className="text-ink-3">/</span>}
              {isLast ? (
                <span className="text-ink font-semibold">{item.label}</span>
              ) : (
                <NavLink to={item.url} className="text-ink-3 hover:text-ink transition-colors">
                  {item.label}
                </NavLink>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Global Search Bar (⌘K) */}
      <div className="w-[420px] max-w-md hidden md:block">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full h-9 px-3 bg-elevated border border-line-strong rounded-r2 text-[13px] text-ink-3 flex items-center justify-between hover:border-ink-3 transition-colors shadow-sh-1"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-ink-3" />
            <span>Search panes, customers, quotes...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[11px] font-mono text-ink-3 bg-surface border border-line rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Actions: Notifications Bell & Demo Portal */}
      <div className="flex items-center gap-3">
        {/* Notifications Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              if (unreadNotificationCount > 0) markNotificationsRead();
            }}
            className="p-2 rounded-r2 text-ink-2 hover:text-ink hover:bg-[#F2EFE8] transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-elevated border border-line-strong rounded-r3 shadow-sh-3 z-30 p-2 text-[13px]">
              <div className="p-2 border-b border-line flex items-center justify-between">
                <span className="font-semibold text-ink text-[12px] uppercase tracking-wider">
                  Notifications
                </span>
                <span className="text-[11px] text-ink-3">Live Feed</span>
              </div>

              <div className="divide-y divide-line/60 max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <NavLink
                    key={n.id}
                    to={n.link || '#'}
                    onClick={() => setShowNotifMenu(false)}
                    className="p-2.5 block hover:bg-surface transition-colors rounded-r2 text-left"
                  >
                    <div className="font-medium text-ink flex items-center justify-between">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-ink-3">{formatDateTime(n.timestamp)}</span>
                    </div>
                    <p className="text-[12px] text-ink-2 mt-0.5 leading-snug">{n.description}</p>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Customer Portal Preview Link */}
        <NavLink
          to="/customer-view/QT-2026-0412"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-primary bg-primary-tint rounded-r2 hover:bg-[#D5E3D9] transition-colors"
        >
          <span>Customer View</span>
          <ExternalLink className="w-3 h-3" />
        </NavLink>
      </div>
    </header>
  );
};
