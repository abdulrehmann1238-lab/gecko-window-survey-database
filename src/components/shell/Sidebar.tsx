import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../mock/store';
import {
  Home,
  UploadCloud,
  Users,
  Search,
  BookOpenCheck,
  Layers,
  ShieldCheck,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { EditLockPopover } from '../domain/EditLockModal';

export const Sidebar: React.FC = () => {
  const { isEditModeUnlocked, lockEditMode } = useAppStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const navItems = [
    { label: 'Home', to: '/app', icon: Home, end: true },
    { label: 'Survey Intake', to: '/app/intake', icon: UploadCloud },
    { label: 'Customers', to: '/app/customers', icon: Users },
    { label: 'Global Search', to: '/app/search', icon: Search },
    { label: 'Order Book', to: '/app/orders', icon: BookOpenCheck },
    { label: 'Acrylic Batches', to: '/app/acrylic', icon: Layers },
    { label: 'Audit Log', to: '/app/audit', icon: ShieldCheck },
  ];

  return (
    <>
      <aside className="w-[232px] bg-surface border-r border-line flex flex-col justify-between shrink-0 select-none h-screen sticky top-0 z-20">
        {/* Brand Header */}
        <div>
          <div className="h-14 px-5 border-b border-line flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-2 group">
              <span className="font-serif-display font-medium text-[19px] text-primary tracking-tight group-hover:text-primary-hover">
                Gecko Glazing
              </span>
            </NavLink>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-primary-tint text-primary font-semibold">
              Demo
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 h-10 rounded-r2 text-[14px] font-medium font-ui transition-all duration-120 ${
                      isActive
                        ? 'bg-primary-tint text-primary font-semibold border-l-2 border-primary shadow-sh-1'
                        : 'text-ink-2 hover:bg-[#F2EFE8] hover:text-ink'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Area: User Card & Edit Mode Lock Toggle */}
        <div className="p-3 border-t border-line space-y-2 bg-surface">
          {/* Edit Mode Lock / Unlock Toggle Button */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-r2 text-[12px] font-medium transition-all duration-120 border ${
              isEditModeUnlocked
                ? 'bg-accent-tint/60 text-accent border-accent/40 hover:bg-accent-tint'
                : 'bg-surface text-ink-3 border-line-strong hover:text-ink-2 hover:border-ink-3'
            }`}
          >
            <div className="flex items-center gap-2">
              {isEditModeUnlocked ? (
                <Unlock className="w-4 h-4 text-accent" />
              ) : (
                <Lock className="w-4 h-4 text-ink-3" />
              )}
              <span>{isEditModeUnlocked ? 'Editing unlocked' : 'Editing locked'}</span>
            </div>
            <span className="text-[11px] font-mono text-ink-3">gecko</span>
          </button>

          {/* User Profile Card */}
          <div className="px-3 py-2 rounded-r2 bg-elevated border border-line flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary-tint text-primary flex items-center justify-center font-semibold text-[12px]">
                PR
              </div>
              <div>
                <span className="block font-semibold text-ink text-[12px]">Priya Raman</span>
                <span className="block text-[11px] text-ink-3">Estimator</span>
              </div>
            </div>
          </div>

          {/* Proposal Landing Link */}
          <NavLink
            to="/"
            className="flex items-center justify-center gap-1.5 py-1 text-[11px] text-ink-3 hover:text-primary transition-colors text-center w-full"
          >
            <span>Proposal &amp; Story</span>
            <ExternalLink className="w-3 h-3" />
          </NavLink>
        </div>
      </aside>

      <EditLockPopover isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </>
  );
};
