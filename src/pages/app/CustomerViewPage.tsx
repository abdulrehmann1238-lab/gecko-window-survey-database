import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../mock/store';
import { CustomerAccordion } from '../../components/domain/CustomerAccordion';
import { BulkEditModal } from '../../components/domain/BulkEditModal';
import { formatGbp, formatDateTime, timeAgo } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  ShoppingBag,
  MessageSquare,
  Lock,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export const CustomerViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, quotes, orders, notes, addNote, amendNote } = useAppStore();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'survey' | 'quotes' | 'orders' | 'notes'>('survey');
  const [bulkEditPaneIds, setBulkEditPaneIds] = useState<string[] | null>(null);

  // Notes composer
  const [noteText, setNoteText] = useState('');
  const [noteScope, setNoteScope] = useState<'Customer' | 'Property'>('Customer');
  const [amendmentPromptId, setAmendmentPromptId] = useState<string | null>(null);
  const [amendmentText, setAmendmentText] = useState('');

  // Find customer or fallback to Calloway
  const customer = customers.find(c => c.id === id) || customers[0];
  if (!customer) return <div>Customer not found.</div>;

  // Panes count
  const totalPanes = customer.properties.reduce(
    (acc, p) => acc + p.rooms.reduce((racc, r) => racc + r.windows.reduce((wacc, w) => wacc + w.panes.length, 0), 0),
    0
  );

  // Customer quotes & orders & notes
  const customerQuotes = quotes.filter(q => q.customerId === customer.id);
  const customerOrders = orders.filter(o => o.customerId === customer.id);
  const customerNotes = notes.filter(n => n.customerId === customer.id);

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    addNote({
      customerId: customer.id,
      propertyId: customer.properties[0]?.id,
      propertyName: customer.properties[0]?.name,
      author: 'Priya Raman',
      scope: noteScope,
      text: noteText.trim(),
    });

    setNoteText('');
    addToast({
      type: 'success',
      message: 'Dated note recorded into customer ledger.',
    });
  };

  const handleSaveAmendment = (noteId: string) => {
    if (!amendmentText.trim()) return;
    amendNote(noteId, amendmentText.trim());
    setAmendmentPromptId(null);
    setAmendmentText('');
    addToast({
      type: 'success',
      message: 'Audited amendment appended to note.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Customer Header */}
      <div className="p-6 bg-surface border border-line rounded-r3 shadow-sh-1 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-[26px] font-serif-display font-medium text-ink">
                {customer.name}
              </h1>
              <span className="font-mono text-[12px] bg-primary-tint text-primary font-semibold px-2 py-0.5 rounded">
                {customer.hubspotId}
              </span>
            </div>
            <p className="text-[14px] text-ink-2 font-medium">
              {customer.company || customer.properties[0]?.name}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-[12px] text-ink-3 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {customer.address}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {customer.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {customer.phone}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('notes')}
            >
              Add note
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/app/quotes/QT-2026-0412')}
            >
              Build quote from selection
            </Button>
          </div>
        </div>

        {/* 4 Summary Metric Figures */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-line text-[13px]">
          <div>
            <span className="block text-[11px] uppercase font-semibold text-ink-3">Total Panes</span>
            <span className="font-mono text-[20px] font-semibold text-ink">{totalPanes}</span>
          </div>
          <div>
            <span className="block text-[11px] uppercase font-semibold text-ink-3">Survey Value (ex VAT)</span>
            <span className="font-mono text-[20px] font-semibold text-ink">{formatGbp(customer.surveyValueExVat)}</span>
          </div>
          <div>
            <span className="block text-[11px] uppercase font-semibold text-ink-3">Ordered Value (ex VAT)</span>
            <span className="font-mono text-[20px] font-semibold text-ink">{formatGbp(customer.orderedValueExVat)}</span>
          </div>
          <div>
            <span className="block text-[11px] uppercase font-semibold text-ink-3">Open Quotes</span>
            <span className="font-mono text-[20px] font-semibold text-primary">{customerQuotes.length} active</span>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center border-b border-line gap-6 text-[14px] font-medium font-ui">
        <button
          type="button"
          onClick={() => setActiveTab('survey')}
          className={`py-3 border-b-2 transition-all ${
            activeTab === 'survey'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-ink-3 hover:text-ink'
          }`}
        >
          Survey ({totalPanes} Panes)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quotes')}
          className={`py-3 border-b-2 transition-all ${
            activeTab === 'quotes'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-ink-3 hover:text-ink'
          }`}
        >
          Quotes ({customerQuotes.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`py-3 border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-ink-3 hover:text-ink'
          }`}
        >
          Orders ({customerOrders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={`py-3 border-b-2 transition-all ${
            activeTab === 'notes'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-ink-3 hover:text-ink'
          }`}
        >
          Dated Notes ({customerNotes.length})
        </button>
      </div>

      {/* TAB 1: SURVEY ACCORDION */}
      {activeTab === 'survey' && (
        <CustomerAccordion
          customer={customer}
          onOpenBulkEdit={ids => setBulkEditPaneIds(ids)}
        />
      )}

      {/* TAB 2: QUOTES */}
      {activeTab === 'quotes' && (
        <div className="border border-line rounded-r3 bg-surface overflow-hidden shadow-sh-1">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-surface text-ink-3 uppercase text-[10px] font-semibold border-b border-line">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Active Version</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Value ex VAT</th>
                <th className="p-3">Created</th>
                <th className="p-3">Last Update</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-elevated">
              {customerQuotes.map(q => {
                const draft = q.drafts[q.activeVersion];
                return (
                  <tr
                    key={q.id}
                    onClick={() => navigate(`/app/quotes/${q.reference}`)}
                    className="hover:bg-[#F2EFE8] cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-mono font-semibold text-primary">{q.reference}</td>
                    <td className="p-3 font-mono">{q.activeVersion} ({draft?.title || 'Draft'})</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary-tint text-primary">
                        {q.status}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-semibold text-ink">
                      {formatGbp(draft?.totalExVat)}
                    </td>
                    <td className="p-3 text-ink-3 font-mono text-[12px]">{formatDateTime(q.createdAt)}</td>
                    <td className="p-3 text-ink-3 text-[12px]">{timeAgo(q.updatedAt)}</td>
                    <td className="p-3 text-right text-primary font-medium hover:underline">
                      Open builder →
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {customerOrders.length === 0 ? (
            <div className="p-8 text-center text-ink-3 bg-surface border border-line rounded-r3">
              No orders confirmed yet for this customer.
            </div>
          ) : (
            customerOrders.map(o => (
              <div
                key={o.id}
                className="p-5 bg-elevated border border-line rounded-r3 shadow-sh-1 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-[16px] text-ink">
                      {o.orderNumber}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 font-medium">
                      WooCommerce Push Synced
                    </span>
                  </div>
                  <span className="font-mono text-[16px] font-semibold text-ink">
                    {formatGbp(o.totalExVat)} ex VAT
                  </span>
                </div>

                <p className="text-[12px] text-ink-3">
                  Pushed from quote {o.quoteRef} on {formatDateTime(o.createdAt)} · {o.paneCount} ordered panes
                </p>

                <div className="pt-2 border-t border-line flex items-center justify-between text-[12px]">
                  <span className="text-ink-2 font-medium">
                    All ordered panes permanently immutable under Rule 2
                  </span>
                  <button
                    onClick={() => navigate('/app/orders')}
                    className="text-primary hover:underline font-semibold"
                  >
                    View in Order Book →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: DATED NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {/* Note Composer */}
          <form onSubmit={handleCreateNote} className="p-5 bg-surface border border-line rounded-r3 space-y-3">
            <h4 className="font-semibold text-ink text-[14px]">
              Record Survey Note or Site Instruction
            </h4>

            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="e.g. Client requested Anthracite finish specifically for street facade..."
              className="w-full bg-elevated border border-line-strong rounded-r2 p-3 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-accent min-h-[90px]"
              required
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[12px]">
                <span className="text-ink-3">Scope:</span>
                <select
                  value={noteScope}
                  onChange={e => setNoteScope(e.target.value as any)}
                  className="bg-elevated border border-line rounded px-2 py-1 text-[12px] text-ink"
                >
                  <option value="Customer">Whole Customer Ledger</option>
                  <option value="Property">Specific Property (14 Pelham)</option>
                </select>
              </div>

              <Button variant="primary" size="sm" type="submit">
                Add dated note
              </Button>
            </div>
          </form>

          {/* Notes Timeline List */}
          <div className="space-y-3">
            {customerNotes.map(n => (
              <div
                key={n.id}
                className="p-4 bg-elevated border border-line rounded-r3 shadow-sh-1 text-[13px] space-y-2"
              >
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">{n.author}</span>
                    <span className="text-[11px] px-1.5 py-0.2 rounded bg-primary-tint text-primary font-medium">
                      {n.scope}
                    </span>
                    {n.propertyName && (
                      <span className="text-ink-3 font-mono text-[11px]">({n.propertyName})</span>
                    )}
                  </div>
                  <span className="text-ink-3 font-mono">{formatDateTime(n.date)}</span>
                </div>

                <p className="text-ink-2 leading-relaxed">{n.text}</p>

                {/* Audited Amendment line */}
                {n.amendment && (
                  <div className="p-2.5 bg-accent-tint/40 border-l-2 border-accent rounded-r1 text-[12px] space-y-1 mt-2">
                    <div className="flex items-center justify-between font-semibold text-ink">
                      <span>Audited Amendment</span>
                      <span className="text-[11px] text-ink-3 font-mono">{formatDateTime(n.amendment.date)}</span>
                    </div>
                    <p className="text-ink-2 italic">{n.amendment.text}</p>
                  </div>
                )}

                {/* Add amendment toggle */}
                {!n.amendment && (
                  <div className="pt-2 border-t border-line flex justify-end">
                    {amendmentPromptId === n.id ? (
                      <div className="w-full space-y-2 pt-1">
                        <input
                          type="text"
                          value={amendmentText}
                          onChange={e => setAmendmentText(e.target.value)}
                          placeholder="Type correction or amendment note..."
                          className="w-full bg-surface border border-line rounded px-2.5 py-1 text-[12px] text-ink"
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setAmendmentPromptId(null)}>
                            Cancel
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleSaveAmendment(n.id)}>
                            Save amendment
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAmendmentPromptId(n.id)}
                        className="text-[11px] text-ink-3 hover:text-ink underline"
                      >
                        Append correction / amendment
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {bulkEditPaneIds && (
        <BulkEditModal
          paneIds={bulkEditPaneIds}
          isOpen={true}
          onClose={() => setBulkEditPaneIds(null)}
        />
      )}
    </div>
  );
};
