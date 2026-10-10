import React, { useState } from 'react';
import { useAppStore } from '../../mock/store';
import { DimensionDiagram } from '../ui/DimensionDiagram';
import { TagChip } from '../ui/TagChip';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatGbp, formatDimensions } from '../../lib/format';
import {
  X,
  Lock,
  GitCommit,
  CheckCircle,
  AlertTriangle,
  History,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const PaneDrawer: React.FC = () => {
  const {
    activeDrawerPaneId,
    closePaneDrawer,
    allPanes,
    isEditModeUnlocked,
    updatePaneVersion,
    toggleSelectPane,
    selectedPaneIds,
  } = useAppStore();

  const [compareMode, setCompareMode] = useState(false);
  const [selectedVersionIdx, setSelectedVersionIdx] = useState(0);

  // Edit fields
  const [isEditing, setIsEditing] = useState(false);
  const [editWidth, setEditWidth] = useState<number>(0);
  const [editHeight, setEditHeight] = useState<number>(0);
  const [editReason, setEditReason] = useState('Re-measured on site inspection');

  if (!activeDrawerPaneId) return null;

  const pane = allPanes.find(p => p.id === activeDrawerPaneId);
  if (!pane) return null;

  const isSelected = selectedPaneIds.has(pane.id);
  const isOrdered = pane.orderedOrderNumbers.length > 0;
  const currentVersionObj = pane.versions[selectedVersionIdx] || pane.versions[0];
  const supersededVersionObj = pane.versions[1];

  const handleStartEditing = () => {
    setEditWidth(pane.width);
    setEditHeight(pane.height);
    setIsEditing(true);
  };

  const handleSaveVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (editWidth < 100 || editWidth > 4000 || editHeight < 100 || editHeight > 4000) {
      alert('Width and Height must be between 100 and 4,000 mm.');
      return;
    }
    if (!editReason.trim()) {
      alert('A reason is required to record a versioned measurement.');
      return;
    }
    updatePaneVersion(pane.id, editWidth, editHeight, editReason);
    setIsEditing(false);
  };

  return (
    <div
      className="fixed inset-0 z-40 overflow-hidden flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-pane-title"
    >
      {/* Scrim */}
      <div
        className="fixed inset-0 bg-[#1E2824]/20 backdrop-blur-[1px] transition-opacity duration-280"
        onClick={closePaneDrawer}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-[540px] bg-elevated shadow-sh-3 h-full overflow-y-auto border-l border-line flex flex-col z-50">
        {/* Drawer Header */}
        <div className="p-5 border-b border-line bg-surface sticky top-0 z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span id="drawer-pane-title" className="font-mono-data text-[18px] font-semibold text-ink">
                {pane.displayId}
              </span>
              <span className="text-[12px] px-2 py-0.5 rounded-r1 bg-primary-tint text-primary font-mono font-medium">
                {pane.currentVersion}
              </span>
              {isOrdered && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-r1 bg-slate-100 text-slate-800 border border-slate-300 font-medium">
                  <Lock className="w-3 h-3 text-slate-600" />
                  Ordered · Snapshot
                </span>
              )}
            </div>
            <p className="text-[13px] text-ink-2">
              {pane.roomName} · {pane.windowLabel} · Pane {pane.paneIndex}
            </p>
          </div>

          <button
            type="button"
            onClick={closePaneDrawer}
            className="p-1.5 rounded-r2 text-ink-3 hover:text-ink hover:bg-[#F2EFE8] transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Measurement diagram motif */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-2">
                Survey Measurement
              </span>
              <span className="text-[12px] text-ink-3 font-mono">
                {formatDimensions(currentVersionObj.width, currentVersionObj.height)}
              </span>
            </div>
            <DimensionDiagram
              width={currentVersionObj.width}
              height={currentVersionObj.height}
              shape={pane.shape}
              displayId={pane.displayId}
              colour={pane.colour}
            />
          </div>

          {/* Versions Timeline & Compare */}
          <div className="border border-line rounded-r3 p-4 bg-surface">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-primary" />
                <h4 className="text-[13px] font-semibold text-ink font-ui">
                  Measurement Lineage ({pane.versions.length} versions)
                </h4>
              </div>
              {pane.versions.length > 1 && (
                <button
                  type="button"
                  onClick={() => setCompareMode(!compareMode)}
                  className="text-[12px] text-primary font-medium hover:underline"
                >
                  {compareMode ? 'Exit compare' : 'Compare v1 vs v2'}
                </button>
              )}
            </div>

            {/* Version Diff View */}
            {compareMode && supersededVersionObj && (
              <div className="mb-3 p-3 bg-accent-tint/60 border border-accent/30 rounded-r2 text-[12px]">
                <div className="font-semibold text-ink mb-1.5 flex items-center justify-between">
                  <span>Version Comparison</span>
                  <span className="text-accent font-mono font-medium">
                    Δ {supersededVersionObj.deltaMm || 3} mm variance
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-ink-2 font-mono">
                  <div className="p-2 bg-elevated/80 rounded border border-line">
                    <span className="block text-[10px] text-ink-3 uppercase mb-0.5">Current ({pane.currentVersion})</span>
                    {pane.width} × {pane.height} mm
                  </div>
                  <div className="p-2 bg-elevated/80 rounded border border-line">
                    <span className="block text-[10px] text-ink-3 uppercase mb-0.5">Previous ({supersededVersionObj.versionNumber})</span>
                    {supersededVersionObj.width} × {supersededVersionObj.height} mm
                  </div>
                </div>
              </div>
            )}

            {/* Versions List */}
            <div className="space-y-2">
              {pane.versions.map((ver, idx) => (
                <div
                  key={ver.versionNumber}
                  onClick={() => setSelectedVersionIdx(idx)}
                  className={`p-2.5 rounded-r2 border cursor-pointer transition-all duration-120 text-[12px] ${
                    selectedVersionIdx === idx
                      ? 'border-primary bg-elevated shadow-sh-1'
                      : 'border-line hover:border-line-strong bg-surface'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-ink">{ver.versionNumber}</span>
                      {idx === 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-primary-tint text-primary font-medium rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <span className="text-ink-3 font-mono">{ver.surveyedDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-ink-2">
                    <span>Surveyor: {ver.surveyor}</span>
                    <span className="font-mono">{ver.width} × {ver.height} mm</span>
                  </div>
                  {ver.reason && (
                    <p className="mt-1 text-[11px] text-ink-3 italic">{ver.reason}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Specification details */}
          <div className="border border-line rounded-r3 p-4 bg-surface space-y-3">
            <h4 className="text-[13px] font-semibold text-ink font-ui">
              Resolved Specification
            </h4>
            <div className="grid grid-cols-2 gap-y-2 text-[13px]">
              <div>
                <span className="text-ink-3 block text-[11px] uppercase">Product</span>
                <span className="text-ink font-medium">{pane.product}</span>
              </div>
              <div>
                <span className="text-ink-3 block text-[11px] uppercase">Colour</span>
                <span className="text-ink font-medium">{pane.colour}</span>
              </div>
              <div>
                <span className="text-ink-3 block text-[11px] uppercase">Furniture</span>
                <span className="text-ink font-medium">{pane.furniture}</span>
              </div>
              <div>
                <span className="text-ink-3 block text-[11px] uppercase">Current Rule Price</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-ink font-mono font-semibold">{formatGbp(pane.rulePrice)}</span>
                  <span className="text-[10px] text-ink-3 px-1.5 bg-[#F2EFE8] rounded">Rule</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-line">
              <span className="text-ink-3 block text-[11px] uppercase mb-1.5">Applied Specification Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {pane.tags.map(t => (
                  <TagChip key={t} label={t} />
                ))}
              </div>
            </div>
          </div>

          {/* Orders Link & Immutability Guarantee */}
          {isOrdered && (
            <div className="border border-slate-300 rounded-r3 p-4 bg-slate-50 text-[13px]">
              <div className="flex items-center gap-2 text-slate-800 font-semibold mb-1.5">
                <Lock className="w-4 h-4 text-slate-600" />
                <span>Immutable Order Linkage</span>
              </div>
              <p className="text-[12px] text-slate-600 leading-relaxed mb-2">
                This pane is locked in active order(s):{' '}
                <strong className="text-slate-900 font-mono">
                  {pane.orderedOrderNumbers.join(', ')}
                </strong>
                . Ordered records are permanently immutable snapshots. Any future survey corrections will create a new version without altering previous orders.
              </p>
              <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Ordered at snapshot version {pane.versions[pane.versions.length - 1]?.versionNumber || pane.displayId}
              </div>
            </div>
          )}

          {/* Edit Measurements Form (When Edit Mode is active and clicked) */}
          {isEditing && (
            <form onSubmit={handleSaveVersion} className="border border-accent rounded-r3 p-4 bg-accent-tint/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[13px] font-semibold text-ink font-ui flex items-center gap-1.5">
                  <span>Create Corrected Version</span>
                  <span className="text-[11px] text-accent font-mono font-medium">
                    (→ {pane.displayId}-{pane.versions.length + 1})
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-[12px] text-ink-3 hover:text-ink"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Width (mm)"
                  type="number"
                  value={editWidth}
                  onChange={e => setEditWidth(Number(e.target.value))}
                  min={100}
                  max={4000}
                  required
                />
                <Input
                  label="Height (mm)"
                  type="number"
                  value={editHeight}
                  onChange={e => setEditHeight(Number(e.target.value))}
                  min={100}
                  max={4000}
                  required
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-ink-2 mb-1">
                  Correction Reason (Mandatory Audit)
                </label>
                <input
                  type="text"
                  value={editReason}
                  onChange={e => setEditReason(e.target.value)}
                  className="w-full bg-elevated border border-line-strong rounded-r2 px-3 py-1.5 text-[13px] text-ink focus:ring-2 focus:ring-accent"
                  required
                  placeholder="e.g. Second survey pass confirmed 3mm taper in reveal"
                />
              </div>

              <Button type="submit" variant="accent" size="sm" className="w-full mt-2">
                Save as New Version ({pane.displayId}-{pane.versions.length + 1})
              </Button>
            </form>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-line bg-surface sticky bottom-0 z-10 flex items-center justify-between gap-3">
          <Button
            variant={isSelected ? 'outline' : 'secondary'}
            onClick={() => toggleSelectPane(pane.id, pane.customerId)}
            className="flex-1"
          >
            {isSelected ? 'Remove from selection' : 'Add to selection'}
          </Button>

          {isEditModeUnlocked && !isEditing && (
            <Button
              variant="accent"
              onClick={handleStartEditing}
              className="flex-1"
            >
              Edit measurements
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
