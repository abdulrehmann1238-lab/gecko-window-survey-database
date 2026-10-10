import React, { useState } from 'react';
import { useAppStore } from '../../mock/store';
import { Button } from '../ui/Button';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '../ui/Toast';

interface BulkEditModalProps {
  paneIds: string[];
  isOpen: boolean;
  onClose: () => void;
}

export const BulkEditModal: React.FC<BulkEditModalProps> = ({ paneIds, isOpen, onClose }) => {
  const { allPanes, bulkUpdatePanes } = useAppStore();
  const { addToast } = useToast();

  const [field, setField] = useState<'colour' | 'furniture'>('colour');
  const [newValue, setNewValue] = useState('Anthracite (RAL 7016)');
  const [reason, setReason] = useState('Architect revision for uniform elevation');

  if (!isOpen) return null;

  const targetPanes = allPanes.filter(p => paneIds.includes(p.id));
  const orderedPanes = targetPanes.filter(p => p.orderedOrderNumbers.length > 0);
  const editablePanes = targetPanes.filter(p => p.orderedOrderNumbers.length === 0);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please provide an audit reason for bulk modification.');
      return;
    }

    const { affectedCount, skippedOrderedCount } = bulkUpdatePanes(
      paneIds,
      field,
      newValue,
      reason
    );

    addToast({
      type: 'success',
      message: `Bulk updated ${affectedCount} panes to ${newValue}. (${skippedOrderedCount} ordered panes skipped).`,
      actionLabel: 'Undo (10s)',
      onAction: () => {
        addToast({ type: 'info', message: 'Reverted bulk changes via audited version lineage.' });
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#1E2824]/30 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-elevated border border-line-strong rounded-r3 shadow-sh-3 p-6 z-10 text-[13px]">
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div>
            <h3 className="font-serif-display font-medium text-[18px] text-ink">
              Bulk Specification Update
            </h3>
            <p className="text-[12px] text-ink-3">
              Applying changes to {editablePanes.length} survey panes
            </p>
          </div>
          <button onClick={onClose} className="text-ink-3 hover:text-ink text-[18px]">
            ×
          </button>
        </div>

        <form onSubmit={handleApply} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-2 mb-1">
                Target Field
              </label>
              <select
                value={field}
                onChange={e => {
                  const val = e.target.value as any;
                  setField(val);
                  setNewValue(val === 'colour' ? 'Anthracite (RAL 7016)' : 'Lift-out');
                }}
                className="w-full bg-surface border border-line-strong rounded-r2 px-3 py-1.5 text-ink text-[13px]"
              >
                <option value="colour">Frame Colour</option>
                <option value="furniture">Furniture / Hardware</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-2 mb-1">
                New Specification
              </label>
              {field === 'colour' ? (
                <select
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  className="w-full bg-surface border border-line-strong rounded-r2 px-3 py-1.5 text-ink text-[13px]"
                >
                  <option value="White (RAL 9016)">White (RAL 9016)</option>
                  <option value="Anthracite (RAL 7016)">Anthracite (RAL 7016)</option>
                  <option value="Black (RAL 9005)">Black (RAL 9005)</option>
                  <option value="Heritage Cream (RAL 9001)">Heritage Cream (RAL 9001)</option>
                  <option value="Bespoke match">Bespoke match</option>
                </select>
              ) : (
                <select
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  className="w-full bg-surface border border-line-strong rounded-r2 px-3 py-1.5 text-ink text-[13px]"
                >
                  <option value="Lift-out">Lift-out</option>
                  <option value="Fixed">Fixed</option>
                  <option value="Hinged">Hinged</option>
                  <option value="Sliding (Horizontal)">Sliding (Horizontal)</option>
                  <option value="Handle and lock">Handle and lock</option>
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-2 mb-1">
              Audit Reason (Required)
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
              className="w-full bg-surface border border-line-strong rounded-r2 px-3 py-1.5 text-ink text-[13px] focus:ring-2 focus:ring-accent"
              placeholder="e.g. Client requested Anthracite for street frontage"
            />
          </div>

          {/* Ordered Panes Immutability Warning */}
          {orderedPanes.length > 0 && (
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-r2 text-[12px] text-slate-700">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1">
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span>Skipped: Already Ordered ({orderedPanes.length} panes)</span>
              </div>
              <p>
                Rule 2 enforced: Ordered panes are locked in orders{' '}
                <span className="font-mono text-slate-900">
                  {Array.from(new Set(orderedPanes.flatMap(p => p.orderedOrderNumbers))).join(', ')}
                </span>
                . They cannot be modified in bulk.
              </p>
            </div>
          )}

          {/* Preview Table */}
          <div className="border border-line rounded-r2 overflow-hidden max-h-36 overflow-y-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-surface text-ink-3 uppercase text-[10px] border-b border-line">
                <tr>
                  <th className="p-2">Pane</th>
                  <th className="p-2">Room / Window</th>
                  <th className="p-2">Current</th>
                  <th className="p-2 text-primary font-semibold">Will Change To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {editablePanes.slice(0, 5).map(p => (
                  <tr key={p.id}>
                    <td className="p-2 font-mono font-medium text-ink">{p.displayId}</td>
                    <td className="p-2 text-ink-2">{p.roomName} ({p.windowLabel})</td>
                    <td className="p-2 text-ink-3">{(p as any)[field]}</td>
                    <td className="p-2 text-primary font-medium">{newValue}</td>
                  </tr>
                ))}
                {editablePanes.length > 5 && (
                  <tr>
                    <td colSpan={4} className="p-2 text-center text-ink-3 italic">
                      + {editablePanes.length - 5} additional panes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-line">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              type="submit"
              disabled={editablePanes.length === 0}
            >
              Apply to {editablePanes.length} panes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
