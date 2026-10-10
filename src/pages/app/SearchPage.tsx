import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../mock/store';
import { Pane } from '../../data/types';
import { formatGbp, formatDimensions } from '../../lib/format';
import { TagChip } from '../../components/ui/TagChip';
import { Button } from '../../components/ui/Button';
import {
  Search,
  SlidersHorizontal,
  Lock,
  Layers,
  CheckCircle,
  History,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export const SearchPage: React.FC = () => {
  const { allPanes, openPaneDrawer, selectPanesBatch, clearSelection } = useAppStore();
  const { addToast } = useToast();

  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedShape, setSelectedShape] = useState<string>('all');
  const [selectedColour, setSelectedColour] = useState<string>('all');
  const [orderedOnly, setOrderedOnly] = useState<boolean | null>(null);

  // Filter facets
  const filteredPanes = useMemo(() => {
    return allPanes.filter(p => {
      if (query) {
        const q = query.toLowerCase();
        const searchTerms = q.split(' ').filter(Boolean);
        const matchString = `${p.displayId} ${p.roomName} ${p.colour} ${p.furniture} ${p.tags.join(' ')} ${p.shape}`.toLowerCase();
        const matchesAllTerms = searchTerms.every(term => matchString.includes(term));
        if (!matchesAllTerms) return false;
      }

      if (selectedTag !== 'all' && !p.tags.includes(selectedTag)) return false;
      if (selectedShape !== 'all' && p.shape !== selectedShape) return false;
      if (selectedColour !== 'all' && !p.colour.includes(selectedColour)) return false;
      if (orderedOnly === true && p.orderedOrderNumbers.length === 0) return false;
      if (orderedOnly === false && p.orderedOrderNumbers.length > 0) return false;

      return true;
    });
  }, [allPanes, query, selectedTag, selectedShape, selectedColour, orderedOnly]);

  const handleSaveSelection = () => {
    if (filteredPanes.length === 0) return;
    const firstCustId = filteredPanes[0].customerId;
    const sameCustPanes = filteredPanes.filter(p => p.customerId === firstCustId);

    selectPanesBatch(sameCustPanes.map(p => p.id), firstCustId, true);
    addToast({
      type: 'success',
      message: `Selected ${sameCustPanes.length} panes under customer ${firstCustId} for quote building.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-serif-display font-medium text-ink">
            Global Pane Search
          </h1>
          <p className="text-[13px] text-ink-2 mt-0.5">
            Full-text facets and dimension queries indexed across all {allPanes.length.toLocaleString()} surveyed panes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuery('frosted arched')}
          >
            Try "frosted arched"
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleSaveSelection}
            disabled={filteredPanes.length === 0}
          >
            Save as selection ({filteredPanes.length})
          </Button>
        </div>
      </div>

      {/* Main 12-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 3 Columns: Facet Filters */}
        <div className="lg:col-span-3 border border-line rounded-r3 bg-surface p-4 shadow-sh-1 space-y-4 text-[13px]">
          <div className="flex items-center justify-between pb-2 border-b border-line font-semibold text-ink">
            <span>Filter Facets</span>
            <button
              onClick={() => {
                setQuery('');
                setSelectedTag('all');
                setSelectedShape('all');
                setSelectedColour('all');
                setOrderedOnly(null);
              }}
              className="text-[11px] text-ink-3 hover:text-ink font-normal underline"
            >
              Reset
            </button>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-ink-2 mb-1">
              Search Keywords
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="e.g. frosted arched drawing room"
                className="w-full bg-elevated border border-line rounded-r2 pl-8 pr-2.5 py-1 text-[13px] text-ink focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {/* Tag Facet */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-ink-2 mb-1">
              Specification Tag
            </label>
            <select
              value={selectedTag}
              onChange={e => setSelectedTag(e.target.value)}
              className="w-full bg-elevated border border-line rounded px-2.5 py-1 text-[12px] text-ink"
            >
              <option value="all">All Tags</option>
              <option value="Frosted">Frosted</option>
              <option value="Arched">Arched</option>
              <option value="Angled">Angled</option>
              <option value="Museum Grade">Museum Grade</option>
              <option value="3mm">3mm Acrylic</option>
            </select>
          </div>

          {/* Shape Facet */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-ink-2 mb-1">
              Geometry Shape
            </label>
            <select
              value={selectedShape}
              onChange={e => setSelectedShape(e.target.value)}
              className="w-full bg-elevated border border-line rounded px-2.5 py-1 text-[12px] text-ink"
            >
              <option value="all">All Shapes</option>
              <option value="Rectangle">Rectangle</option>
              <option value="Arched">Arched</option>
              <option value="Angled">Angled</option>
            </select>
          </div>

          {/* Colour Facet */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-ink-2 mb-1">
              Profile Finish
            </label>
            <select
              value={selectedColour}
              onChange={e => setSelectedColour(e.target.value)}
              className="w-full bg-elevated border border-line rounded px-2.5 py-1 text-[12px] text-ink"
            >
              <option value="all">All Colours</option>
              <option value="White">White (RAL 9016)</option>
              <option value="Anthracite">Anthracite (RAL 7016)</option>
              <option value="Black">Black (RAL 9005)</option>
              <option value="Cream">Heritage Cream (RAL 9001)</option>
            </select>
          </div>

          {/* Ordered State */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-ink-2 mb-1">
              Order Lineage Status
            </label>
            <select
              value={orderedOnly === null ? 'all' : orderedOnly ? 'ordered' : 'unordered'}
              onChange={e => {
                const v = e.target.value;
                setOrderedOnly(v === 'all' ? null : v === 'ordered');
              }}
              className="w-full bg-elevated border border-line rounded px-2.5 py-1 text-[12px] text-ink"
            >
              <option value="all">All Panes</option>
              <option value="ordered">Ordered Only (Padlocked)</option>
              <option value="unordered">Survey Unordered Only</option>
            </select>
          </div>
        </div>

        {/* Right 9 Columns: Live Results Grid */}
        <div className="lg:col-span-9 space-y-3">
          <div className="flex items-center justify-between text-[13px] px-1">
            <span className="text-ink-2">
              Found <strong className="text-ink font-semibold">{filteredPanes.length}</strong> matching panes
            </span>
            <span className="text-[12px] text-ink-3">Click row to open pane lineage drawer</span>
          </div>

          <div className="border border-line rounded-r3 bg-surface overflow-hidden shadow-sh-1">
            <div className="overflow-x-auto max-h-[580px]">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-surface text-ink-3 uppercase text-[10px] font-semibold border-b border-line sticky top-0 z-10">
                  <tr>
                    <th className="p-2.5">Pane ID</th>
                    <th className="p-2.5">Room / Window</th>
                    <th className="p-2.5">Dimensions</th>
                    <th className="p-2.5">Shape &amp; Colour</th>
                    <th className="p-2.5">Tags</th>
                    <th className="p-2.5 text-right">Rule Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-elevated">
                  {filteredPanes.slice(0, 80).map(p => {
                    const isOrdered = p.orderedOrderNumbers.length > 0;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => openPaneDrawer(p.id)}
                        className="hover:bg-primary-tint/30 cursor-pointer transition-colors duration-120"
                      >
                        <td className="p-2.5 font-mono font-semibold text-primary">
                          <div className="flex items-center gap-1.5">
                            <span>{p.displayId}</span>
                            {isOrdered && <Lock className="w-3 h-3 text-slate-500" />}
                          </div>
                        </td>

                        <td className="p-2.5 text-ink-2">
                          {p.roomName} ({p.windowLabel})
                        </td>

                        <td className="p-2.5 font-mono text-ink">
                          {formatDimensions(p.width, p.height)}
                        </td>

                        <td className="p-2.5 text-ink-3">
                          {p.shape} · {p.colour.split(' ')[0]}
                        </td>

                        <td className="p-2.5">
                          <div className="flex flex-wrap gap-1">
                            {p.tags.map(t => (
                              <TagChip key={t} label={t} />
                            ))}
                          </div>
                        </td>

                        <td className="p-2.5 text-right font-mono font-semibold text-ink">
                          {formatGbp(p.rulePrice)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
