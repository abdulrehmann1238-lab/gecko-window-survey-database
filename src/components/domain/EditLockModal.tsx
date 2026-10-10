import React, { useState } from 'react';
import { useAppStore } from '../../mock/store';
import { Lock, Unlock, KeyRound, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface EditLockPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditLockPopover: React.FC<EditLockPopoverProps> = ({ isOpen, onClose }) => {
  const { unlockEditMode, isEditModeUnlocked, lockEditMode } = useAppStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockEditMode(password);
    if (success) {
      setPassword('');
      setError(false);
      onClose();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#1E2824]/20 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-elevated border border-line-strong rounded-r3 shadow-sh-3 p-5 z-10 text-[13px]">
        {isEditModeUnlocked ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-accent font-semibold text-[14px]">
              <Unlock className="w-4 h-4 text-accent" />
              <span>Editing Unlocked</span>
            </div>
            <p className="text-ink-2">
              Edit mode is currently active. You can create corrected measurements, perform room bulk edits, and modify pricing overrides.
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  lockEditMode();
                  onClose();
                }}
              >
                Lock immediately
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-2 text-ink font-semibold text-[14px]">
              <Lock className="w-4 h-4 text-ink-3" />
              <span>Unlock Operational Edits</span>
            </div>
            <p className="text-ink-2 text-[12px] leading-relaxed">
              Operational changes are audited and password protected.
            </p>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-2">
                Enter Password
              </label>
              <div className={`relative ${shake ? 'animate-bounce' : ''}`}>
                <input
                  type="password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  autoFocus
                  placeholder="Password"
                  className={`w-full bg-surface border px-3 py-1.5 rounded-r2 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-accent ${
                    error ? 'border-error ring-1 ring-error' : 'border-line-strong'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="text-ink-3">
                  Demo hint: <code className="font-mono text-accent font-semibold">gecko</code>
                </span>
                {error && <span className="text-error font-medium">Incorrect password</span>}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="ghost" size="sm" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Unlock editing
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
