import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAppStore } from '../../mock/store';
import { PaneDrawer } from '../domain/PaneDrawer';
import { CommandPalette } from '../domain/CommandPalette';
import { DemoGuide } from '../domain/DemoGuide';

export const WorkspaceShell: React.FC = () => {
  const { isEditModeUnlocked } = useAppStore();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg flex flex-col font-ui text-ink antialiased">
      {/* 3px Amber Edit Rail when unlocked */}
      {isEditModeUnlocked && (
        <div
          className="h-[3px] bg-accent w-full fixed top-0 left-0 right-0 z-50 animate-pulse"
          role="status"
          aria-label="Edit mode active"
        />
      )}

      <div className="flex flex-1">
        {/* Workspace Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

          <main id="main-content" className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto pb-24">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Overlays & Drawers */}
      <PaneDrawer />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
      <DemoGuide />
    </div>
  );
};
