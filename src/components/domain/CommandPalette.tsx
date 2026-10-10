import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../mock/store';
import { Search, User, FileText, ShoppingBag, ArrowRight } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { allPanes, customers, quotes, orders, openPaneDrawer } = useAppStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open in parent
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search filtered results
  const matchedPanes = q
    ? allPanes.filter(p =>
        p.displayId.toLowerCase().includes(q) ||
        p.roomName.toLowerCase().includes(q) ||
        p.colour.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      ).slice(0, 5)
    : allPanes.slice(0, 3);

  const matchedCustomers = q
    ? customers.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.hubspotId.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
      ).slice(0, 3)
    : customers.slice(0, 2);

  const matchedQuotes = q
    ? quotes.filter(qt =>
        qt.reference.toLowerCase().includes(q) ||
        qt.customerName.toLowerCase().includes(q)
      ).slice(0, 3)
    : quotes.slice(0, 2);

  const matchedOrders = q
    ? orders.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q)
      ).slice(0, 3)
    : orders.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-[#1E2824]/25 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative w-full max-w-[640px] bg-elevated border border-line-strong rounded-r3 shadow-sh-3 z-10 overflow-hidden text-[13px] flex flex-col">
        {/* Input Header */}
        <div className="flex items-center px-4 py-3 border-b border-line gap-3 bg-surface">
          <Search className="w-4 h-4 text-ink-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search panes (e.g. w1p3, frosted arched), customers, quotes..."
            autoFocus
            className="w-full bg-transparent text-ink font-ui text-[14px] focus:outline-none placeholder:text-ink-3"
          />
          <kbd className="px-1.5 py-0.5 text-[11px] font-mono text-ink-3 bg-elevated border border-line rounded">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3 divide-y divide-line/40">
          {/* Panes Group */}
          <div>
            <span className="block px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              Panes
            </span>
            <div className="space-y-0.5">
              {matchedPanes.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    openPaneDrawer(p.id);
                    onClose();
                  }}
                  className="px-3 py-2 rounded-r2 hover:bg-surface flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-semibold text-primary">{p.displayId}</span>
                    <span className="text-ink-2">{p.roomName} ({p.windowLabel})</span>
                    <span className="text-ink-3 text-[12px]">{p.width} × {p.height} mm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-ink-3">{p.tags.join(', ')}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-ink-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customers Group */}
          <div className="pt-2">
            <span className="block px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              Customers
            </span>
            <div className="space-y-0.5">
              {matchedCustomers.map(c => (
                <div
                  key={c.id}
                  onClick={() => {
                    navigate(`/app/customers/${c.id}`);
                    onClose();
                  }}
                  className="px-3 py-2 rounded-r2 hover:bg-surface flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-medium text-ink">{c.name}</span>
                    <span className="text-[11px] px-1.5 py-0.2 bg-[#F2EFE8] text-ink-2 font-mono rounded">
                      {c.hubspotId}
                    </span>
                  </div>
                  <span className="text-ink-3 text-[12px]">{c.address}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quotes Group */}
          <div className="pt-2">
            <span className="block px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              Quotes
            </span>
            <div className="space-y-0.5">
              {matchedQuotes.map(qt => (
                <div
                  key={qt.id}
                  onClick={() => {
                    navigate(`/app/quotes/${qt.reference}`);
                    onClose();
                  }}
                  className="px-3 py-2 rounded-r2 hover:bg-surface flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-semibold text-ink">{qt.reference}</span>
                    <span className="text-ink-2">{qt.customerName}</span>
                  </div>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-primary-tint text-primary font-medium">
                    {qt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Orders Group */}
          <div className="pt-2">
            <span className="block px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              Order Book
            </span>
            <div className="space-y-0.5">
              {matchedOrders.map(o => (
                <div
                  key={o.id}
                  onClick={() => {
                    navigate('/app/orders');
                    onClose();
                  }}
                  className="px-3 py-2 rounded-r2 hover:bg-surface flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-semibold text-ink">{o.orderNumber}</span>
                    <span className="text-ink-2">{o.customerName}</span>
                  </div>
                  <span className="font-mono text-ink text-[12px]">
                    £{o.totalExVat.toFixed(2)} ex VAT
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 bg-surface border-t border-line text-[11px] text-ink-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Navigate <kbd className="font-mono bg-elevated px-1 py-0.5 rounded border border-line">↑↓</kbd></span>
            <span>Select <kbd className="font-mono bg-elevated px-1 py-0.5 rounded border border-line">↵</kbd></span>
            <span>Close <kbd className="font-mono bg-elevated px-1 py-0.5 rounded border border-line">ESC</kbd></span>
          </div>
          <span className="italic">4,812 panes indexed live</span>
        </div>
      </div>
    </div>
  );
};
