import React, { useState, useMemo } from 'react';
import { Customer, Pane, Room, Window, Property } from '../../data/types';
import { useAppStore } from '../../mock/store';
import { formatGbp, formatDimensions } from '../../lib/format';
import { TagChip } from '../ui/TagChip';
import { Button } from '../ui/Button';
import { RollingNumber } from '../ui/RollingNumber';
import {
  ChevronRight,
  ChevronDown,
  Lock,
  History,
  Check,
  Minus,
  Sparkles,
  SlidersHorizontal,
  Search,
  Filter,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CustomerAccordionProps {
  customer: Customer;
  onOpenBulkEdit?: (paneIds: string[]) => void;
}

export const CustomerAccordion: React.FC<CustomerAccordionProps> = ({
  customer,
  onOpenBulkEdit,
}) => {
  const navigate = useNavigate();
  const {
    selectedPaneIds,
    toggleSelectPane,
    selectPanesBatch,
    clearSelection,
    openPaneDrawer,
    isEditModeUnlocked,
  } = useAppStore();

  // Collapsed / Expanded state per level
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    // Default: expand all properties and rooms of the customer
    customer.properties.forEach(p => {
      initial.add(p.id);
      p.rooms.forEach(r => initial.add(r.id));
      p.rooms.forEach(r => r.windows.forEach(w => initial.add(w.id)));
    });
    return initial;
  });

  // Local search and tag filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [orderedFilter, setOrderedFilter] = useState<'all' | 'ordered' | 'unconfirmed'>('all');

  const toggleExpand = (key: string) => {
    setExpandedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set<string>();
    customer.properties.forEach(p => {
      all.add(p.id);
      p.rooms.forEach(r => {
        all.add(r.id);
        r.windows.forEach(w => all.add(w.id));
      });
    });
    setExpandedKeys(all);
  };

  const collapseAll = () => {
    setExpandedKeys(new Set());
  };

  // Collect all panes for this customer
  const allCustomerPanes = useMemo(() => {
    const panes: Pane[] = [];
    customer.properties.forEach(p =>
      p.rooms.forEach(r =>
        r.windows.forEach(w =>
          w.panes.forEach(pane => panes.push(pane))
        )
      )
    );
    return panes;
  }, [customer]);

  // Filtered panes check helper
  const matchesFilter = (pane: Pane) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchText = `${pane.displayId} ${pane.roomName} ${pane.windowLabel} ${pane.colour} ${pane.furniture} ${pane.tags.join(' ')}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    if (tagFilter !== 'all' && !pane.tags.includes(tagFilter)) {
      return false;
    }
    if (orderedFilter === 'ordered' && pane.orderedOrderNumbers.length === 0) {
      return false;
    }
    if (orderedFilter === 'unconfirmed' && pane.orderedOrderNumbers.length > 0) {
      return false;
    }
    return true;
  };

  // Selection calculations
  const selectedCustomerPanes = allCustomerPanes.filter(p => selectedPaneIds.has(p.id));
  const selectionTotal = selectedCustomerPanes.reduce((acc, p) => acc + p.rulePrice, 0);

  // Group selected by room
  const selectedRoomNames = new Set(selectedCustomerPanes.map(p => p.roomName));
  const frostedCount = selectedCustomerPanes.filter(p => p.tags.includes('Frosted')).length;
  const archedCount = selectedCustomerPanes.filter(p => p.tags.includes('Arched')).length;

  // Tri-state checkbox helper
  const getSelectionState = (panes: Pane[]) => {
    const selectedCount = panes.filter(p => selectedPaneIds.has(p.id)).length;
    if (selectedCount === 0) return 'none';
    if (selectedCount === panes.length) return 'all';
    return 'partial';
  };

  const handleToggleLevel = (panes: Pane[]) => {
    const state = getSelectionState(panes);
    const ids = panes.map(p => p.id);
    if (state === 'all') {
      selectPanesBatch(ids, customer.id, false);
    } else {
      selectPanesBatch(ids, customer.id, true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="p-3 bg-surface border border-line rounded-r3 flex flex-wrap items-center justify-between gap-3 text-[13px]">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Find in customer survey..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-elevated border border-line rounded-r2 pl-8 pr-3 py-1 text-[13px] text-ink focus:outline-none focus:border-primary"
            />
          </div>

          <select
            value={tagFilter}
            onChange={e => setTagFilter(e.target.value)}
            className="bg-elevated border border-line rounded-r2 px-2.5 py-1 text-[13px] text-ink focus:outline-none"
          >
            <option value="all">All Tags</option>
            <option value="Frosted">Frosted</option>
            <option value="Arched">Arched</option>
            <option value="Angled">Angled</option>
            <option value="Museum Grade">Museum Grade</option>
          </select>

          <select
            value={orderedFilter}
            onChange={e => setOrderedFilter(e.target.value as any)}
            className="bg-elevated border border-line rounded-r2 px-2.5 py-1 text-[13px] text-ink focus:outline-none"
          >
            <option value="all">All Panes</option>
            <option value="ordered">Ordered Only (Padlocked)</option>
            <option value="unconfirmed">Unordered Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="text-[12px] text-ink-2 hover:text-ink hover:underline font-medium px-2 py-1"
          >
            Expand all
          </button>
          <span className="text-line-strong">|</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-[12px] text-ink-2 hover:text-ink hover:underline font-medium px-2 py-1"
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* Accordion Tree */}
      <div className="border border-line rounded-r3 bg-surface overflow-hidden shadow-sh-1 divide-y divide-line">
        {customer.properties.map(prop => {
          const propPanes: Pane[] = [];
          prop.rooms.forEach(r => r.windows.forEach(w => w.panes.forEach(p => propPanes.push(p))));
          const propTotal = propPanes.reduce((acc, p) => acc + p.rulePrice, 0);
          const isPropExpanded = expandedKeys.has(prop.id);
          const propSelectState = getSelectionState(propPanes);

          return (
            <div key={prop.id} className="bg-surface">
              {/* Level 1: Property Header */}
              <div className="p-3 bg-surface hover:bg-[#F2EFE8] flex items-center justify-between transition-colors border-b border-line select-none">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleExpand(prop.id)}
                    className="p-1 rounded hover:bg-elevated text-ink-2"
                    aria-label="Toggle Property"
                  >
                    {isPropExpanded ? (
                      <ChevronDown className="w-4 h-4 text-ink-2" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-ink-2" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleLevel(propPanes)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      propSelectState === 'all'
                        ? 'bg-primary border-primary text-elevated'
                        : propSelectState === 'partial'
                        ? 'bg-primary-tint border-primary text-primary'
                        : 'border-line-strong bg-elevated hover:border-ink-3'
                    }`}
                  >
                    {propSelectState === 'all' && <Check className="w-3 h-3 stroke-[3]" />}
                    {propSelectState === 'partial' && <Minus className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <div>
                    <span className="font-serif-display font-medium text-[16px] text-ink">
                      {prop.name}
                    </span>
                    <span className="text-[12px] text-ink-3 ml-2">
                      {prop.addressLine1}, {prop.city} {prop.postcode}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[13px] font-mono">
                  <span className="text-ink-2">{propPanes.length} panes</span>
                  <span className="font-semibold text-ink">{formatGbp(propTotal)} ex VAT</span>
                </div>
              </div>

              {/* Property Children (Rooms) */}
              {isPropExpanded && (
                <div className="divide-y divide-line/60 bg-elevated pl-6 border-l-2 border-line">
                  {prop.rooms.map(room => {
                    const roomPanes: Pane[] = [];
                    room.windows.forEach(w => w.panes.forEach(p => roomPanes.push(p)));
                    const roomTotal = roomPanes.reduce((acc, p) => acc + p.rulePrice, 0);
                    const isRoomExpanded = expandedKeys.has(room.id);
                    const roomSelectState = getSelectionState(roomPanes);

                    return (
                      <div key={room.id}>
                        {/* Level 2: Room Row */}
                        <div className="py-2.5 px-3 bg-surface/50 hover:bg-[#F2EFE8] flex items-center justify-between text-[13px] border-b border-line/40">
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => toggleExpand(room.id)}
                              className="p-1 rounded hover:bg-surface text-ink-2"
                            >
                              {isRoomExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-ink-2" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-ink-2" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleLevel(roomPanes)}
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                roomSelectState === 'all'
                                  ? 'bg-primary border-primary text-elevated'
                                  : roomSelectState === 'partial'
                                  ? 'bg-primary-tint border-primary text-primary'
                                  : 'border-line-strong bg-elevated hover:border-ink-3'
                              }`}
                            >
                              {roomSelectState === 'all' && <Check className="w-3 h-3 stroke-[3]" />}
                              {roomSelectState === 'partial' && <Minus className="w-3 h-3 stroke-[3]" />}
                            </button>

                            <span className="font-semibold text-ink">{room.name}</span>
                            <span className="text-[12px] text-ink-3">
                              ({room.windows.length} windows · {roomPanes.length} panes)
                            </span>

                            {isEditModeUnlocked && onOpenBulkEdit && (
                              <button
                                type="button"
                                onClick={() => onOpenBulkEdit(roomPanes.map(p => p.id))}
                                className="text-[11px] font-medium text-accent hover:underline px-2 py-0.5 rounded bg-accent-tint/50 border border-accent/30 ml-2"
                              >
                                Bulk edit room
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-4 font-mono text-[12px]">
                            <span className="text-ink-2">{roomPanes.length} panes</span>
                            <span className="font-medium text-ink">{formatGbp(roomTotal)}</span>
                          </div>
                        </div>

                        {/* Room Children (Windows) */}
                        {isRoomExpanded && (
                          <div className="divide-y divide-line/30 pl-6 border-l border-line/70">
                            {room.windows.map(win => {
                              const isWinExpanded = expandedKeys.has(win.id);
                              const winSelectState = getSelectionState(win.panes);

                              return (
                                <div key={win.id}>
                                  {/* Level 3: Window Row */}
                                  <div className="py-1.5 px-3 bg-surface/30 flex items-center justify-between text-[12px]">
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => toggleExpand(win.id)}
                                        className="p-0.5 text-ink-3 hover:text-ink"
                                      >
                                        {isWinExpanded ? (
                                          <ChevronDown className="w-3 h-3" />
                                        ) : (
                                          <ChevronRight className="w-3 h-3" />
                                        )}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleToggleLevel(win.panes)}
                                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                                          winSelectState === 'all'
                                            ? 'bg-primary border-primary text-elevated'
                                            : winSelectState === 'partial'
                                            ? 'bg-primary-tint border-primary text-primary'
                                            : 'border-line-strong bg-elevated'
                                        }`}
                                      >
                                        {winSelectState === 'all' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                        {winSelectState === 'partial' && <Minus className="w-2.5 h-2.5 stroke-[3]" />}
                                      </button>

                                      <span className="font-mono font-medium text-ink-2">
                                        Window {win.label}
                                      </span>
                                      <span className="text-ink-3">({win.panes.length} panes)</span>
                                    </div>
                                  </div>

                                  {/* Level 4: Pane Row (Leaf) */}
                                  {isWinExpanded && (
                                    <div className="divide-y divide-line/20 pl-6 border-l border-line/40">
                                      {win.panes.map(pane => {
                                        if (!matchesFilter(pane)) return null;

                                        const isPaneSelected = selectedPaneIds.has(pane.id);
                                        const isOrdered = pane.orderedOrderNumbers.length > 0;

                                        return (
                                          <div
                                            key={pane.id}
                                            onClick={() => openPaneDrawer(pane.id)}
                                            className={`py-2 px-3 flex items-center justify-between text-[13px] cursor-pointer transition-colors duration-120 ${
                                              isPaneSelected
                                                ? 'bg-primary-tint/60 border-l-2 border-primary'
                                                : 'hover:bg-surface/60'
                                            }`}
                                          >
                                            <div className="flex items-center gap-3">
                                              <input
                                                type="checkbox"
                                                checked={isPaneSelected}
                                                onChange={e => {
                                                  e.stopPropagation();
                                                  toggleSelectPane(pane.id, customer.id);
                                                }}
                                                className="w-4 h-4 rounded border-line-strong text-primary focus:ring-accent accent-primary"
                                              />

                                              <span className="font-mono font-semibold text-ink w-14">
                                                {pane.displayId}
                                              </span>

                                              {/* Swatch & Colour */}
                                              <div className="flex items-center gap-1.5 min-w-[130px]">
                                                <span
                                                  className="w-2.5 h-2.5 rounded-full border border-line-strong inline-block"
                                                  style={{
                                                    backgroundColor: pane.colour.includes('Black')
                                                      ? '#1A1A1A'
                                                      : pane.colour.includes('Anthracite')
                                                      ? '#383E42'
                                                      : pane.colour.includes('Cream')
                                                      ? '#F5F2EB'
                                                      : '#FFFFFF',
                                                  }}
                                                />
                                                <span className="text-ink-2 text-[12px] truncate max-w-[120px]">
                                                  {pane.colour.split(' ')[0]}
                                                </span>
                                              </div>

                                              {/* Furniture */}
                                              <span className="text-ink-3 text-[12px] min-w-[90px]">
                                                {pane.furniture}
                                              </span>

                                              {/* Dimensions */}
                                              <span className="font-mono text-[12px] text-ink min-w-[120px]">
                                                {formatDimensions(pane.width, pane.height)}
                                              </span>

                                              {/* Tags */}
                                              <div className="flex items-center gap-1">
                                                {pane.tags.map(t => (
                                                  <TagChip key={t} label={t} />
                                                ))}
                                              </div>

                                              {/* Ordered badge */}
                                              {isOrdered && (
                                                <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-r1 bg-slate-100 text-slate-700 border border-slate-300">
                                                  <Lock className="w-3 h-3 text-slate-500" />
                                                  <span>{pane.orderedOrderNumbers[0]}</span>
                                                </span>
                                              )}
                                            </div>

                                            {/* Right: Rule Price & History button */}
                                            <div className="flex items-center gap-3">
                                              <div className="text-right">
                                                <span className="font-mono font-semibold text-ink text-[13px]">
                                                  {formatGbp(pane.rulePrice)}
                                                </span>
                                                <span className="block text-[10px] text-ink-3">
                                                  Rule
                                                </span>
                                              </div>

                                              <button
                                                type="button"
                                                onClick={e => {
                                                  e.stopPropagation();
                                                  openPaneDrawer(pane.id);
                                                }}
                                                className="p-1 rounded text-ink-3 hover:text-ink hover:bg-surface"
                                                title="View pane history & versions"
                                              >
                                                <History className="w-4 h-4" />
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Selection Bar (PRD Section 12.4 requirement: 64px, elevated, sh-3, slides up) */}
      {selectedCustomerPanes.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-30 bg-elevated border-t border-line-strong shadow-sh-3 px-6 py-3 flex items-center justify-between transition-all duration-240"
          role="region"
          aria-label="Selection summary bar"
        >
          <div className="flex items-center gap-4">
            <div>
              <span className="font-semibold text-ink text-[14px]">
                {selectedCustomerPanes.length} panes selected
              </span>
              <span className="text-[12px] text-ink-3 ml-2">
                across {selectedRoomNames.size} rooms
              </span>
            </div>

            <span className="text-line-strong">|</span>

            {/* Tag breakdown */}
            <div className="text-[12px] text-ink-2 hidden sm:flex items-center gap-2">
              {frostedCount > 0 && <span>{frostedCount} Frosted</span>}
              {frostedCount > 0 && archedCount > 0 && <span>·</span>}
              {archedCount > 0 && <span>{archedCount} Arched</span>}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="block text-[10px] uppercase font-semibold text-ink-3">
                Panes Total (ex VAT)
              </span>
              <RollingNumber
                value={selectionTotal}
                className="text-[18px] font-semibold text-ink"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/app/quotes/QT-2026-0412')}
              >
                Build quote ({selectedCustomerPanes.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
