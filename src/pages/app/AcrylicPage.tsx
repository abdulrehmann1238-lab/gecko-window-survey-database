import React, { useState } from 'react';
import { useAppStore } from '../../mock/store';
import { AcrylicBatch } from '../../data/types';
import { formatDateTime, formatGbp } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { exportOrderedPanesToXlsx } from '../../lib/export';
import {
  Layers,
  Send,
  CheckCircle2,
  PackageCheck,
  Plus,
  Download,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export const AcrylicPage: React.FC = () => {
  const {
    acrylicBatches,
    orderedPanes,
    createAcrylicBatch,
    updateAcrylicBatchStatus,
  } = useAppStore();
  const { addToast } = useToast();

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    acrylicBatches[0]?.id || ''
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPanesForNewBatch, setSelectedPanesForNewBatch] = useState<Set<string>>(new Set());

  const activeBatch = acrylicBatches.find(b => b.id === selectedBatchId) || acrylicBatches[0];

  // Panes with status Awaiting Acrylic available for new batch
  const awaitingPanes = orderedPanes.filter(p => p.productionStatus === 'Awaiting Acrylic');

  const handleCreateBatch = () => {
    if (selectedPanesForNewBatch.size === 0) return;
    const batchRef = createAcrylicBatch(
      Array.from(selectedPanesForNewBatch),
      'Spectrum Acrylics'
    );
    setIsCreateModalOpen(false);
    setSelectedPanesForNewBatch(new Set());
    addToast({
      type: 'success',
      message: `Acrylic Batch ${batchRef} created with ${selectedPanesForNewBatch.size} panes.`,
    });
  };

  const handleAdvanceStatus = (newStatus: 'Sent' | 'Received') => {
    if (!activeBatch) return;
    updateAcrylicBatchStatus(activeBatch.id, newStatus);
    addToast({
      type: 'success',
      message: `Batch ${activeBatch.batchRef} updated to ${newStatus}.${
        newStatus === 'Received' ? ' Associated panes updated to Acrylic Received → Ready to Cut.' : ''
      }`,
    });
  };

  const handleExportSupplier = () => {
    if (!activeBatch) return;
    const batchPanes = orderedPanes.filter(p => activeBatch.paneIds.includes(p.paneId));
    exportOrderedPanesToXlsx(batchPanes, `supplier-batch-${activeBatch.batchRef}`, 'Supplier Acrylic Batch');
    addToast({
      type: 'success',
      message: `Supplier order file for ${activeBatch.batchRef} downloaded.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-serif-display font-medium text-ink">
            Acrylic Batches
          </h1>
          <p className="text-[13px] text-ink-2 mt-0.5">
            Stage 3: Group bespoke acrylic cutting requirements for supplier ordering (Spectrum Acrylics)
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New acrylic batch</span>
        </Button>
      </div>

      {/* 2-Column Layout: Left (Batch List) / Right (Batch Detail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 4 Columns: Batches List */}
        <div className="lg:col-span-4 border border-line rounded-r3 bg-surface overflow-hidden shadow-sh-1 divide-y divide-line">
          <div className="p-3 bg-surface text-ink-3 uppercase text-[11px] font-semibold tracking-wider">
            Supplier Batches ({acrylicBatches.length})
          </div>

          {acrylicBatches.map(b => {
            const isSelected = b.id === activeBatch?.id;
            return (
              <div
                key={b.id}
                onClick={() => setSelectedBatchId(b.id)}
                className={`p-4 cursor-pointer transition-colors ${
                  isSelected ? 'bg-primary-tint/50 border-l-4 border-l-primary' : 'hover:bg-elevated bg-surface'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-semibold text-[15px] text-ink">
                    {b.batchRef}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      b.status === 'Draft'
                        ? 'bg-gray-100 text-gray-800'
                        : b.status === 'Sent'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[12px] text-ink-2">
                  <span>{b.paneCount} panes · {b.sheetCount} sheets</span>
                  <span className="font-mono text-ink-3">{b.totalAreaM2} m²</span>
                </div>
                <div className="text-[11px] text-ink-3 mt-1 font-mono">
                  {formatDateTime(b.createdAt)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 8 Columns: Batch Detail & Stepper */}
        {activeBatch && (
          <div className="lg:col-span-8 border border-line rounded-r3 bg-surface p-6 shadow-sh-1 space-y-6">
            {/* Batch Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-[22px] font-serif-display font-medium text-ink">
                    Batch {activeBatch.batchRef}
                  </h2>
                  <span className="font-mono text-[12px] px-2 py-0.5 rounded bg-surface border border-line-strong text-ink-2">
                    {activeBatch.colour} · {activeBatch.thickness}
                  </span>
                </div>
                <p className="text-[13px] text-ink-3 mt-0.5">
                  Supplier: <strong className="text-ink">{activeBatch.supplier}</strong> · Created {formatDateTime(activeBatch.createdAt)}
                </p>
              </div>

              {/* Supplier File Export */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportSupplier}
                className="gap-2 self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export supplier file</span>
              </Button>
            </div>

            {/* Stepper (Draft -> Sent -> Received) */}
            <div className="p-4 bg-elevated border border-line rounded-r2 flex items-center justify-between">
              <div className="flex items-center gap-6 text-[13px] font-ui">
                <div className={`flex items-center gap-2 ${activeBatch.status !== 'Draft' ? 'text-success font-medium' : 'text-primary font-semibold'}`}>
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[11px] font-mono">1</span>
                  <span>Draft Batch</span>
                </div>

                <div className={`flex items-center gap-2 ${activeBatch.status === 'Sent' ? 'text-primary font-semibold' : activeBatch.status === 'Received' ? 'text-success font-medium' : 'text-ink-3'}`}>
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[11px] font-mono">2</span>
                  <span>Sent to Supplier</span>
                </div>

                <div className={`flex items-center gap-2 ${activeBatch.status === 'Received' ? 'text-success font-semibold' : 'text-ink-3'}`}>
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[11px] font-mono">3</span>
                  <span>Received in Workshop</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeBatch.status === 'Draft' && (
                  <Button variant="secondary" size="sm" onClick={() => handleAdvanceStatus('Sent')}>
                    Mark as sent
                  </Button>
                )}
                {activeBatch.status === 'Sent' && (
                  <Button variant="primary" size="sm" onClick={() => handleAdvanceStatus('Received')}>
                    Mark as received
                  </Button>
                )}
                {activeBatch.status === 'Received' && (
                  <span className="text-[12px] text-success font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>Panes in workshop</span>
                  </span>
                )}
              </div>
            </div>

            {/* Panes in this batch */}
            <div className="space-y-2">
              <span className="text-[12px] uppercase font-semibold text-ink-3 block">
                Panes Included in Batch ({activeBatch.paneCount} panes · {activeBatch.sheetCount} sheets)
              </span>

              <div className="border border-line rounded-r2 overflow-hidden bg-elevated">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-surface text-ink-3 uppercase text-[10px] font-semibold border-b border-line">
                    <tr>
                      <th className="p-2.5">Pane ID</th>
                      <th className="p-2.5">Customer</th>
                      <th className="p-2.5">Dimensions</th>
                      <th className="p-2.5">Specification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {orderedPanes
                      .filter(p => activeBatch.paneIds.includes(p.paneId))
                      .map(p => (
                        <tr key={p.id}>
                          <td className="p-2.5 font-mono font-semibold text-primary">{p.paneDisplayId}</td>
                          <td className="p-2.5 text-ink-2">{p.customerName}</td>
                          <td className="p-2.5 font-mono text-ink-3">{p.width} × {p.height} mm</td>
                          <td className="p-2.5 text-ink-2">{p.colour.split(' ')[0]} · {p.furniture}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE BATCH MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#1E2824]/30 backdrop-blur-[1px]" onClick={() => setIsCreateModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-elevated border border-line-strong rounded-r3 shadow-sh-3 p-6 z-10 text-[13px] space-y-4">
            <h3 className="font-serif-display font-medium text-[18px] text-ink">
              Create New Acrylic Batch
            </h3>
            <p className="text-ink-2 text-[12px]">
              Select ordered panes with status <strong className="text-ink">Awaiting Acrylic</strong> to combine into a supplier sheet order.
            </p>

            <div className="border border-line rounded-r2 overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-surface text-ink-3 uppercase text-[10px] border-b border-line">
                  <tr>
                    <th className="p-2 w-8"></th>
                    <th className="p-2">Pane</th>
                    <th className="p-2">Customer</th>
                    <th className="p-2">Dimensions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {awaitingPanes.map(p => {
                    const isChecked = selectedPanesForNewBatch.has(p.paneId);
                    return (
                      <tr key={p.id} className="hover:bg-surface/50">
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const next = new Set(selectedPanesForNewBatch);
                              if (isChecked) next.delete(p.paneId);
                              else next.add(p.paneId);
                              setSelectedPanesForNewBatch(next);
                            }}
                            className="accent-primary"
                          />
                        </td>
                        <td className="p-2 font-mono font-medium text-ink">{p.paneDisplayId}</td>
                        <td className="p-2 text-ink-2">{p.customerName}</td>
                        <td className="p-2 font-mono text-ink-3">{p.width} × {p.height} mm</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-line">
              <span className="text-[12px] text-ink-3">
                {selectedPanesForNewBatch.size} panes selected
              </span>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={selectedPanesForNewBatch.size === 0}
                  onClick={handleCreateBatch}
                >
                  Create batch
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
