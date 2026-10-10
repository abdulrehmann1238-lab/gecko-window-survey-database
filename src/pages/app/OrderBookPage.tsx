import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../mock/store';
import { OrderedPane, ProductionStatus } from '../../data/types';
import { formatGbp, formatDimensions, timeAgo } from '../../lib/format';
import { StatusPill } from '../../components/ui/StatusPill';
import { Button } from '../../components/ui/Button';
import { exportOrderedPanesToXlsx } from '../../lib/export';
import {
  Lock,
  Download,
  Scissors,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export const OrderBookPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialStatusParam = searchParams.get('status');

  const {
    orderedPanes,
    isEditModeUnlocked,
    updateOrderedPaneStatus,
    openPaneDrawer,
  } = useAppStore();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | 'Laser Cut' | 'Pane Order'>('all');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusParam || 'all');
  const [selectedPaneIds, setSelectedPaneIds] = useState<Set<string>>(new Set());

  // Export Sheet State
  const [exportSheetOpen, setExportSheetOpen] = useState(false);
  const [exportTargetMethod, setExportTargetMethod] = useState<'Laser Cut' | 'Pane Order'>('Laser Cut');

  // Count ready to cut by method
  const laserReadyPanes = useMemo(
    () => orderedPanes.filter(p => p.productionStatus === 'Ready to Cut' && p.cuttingMethod === 'Laser Cut'),
    [orderedPanes]
  );
  const paneOrderReadyPanes = useMemo(
    () => orderedPanes.filter(p => p.productionStatus === 'Ready to Cut' && p.cuttingMethod === 'Pane Order'),
    [orderedPanes]
  );

  // Filtered rows
  const filteredPanes = useMemo(() => {
    return orderedPanes.filter(p => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          p.paneDisplayId.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.orderNumber.toLowerCase().includes(q) ||
          p.roomName.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (methodFilter !== 'all' && p.cuttingMethod !== methodFilter) return false;
      if (statusFilter !== 'all' && p.productionStatus !== statusFilter) return false;
      return true;
    });
  }, [orderedPanes, searchQuery, methodFilter, statusFilter]);

  const handleOpenExport = (method: 'Laser Cut' | 'Pane Order') => {
    setExportTargetMethod(method);
    setExportSheetOpen(true);
  };

  const handleExecuteDownload = () => {
    const panesToExport = exportTargetMethod === 'Laser Cut' ? laserReadyPanes : paneOrderReadyPanes;
    const fileName = exportTargetMethod === 'Laser Cut' ? 'laser-cut-2026-10-10' : 'pane-order-2026-10-10';

    exportOrderedPanesToXlsx(panesToExport, fileName, exportTargetMethod);
    setExportSheetOpen(false);

    addToast({
      type: 'success',
      message: `${panesToExport.length} panes exported to ${fileName}.xlsx. Panes remain Ready to Cut until marked In Production.`,
    });
  };

  const handleStatusChange = (paneId: string, newStatus: ProductionStatus) => {
    updateOrderedPaneStatus([paneId], newStatus);
    addToast({
      type: 'success',
      message: `Production status updated to ${newStatus}. Audited in shopfloor log.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-serif-display font-medium text-ink">
            Order Book
          </h1>
          <p className="text-[13px] text-ink-2 mt-0.5">
            {orderedPanes.length.toLocaleString()} ordered panes · {laserReadyPanes.length + paneOrderReadyPanes.length} ready to cut
          </p>
        </div>

        {/* Two Export Actions with Badge Counters */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => handleOpenExport('Laser Cut')}
            className="gap-2"
          >
            <Scissors className="w-4 h-4 text-primary" />
            <span>Laser Cut Panes</span>
            <span className="font-mono text-[11px] bg-primary text-elevated px-1.5 py-0.2 rounded-full">
              {laserReadyPanes.length}
            </span>
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => handleOpenExport('Pane Order')}
            className="gap-2"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>Export for Pane Order</span>
            <span className="font-mono text-[11px] bg-primary text-elevated px-1.5 py-0.2 rounded-full">
              {paneOrderReadyPanes.length}
            </span>
          </Button>
        </div>
      </div>

      {/* Toolbar & Filter Bar */}
      <div className="p-3 bg-surface border border-line rounded-r3 flex flex-wrap items-center justify-between gap-3 text-[13px]">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-ink-3 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search pane, customer, order number (e.g. WC-10482)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-elevated border border-line-strong rounded-r2 pl-9 pr-3 py-1.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Cutting Method Filter */}
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value as any)}
            className="bg-elevated border border-line-strong rounded-r2 px-2.5 py-1.5 text-[13px] text-ink focus:outline-none"
          >
            <option value="all">All Cutting Methods</option>
            <option value="Laser Cut">Laser Cut Only</option>
            <option value="Pane Order">Pane Order Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-elevated border border-line-strong rounded-r2 px-2.5 py-1.5 text-[13px] text-ink focus:outline-none"
          >
            <option value="all">All Production Statuses</option>
            <option value="Ready to Cut">Ready to Cut</option>
            <option value="Awaiting Acrylic">Awaiting Acrylic</option>
            <option value="Acrylic Received">Acrylic Received</option>
            <option value="In Production">In Production</option>
            <option value="Complete">Complete</option>
          </select>
        </div>

        {/* OMS Sync Indicator */}
        <div className="flex items-center gap-2 text-[12px] text-ink-3">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span>OMS in sync · checked 2 min ago</span>
        </div>
      </div>

      {/* Order Book Table */}
      <div className="border border-line rounded-r3 bg-surface overflow-hidden shadow-sh-1">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-surface text-ink-3 uppercase text-[10px] font-semibold border-b border-line sticky top-0 z-10 tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-8"></th>
                <th className="py-2.5 px-3">Pane ID</th>
                <th className="py-2.5 px-3">Order No</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Room / Window</th>
                <th className="py-2.5 px-3">Dimensions</th>
                <th className="py-2.5 px-3">Cutting Method</th>
                <th className="py-2.5 px-3">Production Status</th>
                <th className="py-2.5 px-3 text-right">Price ex VAT</th>
                <th className="py-2.5 px-3 text-right">Last OMS Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-elevated">
              {filteredPanes.slice(0, 100).map(pane => (
                <tr
                  key={pane.id}
                  onClick={() => openPaneDrawer(pane.paneId)}
                  className="hover:bg-primary-tint/30 cursor-pointer transition-colors duration-120 h-12"
                >
                  <td className="py-2.5 px-3 text-ink-3">
                    <span title="Rule 2 Enforced: Ordered pane is permanently immutable">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    </span>
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="font-semibold text-primary">{pane.paneDisplayId}</span>
                      <span className="text-[10px] text-ink-3">({pane.versionUsed})</span>
                    </div>
                  </td>

                  <td className="py-2.5 px-3 font-mono font-medium text-ink">
                    {pane.orderNumber}
                  </td>

                  <td className="py-2.5 px-3 font-medium text-ink">
                    {pane.customerName}
                  </td>

                  <td className="py-2.5 px-3 text-ink-2">
                    {pane.roomName} ({pane.windowLabel})
                  </td>

                  <td className="py-2.5 px-3 font-mono text-ink">
                    {formatDimensions(pane.width, pane.height)}
                  </td>

                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F2EFE8] text-ink-2 border border-line">
                      {pane.cuttingMethod}
                    </span>
                  </td>

                  <td className="py-2.5 px-3" onClick={e => e.stopPropagation()}>
                    {isEditModeUnlocked ? (
                      <select
                        value={pane.productionStatus}
                        onChange={e => handleStatusChange(pane.id, e.target.value as any)}
                        className="bg-elevated border border-line rounded px-2 py-0.5 text-[11px] text-ink font-medium"
                      >
                        <option value="Ready to Cut">Ready to Cut</option>
                        <option value="Awaiting Acrylic">Awaiting Acrylic</option>
                        <option value="Acrylic Received">Acrylic Received</option>
                        <option value="In Production">In Production</option>
                        <option value="Complete">Complete</option>
                      </select>
                    ) : (
                      <StatusPill status={pane.productionStatus} />
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-ink">
                    {formatGbp(pane.chargedPrice)}
                  </td>

                  <td className="py-2.5 px-3 text-right text-ink-3 text-[11px]">
                    {timeAgo(pane.omsLastSync)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXPORT DRAWER SHEET (Right 480px) */}
      {exportSheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-[#1E2824]/20" onClick={() => setExportSheetOpen(false)} />
          <div className="relative w-full max-w-[480px] bg-elevated border-l border-line shadow-sh-3 h-full z-10 p-6 flex flex-col justify-between text-[13px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  <h3 className="font-serif-display font-medium text-[18px] text-ink">
                    Export: {exportTargetMethod}
                  </h3>
                </div>
                <button onClick={() => setExportSheetOpen(false)} className="text-ink-3 hover:text-ink text-[18px]">
                  ×
                </button>
              </div>

              <p className="text-ink-2 text-[12px] leading-relaxed">
                Pre-flight preview of cutting schedule batch. Only panes currently marked{' '}
                <strong className="text-ink">Ready to Cut</strong> for method{' '}
                <strong className="text-ink">{exportTargetMethod}</strong> will be exported.
              </p>

              <div className="p-3 bg-surface border border-line rounded-r2 space-y-1 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-ink-3">File Name:</span>
                  <span className="font-mono text-ink font-semibold">
                    {exportTargetMethod === 'Laser Cut' ? 'laser-cut-2026-10-10.xlsx' : 'pane-order-2026-10-10.xlsx'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-3">Batch Panes Count:</span>
                  <span className="font-mono text-ink font-semibold">
                    {exportTargetMethod === 'Laser Cut' ? laserReadyPanes.length : paneOrderReadyPanes.length} panes
                  </span>
                </div>
              </div>

              {/* Sample 5 Rows Preview */}
              <div className="space-y-1.5">
                <span className="block text-[11px] uppercase font-semibold text-ink-3">
                  First 5 Rows Preview
                </span>
                <div className="border border-line rounded overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-surface text-ink-3 uppercase border-b border-line">
                      <tr>
                        <th className="p-2">Pane</th>
                        <th className="p-2">Customer</th>
                        <th className="p-2">Dimensions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {(exportTargetMethod === 'Laser Cut' ? laserReadyPanes : paneOrderReadyPanes)
                        .slice(0, 5)
                        .map(p => (
                          <tr key={p.id}>
                            <td className="p-2 font-mono font-medium text-ink">{p.paneDisplayId}</td>
                            <td className="p-2 text-ink-2">{p.customerName}</td>
                            <td className="p-2 font-mono text-ink-3">{p.width} × {p.height} mm</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-line flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setExportSheetOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleExecuteDownload} className="gap-2">
                <Download className="w-4 h-4" />
                <span>Download .xlsx file</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
