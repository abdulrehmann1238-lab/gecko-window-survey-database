import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../mock/store';
import { QuoteDraft, QuoteLineSnapshot } from '../../data/types';
import { formatGbp, formatDimensions } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { TagChip } from '../../components/ui/TagChip';
import { RollingNumber } from '../../components/ui/RollingNumber';
import {
  Send,
  Plus,
  Copy,
  SlidersHorizontal,
  RefreshCw,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Lock,
  MessageSquare,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export const QuoteBuilderPage: React.FC = () => {
  const { ref } = useParams<{ ref: string }>();
  const navigate = useNavigate();
  const { quotes, coupons, saveQuoteDraft, sendQuoteToCustomer, addAuditEntry } = useAppStore();
  const { addToast } = useToast();

  const quote = quotes.find(q => q.reference === ref) || quotes[0];
  const [activeVersion, setActiveVersion] = useState<string>(quote?.activeVersion || 'v2');

  const draft: QuoteDraft = quote?.drafts[activeVersion] || quote?.drafts['v2'] || (quote && Object.values(quote.drafts)[0]);

  // Local draft state for calculators & coupon
  const [selectedCoupon, setSelectedCoupon] = useState<string>(draft?.couponCode || 'HERITAGE10');
  const [columnsPopoverOpen, setColumnsPopoverOpen] = useState(false);
  const [showDimensions, setShowDimensions] = useState(draft?.columnsShown?.dimensions ?? true);
  const [visibleTags, setVisibleTags] = useState<string[]>(
    draft?.tagsShown || ['Arched', 'Angled', '3mm', 'Frosted', 'Museum Grade']
  );

  // Send modal
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(quote?.customerEmail || 'e.calloway@pelhamcrescent.co.uk');
  const [isSending, setIsSending] = useState(false);

  // Price override popover state
  const [overrideLineId, setOverrideLineId] = useState<string | null>(null);
  const [overridePrice, setOverridePrice] = useState<number>(0);
  const [overrideReason, setOverrideReason] = useState('');

  if (!quote || !draft) {
    return <div>Quote not found.</div>;
  }

  // Filtered lines based on visible tags
  const displayedLines = draft.lines.filter(l => {
    // If Frosted is toggled off in visibleTags, hide frosted panes!
    if (!visibleTags.includes('Frosted') && l.tags.includes('Frosted')) {
      return false;
    }
    return true;
  });

  // Calculate totals
  const panesSubtotal = displayedLines.reduce((acc, l) => acc + l.chargedPrice, 0);

  // Coupon discount
  let couponDiscount = 0;
  if (selectedCoupon === 'HERITAGE10') {
    couponDiscount = panesSubtotal * 0.10;
  } else if (selectedCoupon === 'TRADE5') {
    couponDiscount = panesSubtotal * 0.05;
  } else if (selectedCoupon === 'WELCOMEBACK' && panesSubtotal > 1500) {
    couponDiscount = 75.00;
  }

  const installCost = draft.installation.useCustom
    ? draft.installation.customCost || draft.installation.suggestedCost
    : draft.installation.suggestedCost;

  const shipCost = draft.shipping.useCustom
    ? draft.shipping.customCost || draft.shipping.suggestedCost
    : draft.shipping.suggestedCost;

  const totalExVat = Math.max(0, panesSubtotal - couponDiscount + installCost + shipCost);

  // Group lines by room
  const linesByRoom = displayedLines.reduce((acc, line) => {
    if (!acc[line.roomName]) acc[line.roomName] = [];
    acc[line.roomName].push(line);
    return acc;
  }, {} as Record<string, QuoteLineSnapshot[]>);

  const handleDuplicateDraft = () => {
    const nextVer = `v${Object.keys(quote.drafts).length + 1}`;
    const newDraft: QuoteDraft = {
      ...draft,
      version: nextVer,
      title: `Draft ${nextVer} (Duplicated from ${activeVersion})`,
      createdAt: new Date().toISOString(),
      status: 'Draft',
    };
    saveQuoteDraft(quote.id, nextVer, newDraft);
    setActiveVersion(nextVer);
    addToast({
      type: 'success',
      message: `Duplicated quotation draft ${nextVer}. Persisted with independent selection snapshot.`,
    });
  };

  const handleSavePriceOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideLineId || !overrideReason.trim()) return;

    const updatedLines = draft.lines.map(l => {
      if (l.paneId === overrideLineId) {
        return {
          ...l,
          chargedPrice: overridePrice,
          isOverridden: true,
          overrideReason,
          overrideUser: 'Priya Raman',
          overrideTimestamp: new Date().toISOString(),
        };
      }
      return l;
    });

    saveQuoteDraft(quote.id, activeVersion, { lines: updatedLines });

    addAuditEntry({
      user: 'Priya Raman',
      entityType: 'Price override',
      entityId: `${quote.reference} / ${overrideLineId}`,
      action: `Overrode price on ${overrideLineId} to £${overridePrice.toFixed(2)} (Reason: ${overrideReason})`,
      diff: {
        field: 'Price',
        before: `£${draft.lines.find(l => l.paneId === overrideLineId)?.rulePrice.toFixed(2)} (Rule)`,
        after: `£${overridePrice.toFixed(2)} (${overrideReason})`,
      },
    });

    setOverrideLineId(null);
    setOverrideReason('');
    addToast({
      type: 'success',
      message: 'Rule price override applied and recorded in audit log.',
    });
  };

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    setTimeout(() => {
      sendQuoteToCustomer(quote.id, recipientEmail);
      setIsSending(false);
      setIsSendModalOpen(false);
      addToast({
        type: 'success',
        message: `Quotation ${quote.reference} sent to ${recipientEmail}. Lines are now locked.`,
      });
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Quote Header */}
      <div className="p-6 bg-surface border border-line rounded-r3 shadow-sh-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-serif-display font-medium text-ink">
              {quote.reference}
            </h1>
            <span className="px-2 py-0.5 rounded text-[12px] font-semibold bg-primary-tint text-primary">
              {draft.status}
            </span>
            <span className="text-[13px] text-ink-3">
              {quote.customerName} · {quote.propertyName}
            </span>
          </div>

          {/* Draft Tabs */}
          <div className="flex items-center gap-2 mt-3 text-[13px]">
            {Object.keys(quote.drafts).map(vKey => {
              const d = quote.drafts[vKey];
              return (
                <button
                  key={vKey}
                  type="button"
                  onClick={() => setActiveVersion(vKey)}
                  className={`px-3 py-1 rounded-r2 font-mono text-[12px] transition-all ${
                    activeVersion === vKey
                      ? 'bg-elevated border border-line-strong font-semibold text-primary shadow-sh-1'
                      : 'bg-surface text-ink-3 hover:text-ink'
                  }`}
                >
                  {vKey} · {d.status}
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleDuplicateDraft}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] text-primary hover:underline font-medium ml-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Duplicate draft</span>
            </button>
          </div>

          <p className="text-[11px] text-ink-3 italic mt-1.5">
            Draft {activeVersion} holds snapshot of {draft.lines.length} survey panes. Later survey changes will not alter it.
          </p>
        </div>

        {/* Send Action */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate(`/customer-view/${quote.reference}`)}
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Customer view</span>
          </Button>

          {draft.status === 'Accepted' ? (
            <Button
              variant="accent"
              size="md"
              onClick={() => navigate(`/app/orders/new/${quote.reference}`)}
              className="gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Create WooCommerce order</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsSendModalOpen(true)}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send to customer</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main 2 Columns Layout: Left 8 Cols (Lines) / Right 4 Cols (Summary & Calculators) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT 8 COLUMNS: QUOTE LINES TABLE */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-serif-display font-medium text-[18px] text-ink">
                Quotation Lines ({displayedLines.length} panes)
              </h3>
            </div>

            {/* Show/Hide Columns & Tags Popover Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setColumnsPopoverOpen(!columnsPopoverOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] bg-elevated border border-line rounded-r2 text-ink hover:border-ink-3 transition-colors shadow-sh-1"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-ink-3" />
                <span>Columns &amp; tags</span>
              </button>

              {columnsPopoverOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-elevated border border-line-strong rounded-r3 shadow-sh-3 z-30 p-3 text-[12px] space-y-3">
                  <div className="font-semibold text-ink border-b border-line pb-1.5">
                    Visibility Controls
                  </div>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-ink-2">Show Dimensions</span>
                    <input
                      type="checkbox"
                      checked={showDimensions}
                      onChange={e => setShowDimensions(e.target.checked)}
                      className="accent-primary"
                    />
                  </label>

                  <div className="pt-2 border-t border-line">
                    <span className="block text-[11px] font-semibold uppercase text-ink-3 mb-1.5">
                      Toggle Specification Tags
                    </span>
                    {['Frosted', 'Arched', 'Angled', 'Museum Grade', '3mm'].map(tag => {
                      const isVisible = visibleTags.includes(tag);
                      return (
                        <label key={tag} className="flex items-center justify-between py-1 cursor-pointer">
                          <span className="text-ink-2">{tag}</span>
                          <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={() => {
                              if (isVisible) {
                                setVisibleTags(visibleTags.filter(t => t !== tag));
                              } else {
                                setVisibleTags([...visibleTags, tag]);
                              }
                            }}
                            className="accent-primary"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grouped Table by Room */}
          <div className="border border-line rounded-r3 bg-surface overflow-hidden shadow-sh-1">
            <div className="divide-y divide-line">
              {Object.entries(linesByRoom).map(([roomName, roomLines]) => {
                const roomSubtotal = roomLines.reduce((acc, l) => acc + l.chargedPrice, 0);

                return (
                  <div key={roomName}>
                    {/* Sticky Room Subheader */}
                    <div className="p-3 bg-surface/80 flex items-center justify-between text-[13px] border-b border-line/60">
                      <span className="font-semibold text-ink">{roomName}</span>
                      <span className="font-mono text-ink-2 text-[12px]">
                        Subtotal: <strong className="text-ink font-semibold">{formatGbp(roomSubtotal)}</strong> ex VAT
                      </span>
                    </div>

                    <table className="w-full text-left text-[12px] bg-elevated">
                      <thead className="bg-surface/30 text-ink-3 uppercase text-[10px] font-semibold border-b border-line/40">
                        <tr>
                          <th className="py-2 px-3">Pane</th>
                          <th className="py-2 px-3">Window</th>
                          {showDimensions && <th className="py-2 px-3">Dimensions</th>}
                          <th className="py-2 px-3">Colour &amp; Hardware</th>
                          <th className="py-2 px-3">Tags</th>
                          <th className="py-2 px-3 text-right">Price (ex VAT)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line/30">
                        {roomLines.map(line => (
                          <tr key={line.paneId} className="hover:bg-surface/50 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-semibold text-primary">
                              {line.paneDisplayId}
                            </td>

                            <td className="py-2.5 px-3 text-ink-3 font-mono">
                              {line.windowLabel}
                            </td>

                            {showDimensions && (
                              <td className="py-2.5 px-3 font-mono text-ink">
                                {formatDimensions(line.width, line.height)}
                              </td>
                            )}

                            <td className="py-2.5 px-3 text-ink-2">
                              <span>{line.colour.split(' ')[0]}</span> · <span className="text-ink-3">{line.furniture}</span>
                            </td>

                            <td className="py-2.5 px-3">
                              <div className="flex flex-wrap gap-1">
                                {line.tags.filter(t => visibleTags.includes(t)).map(t => (
                                  <TagChip key={t} label={t} />
                                ))}
                              </div>
                            </td>

                            {/* Rule Price with Overridden Support */}
                            <td className="py-2.5 px-3 text-right font-mono">
                              <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-ink text-[13px]">
                                    {formatGbp(line.chargedPrice)}
                                  </span>

                                  {/* Override Action Popover Trigger */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOverrideLineId(line.paneId);
                                      setOverridePrice(line.chargedPrice);
                                    }}
                                    className="text-[10px] text-accent font-semibold hover:underline"
                                    title="Override price with audit"
                                  >
                                    ✎
                                  </button>
                                </div>

                                {line.isOverridden ? (
                                  <div className="flex items-center gap-1 text-[11px] text-ink-3">
                                    <span className="line-through">{formatGbp(line.rulePrice)}</span>
                                    <span className="text-accent text-[9px]">▲ AUDITED</span>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-ink-3">Rule</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT 4 COLUMNS: STICKY SUMMARY & CALCULATORS */}
        <div className="lg:col-span-4 space-y-6 sticky top-20">
          {/* Totals Summary Card */}
          <div className="border border-line rounded-r3 bg-surface p-5 shadow-sh-1 space-y-4">
            <h3 className="font-serif-display font-medium text-[18px] text-ink">
              Quotation Summary
            </h3>

            <div className="space-y-2.5 text-[13px] border-b border-line pb-4">
              <div className="flex justify-between items-center text-ink-2">
                <span>Panes Subtotal ({displayedLines.length} panes)</span>
                <span className="font-mono text-ink font-medium">{formatGbp(panesSubtotal)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between items-center text-emerald-700">
                  <span>Coupon: {selectedCoupon}</span>
                  <span className="font-mono font-medium">- {formatGbp(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-ink-2">
                <span>Installation ({draft.installation.access})</span>
                <span className="font-mono text-ink font-medium">{formatGbp(installCost)}</span>
              </div>

              <div className="flex justify-between items-center text-ink-2">
                <span>Shipping ({draft.shipping.deliveryType})</span>
                <span className="font-mono text-ink font-medium">{formatGbp(shipCost)}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <div>
                <span className="block font-semibold text-ink text-[16px]">Total ex VAT</span>
                <span className="text-[11px] text-ink-3">VAT shown on customer invoice</span>
              </div>
              <RollingNumber
                value={totalExVat}
                className="text-[24px] font-semibold text-ink"
              />
            </div>
          </div>

          {/* WooCommerce Coupon Combobox Card */}
          <div className="border border-line rounded-r3 bg-surface p-4 shadow-sh-1 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-2">
                WooCommerce Coupon
              </label>
              <div className="flex items-center gap-1 text-[11px] text-ink-3">
                <RefreshCw className="w-3 h-3 text-ink-3" />
                <span>Synced 09:42</span>
              </div>
            </div>

            <select
              value={selectedCoupon}
              onChange={e => setSelectedCoupon(e.target.value)}
              className="w-full bg-elevated border border-line-strong rounded-r2 px-3 py-1.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">None (No coupon)</option>
              {coupons.map(c => (
                <option key={c.code} value={c.code} disabled={!c.isValid}>
                  {c.code} · {c.description} {!c.isValid ? `(${c.invalidReason})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Installation Calculator Card */}
          <div className="border border-line rounded-r3 bg-surface p-4 shadow-sh-1 space-y-3 text-[13px]">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-ink text-[14px]">
                Installation Calculator
              </h4>
              <span className="text-[11px] text-ink-3 font-mono">
                Suggested: £1,260.00
              </span>
            </div>

            <p className="text-[12px] text-ink-2 leading-relaxed">
              Rules estimate: 2 fitters × 1 day + 90 min commute ({draft.installation.access} floor).
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-line">
              <span className="text-ink-2">Applied Fitting Fee:</span>
              <span className="font-mono font-semibold text-ink">{formatGbp(installCost)}</span>
            </div>
          </div>

          {/* Shipping Calculator Card */}
          <div className="border border-line rounded-r3 bg-surface p-4 shadow-sh-1 space-y-3 text-[13px]">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-ink text-[14px]">
                Shipping &amp; Pallet Freight
              </h4>
              <span className="text-[11px] text-ink-3 font-mono">
                Postcode: BA1 2LJ
              </span>
            </div>

            <p className="text-[12px] text-ink-2 leading-relaxed">
              Dedicated freight pallet with shock absorbers for architectural conservation glazing.
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-line">
              <span className="text-ink-2">Freight Rate:</span>
              <span className="font-mono font-semibold text-ink">{formatGbp(shipCost)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PRICE OVERRIDE POPOVER MODAL */}
      {overrideLineId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#1E2824]/30" onClick={() => setOverrideLineId(null)} />
          <div className="relative w-full max-w-sm bg-elevated border border-line-strong rounded-r3 shadow-sh-3 p-5 z-10 text-[13px] space-y-3">
            <h3 className="font-semibold text-ink text-[14px]">
              Audit-Logged Price Override
            </h3>
            <p className="text-[12px] text-ink-2">
              Settled Rule 1: The database owns pricing. Any override requires an estimator reason and creates an auditable record.
            </p>

            <form onSubmit={handleSavePriceOverride} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-ink-2 mb-1">
                  New Price ex VAT (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={overridePrice}
                  onChange={e => setOverridePrice(Number(e.target.value))}
                  required
                  className="w-full bg-surface border border-line-strong rounded px-3 py-1.5 font-mono text-ink"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-ink-2 mb-1">
                  Reason for Override (Mandatory)
                </label>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={e => setOverrideReason(e.target.value)}
                  required
                  placeholder="e.g. Agreed trade discount for pair symmetry"
                  className="w-full bg-surface border border-line-strong rounded px-3 py-1.5 text-ink text-[12px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setOverrideLineId(null)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit">
                  Record override
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEND TO CUSTOMER MODAL WITH LIVE EMAIL PREVIEW */}
      {isSendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#1E2824]/30 backdrop-blur-[1px]" onClick={() => setIsSendModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-elevated border border-line-strong rounded-r3 shadow-sh-3 p-6 z-10 text-[13px] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <h3 className="font-serif-display font-medium text-[18px] text-ink">
                  Send Quotation {quote.reference}
                </h3>
              </div>
              <button onClick={() => setIsSendModalOpen(false)} className="text-ink-3 hover:text-ink text-[18px]">
                ×
              </button>
            </div>

            <form onSubmit={handleSendQuote} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-2 mb-1">
                  Recipient Email (HubSpot Sync)
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  required
                  className="w-full bg-surface border border-line-strong rounded-r2 px-3 py-1.5 text-[14px] text-ink"
                />
              </div>

              {/* Email Live Preview Box */}
              <div className="p-4 bg-bg border border-line rounded-r2 space-y-3 text-[13px]">
                <div className="text-[12px] text-ink-3 border-b border-line pb-2 flex justify-between">
                  <span>Subject: Your secondary glazing quotation {quote.reference}</span>
                  <span>From: sales@geckoglazing.co.uk</span>
                </div>

                <p className="text-ink-2">
                  Dear {quote.customerName},
                </p>
                <p className="text-ink-2 leading-relaxed">
                  Thank you for welcoming our surveyor to {quote.propertyName}. We have completed your bespoke secondary glazing quotation with today's specification and pricing.
                </p>

                <div className="p-3 bg-elevated border border-line rounded text-center space-y-2">
                  <span className="block font-mono text-[16px] font-semibold text-ink">
                    Quotation Reference: {quote.reference}
                  </span>
                  <span className="block text-[12px] text-ink-3">
                    {displayedLines.length} panes · Total: {formatGbp(totalExVat)} ex VAT
                  </span>
                  <div className="inline-block py-1.5 px-4 bg-primary text-elevated text-[12px] rounded font-medium">
                    View &amp; Accept Quotation Online
                  </div>
                </div>
              </div>

              {/* Checks Panel */}
              <div className="p-3 bg-surface border border-line rounded-r2 text-[12px] text-ink-2 flex flex-wrap gap-4">
                <span>✓ {displayedLines.length} panes priced</span>
                <span>✓ Coupon: {selectedCoupon || 'None'}</span>
                <span>✓ Installation verified</span>
                <span>✓ Totals ex VAT</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsSendModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" isLoading={isSending}>
                  Send quotation email
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
