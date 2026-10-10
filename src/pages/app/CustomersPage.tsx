import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../mock/store';
import { formatGbp, timeAgo } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { Search, ChevronRight, UploadCloud, SlidersHorizontal } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const { customers, allPanes } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'openQuote' | 'hasOrdered'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'surveyValue' | 'orderedValue'>('orderedValue');

  // Filtered and sorted customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter(c => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const match =
            c.name.toLowerCase().includes(q) ||
            (c.company && c.company.toLowerCase().includes(q)) ||
            c.address.toLowerCase().includes(q) ||
            c.hubspotId.toLowerCase().includes(q);
          if (!match) return false;
        }

        if (activeFilter === 'openQuote' && !c.hasOpenQuote) return false;
        if (activeFilter === 'hasOrdered' && c.orderedValueExVat <= 0) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'surveyValue') return b.surveyValueExVat - a.surveyValueExVat;
        if (sortBy === 'orderedValue') return b.orderedValueExVat - a.orderedValueExVat;
        return 0;
      });
  }, [customers, searchQuery, activeFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-serif-display font-medium text-ink">
            Customers
          </h1>
          <p className="text-[13px] text-ink-2 mt-0.5">
            {customers.length} registered conservation customers · {allPanes.length.toLocaleString()} total bespoke panes
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/app/intake')}
          className="gap-2 self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>New survey</span>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="p-3 bg-surface border border-line rounded-r3 flex flex-wrap items-center justify-between gap-3 text-[13px]">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-ink-3 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search customer name, company, HubSpot ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-elevated border border-line-strong rounded-r2 pl-9 pr-3 py-1.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-r2 text-[12px] font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-primary text-elevated'
                  : 'bg-elevated border border-line text-ink-2 hover:bg-[#F2EFE8]'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('openQuote')}
              className={`px-2.5 py-1 rounded-r2 text-[12px] font-medium transition-colors ${
                activeFilter === 'openQuote'
                  ? 'bg-primary text-elevated'
                  : 'bg-elevated border border-line text-ink-2 hover:bg-[#F2EFE8]'
              }`}
            >
              Has open quote
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('hasOrdered')}
              className={`px-2.5 py-1 rounded-r2 text-[12px] font-medium transition-colors ${
                activeFilter === 'hasOrdered'
                  ? 'bg-primary text-elevated'
                  : 'bg-elevated border border-line text-ink-2 hover:bg-[#F2EFE8]'
              }`}
            >
              Has ordered panes
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-ink-3 text-[12px]">Sort:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-elevated border border-line-strong rounded-r2 px-2.5 py-1 text-[13px] text-ink focus:outline-none"
          >
            <option value="orderedValue">Ordered Value</option>
            <option value="surveyValue">Survey Value</option>
            <option value="name">Customer Name</option>
          </select>
        </div>
      </div>

      {/* Customers Dense Table */}
      <div className="border border-line rounded-r3 bg-surface overflow-hidden shadow-sh-1">
        <div className="overflow-x-auto max-h-[640px]">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-surface text-ink-3 uppercase text-[10px] font-semibold border-b border-line sticky top-0 z-10 tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Properties</th>
                <th className="py-2.5 px-4">Panes</th>
                <th className="py-2.5 px-4 text-right">Survey Value (ex VAT)</th>
                <th className="py-2.5 px-4 text-right">Ordered Value (ex VAT)</th>
                <th className="py-2.5 px-4">Ordered Share</th>
                <th className="py-2.5 px-4 text-right">Last Activity</th>
                <th className="py-2.5 px-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-elevated">
              {filteredCustomers.slice(0, 100).map(c => {
                const panesCount = c.properties.reduce(
                  (acc, p) => acc + p.rooms.reduce((racc, r) => racc + r.windows.reduce((wacc, w) => wacc + w.panes.length, 0), 0),
                  0
                );
                const sharePercent = c.surveyValueExVat > 0
                  ? Math.min(100, Math.round((c.orderedValueExVat / c.surveyValueExVat) * 100))
                  : 0;

                return (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/app/customers/${c.id}`)}
                    className="hover:bg-primary-tint/40 cursor-pointer transition-colors duration-120 group h-14"
                  >
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink block">{c.name}</span>
                        <span className="text-[10px] font-mono text-ink-3 px-1.5 py-0.2 bg-[#F2EFE8] rounded">
                          {c.hubspotId}
                        </span>
                      </div>
                      <span className="text-[11px] text-ink-3 block">
                        {c.company || c.address}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 text-ink-2">
                      {c.properties.length} property
                    </td>

                    <td className="py-2.5 px-4 font-mono font-medium text-ink">
                      {panesCount}
                    </td>

                    <td className="py-2.5 px-4 text-right font-mono text-ink-2">
                      {formatGbp(c.surveyValueExVat)}
                    </td>

                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-ink">
                      {formatGbp(c.orderedValueExVat)}
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="w-20">
                        <div className="flex justify-between text-[10px] text-ink-3 mb-0.5">
                          <span>{sharePercent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${sharePercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-right text-ink-3 text-[12px]">
                      {timeAgo(c.lastActivity)}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <ChevronRight className="w-4 h-4 text-ink-3 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
