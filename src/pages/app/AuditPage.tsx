import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../mock/store';
import { formatDateTime } from '../../lib/format';
import { exportAuditLogToCsv } from '../../lib/export';
import { Button } from '../../components/ui/Button';
import {
  ShieldCheck,
  Search,
  Download,
  Filter,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export const AuditPage: React.FC = () => {
  const { auditLog } = useAppStore();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredLog = useMemo(() => {
    return auditLog.filter(entry => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          entry.action.toLowerCase().includes(q) ||
          entry.entityId.toLowerCase().includes(q) ||
          entry.user.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (userFilter !== 'all' && entry.user !== userFilter) return false;
      if (entityFilter !== 'all' && entry.entityType !== entityFilter) return false;
      return true;
    });
  }, [auditLog, searchQuery, userFilter, entityFilter]);

  const handleExport = () => {
    exportAuditLogToCsv(filteredLog, 'gecko-audit-log-2026-10-10');
    addToast({
      type: 'success',
      message: `Exported ${filteredLog.length} audited ledger entries to CSV.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-serif-display font-medium text-ink">
            Immutable Audit Trail
          </h1>
          <p className="text-[13px] text-ink-2 mt-0.5">
            Settled Rule 5: Every measurement change, price override, quotation event, and order snapshot is recorded with user &amp; timestamp
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={handleExport}
          className="gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export log ({filteredLog.length})</span>
        </Button>
      </div>

      {/* Toolbar Filters */}
      <div className="p-3 bg-surface border border-line rounded-r3 flex flex-wrap items-center justify-between gap-3 text-[13px]">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-ink-3 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit actions, entity IDs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-elevated border border-line-strong rounded-r2 pl-9 pr-3 py-1.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <select
            value={userFilter}
            onChange={e => setUserFilter(e.target.value)}
            className="bg-elevated border border-line-strong rounded-r2 px-2.5 py-1.5 text-[13px] text-ink focus:outline-none"
          >
            <option value="all">All Users</option>
            <option value="Priya Raman">Priya Raman (Estimator)</option>
            <option value="Daniel Okafor">Daniel Okafor (Surveyor)</option>
            <option value="Hannah Voss">Hannah Voss (Production)</option>
            <option value="Eleanor Calloway (Client)">Eleanor Calloway (Client)</option>
          </select>

          <select
            value={entityFilter}
            onChange={e => setEntityFilter(e.target.value)}
            className="bg-elevated border border-line-strong rounded-r2 px-2.5 py-1.5 text-[13px] text-ink focus:outline-none"
          >
            <option value="all">All Entity Types</option>
            <option value="Price override">Price override</option>
            <option value="Measurement">Measurement (Versioned)</option>
            <option value="Quote">Quote Lifecycle</option>
            <option value="Ordered pane">Ordered pane</option>
            <option value="Survey Intake">Survey Intake</option>
            <option value="Status">Production Status</option>
          </select>
        </div>

        <span className="text-[12px] text-ink-3">
          Showing {filteredLog.length} of {auditLog.length} entries
        </span>
      </div>

      {/* Audit Table */}
      <div className="border border-line rounded-r3 bg-surface overflow-hidden shadow-sh-1">
        <div className="overflow-x-auto max-h-[640px]">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-surface text-ink-3 uppercase text-[10px] font-semibold border-b border-line sticky top-0 z-10 tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-8"></th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Entity Type</th>
                <th className="py-2.5 px-3">Entity Reference</th>
                <th className="py-2.5 px-3">Action Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-elevated">
              {filteredLog.slice(0, 100).map(entry => {
                const isExpanded = expandedRowIds.has(entry.id);
                const hasDiff = Boolean(entry.diff);

                return (
                  <React.Fragment key={entry.id}>
                    <tr
                      onClick={() => hasDiff && toggleRow(entry.id)}
                      className={`hover:bg-[#F2EFE8] transition-colors ${
                        hasDiff ? 'cursor-pointer' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-ink-3">
                        {hasDiff && (
                          <button type="button" className="p-0.5">
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </td>

                      <td className="py-2.5 px-3 font-mono text-ink-3 text-[11px] whitespace-nowrap">
                        {formatDateTime(entry.timestamp)}
                      </td>

                      <td className="py-2.5 px-3 font-medium text-ink">
                        {entry.user}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-surface border border-line text-ink-2">
                          {entry.entityType}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 font-mono text-primary font-semibold">
                        {entry.entityId}
                      </td>

                      <td className="py-2.5 px-3 text-ink-2">
                        {entry.action}
                      </td>
                    </tr>

                    {/* Collapsible Diff Row */}
                    {isExpanded && entry.diff && (
                      <tr className="bg-surface/60">
                        <td colSpan={6} className="p-3 pl-12">
                          <div className="border border-line rounded p-3 bg-elevated text-[11px] font-mono grid grid-cols-2 gap-4">
                            <div className="p-2 bg-red-50/50 border border-red-200 rounded text-red-900">
                              <span className="block uppercase text-[9px] text-red-600 mb-1">
                                Before ({entry.diff.field})
                              </span>
                              <span>{entry.diff.before}</span>
                            </div>

                            <div className="p-2 bg-emerald-50/50 border border-emerald-200 rounded text-emerald-900">
                              <span className="block uppercase text-[9px] text-emerald-600 mb-1">
                                After ({entry.diff.field})
                              </span>
                              <span>{entry.diff.after}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
