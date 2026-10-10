import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../mock/store';
import { formatGbp, formatDimensions } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, MessageSquare, Check, ShieldCheck, ArrowLeft, RotateCcw } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export const CustomerQuoteViewPage: React.FC = () => {
  const { ref } = useParams<{ ref: string }>();
  const navigate = useNavigate();
  const { quotes, respondToQuote, resetAllDemoState } = useAppStore();
  const { addToast } = useToast();

  const quote = quotes.find(q => q.reference === ref) || quotes[0];
  const draft = quote?.drafts[quote.activeVersion] || Object.values(quote?.drafts || {})[0];

  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [hasAuthorityChecked, setHasAuthorityChecked] = useState(false);
  const [isAcceptedSuccess, setIsAcceptedSuccess] = useState(draft?.status === 'Accepted');

  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [isQuerySuccess, setIsQuerySuccess] = useState(false);

  if (!quote || !draft) return <div>Quotation not found.</div>;

  const handleConfirmAccept = () => {
    if (!hasAuthorityChecked) return;
    respondToQuote(quote.id, 'accept');
    setIsAcceptModalOpen(false);
    setIsAcceptedSuccess(true);
    addToast({
      type: 'success',
      message: 'Email confirmation sent to sales@geckoglazing.co.uk · Home Action Queue updated',
    });
  };

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (questionText.length < 10) return;
    respondToQuote(quote.id, 'query', questionText);
    setIsQueryModalOpen(false);
    setIsQuerySuccess(true);
    addToast({
      type: 'info',
      message: 'Question logged · Quotation marked as Queried in sales queue',
    });
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col font-ui text-ink antialiased">
      {/* Demo Frame Header Strip */}
      <header className="bg-primary text-elevated px-4 py-2 text-[12px] flex items-center justify-between shadow-sh-1 select-none">
        <div className="flex items-center gap-3">
          <span className="font-semibold uppercase tracking-wider bg-primary-active px-2 py-0.5 rounded text-[11px]">
            Customer's View of Email Link
          </span>
          <span className="text-elevated/80 hidden sm:inline">
            Simulated client-facing quotation acceptance portal
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              resetAllDemoState();
              navigate('/app');
            }}
            className="inline-flex items-center gap-1 text-[11px] text-elevated/80 hover:text-elevated hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset demo state</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/app')}
            className="inline-flex items-center gap-1 font-semibold text-elevated hover:underline"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Return to Workspace</span>
          </button>
        </div>
      </header>

      {/* Main Quotation Document Container (max 880px single column on --bg) */}
      <main className="max-w-[880px] w-full mx-auto p-6 md:p-12 my-6 bg-surface border border-line rounded-r3 shadow-sh-2 space-y-8">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-line">
          <div>
            <span className="font-serif-display font-medium text-[24px] text-primary">
              Gecko Glazing
            </span>
            <p className="text-[12px] text-ink-3 uppercase tracking-wider mt-0.5">
              Bespoke Secondary Glazing · Conservation &amp; Heritage
            </p>
          </div>

          <div className="text-left sm:text-right text-[13px]">
            <span className="font-mono font-semibold text-[16px] text-ink block">
              {quote.reference}
            </span>
            <span className="text-ink-3 text-[12px] block">
              Date: 10 Oct 2026 · Valid for 30 days
            </span>
          </div>
        </div>

        {/* Client & Property Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[13px] p-4 bg-bg rounded-r2 border border-line">
          <div>
            <span className="text-[11px] font-semibold uppercase text-ink-3 block mb-1">
              Quotation For
            </span>
            <strong className="text-ink font-semibold text-[14px]">{quote.customerName}</strong>
            <p className="text-ink-2 mt-0.5">{quote.propertyAddress}</p>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase text-ink-3 block mb-1">
              Specification Scheme
            </span>
            <strong className="text-ink font-semibold">{draft.title}</strong>
            <p className="text-ink-2 mt-0.5">
              Includes bespoke measuring, laser cutting, and fitting service.
            </p>
          </div>
        </div>

        {/* Accepted Banner */}
        {isAcceptedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-r2 flex items-center justify-between text-emerald-900 text-[13px]">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <strong>Quotation Accepted on 10 Oct 2026</strong>
                <p className="text-[12px] text-emerald-800">
                  Thank you. Gecko's workshop has received your order approval.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/app')}
            >
              Back to Home Queue
            </Button>
          </div>
        )}

        {/* Queried Banner */}
        {isQuerySuccess && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-r2 text-amber-900 text-[13px]">
            <div className="flex items-center gap-2 font-semibold">
              <MessageSquare className="w-4 h-4 text-amber-700" />
              <span>Your question has been received by our estimators.</span>
            </div>
            <p className="text-[12px] text-amber-800 mt-1">
              Gecko will review your question and respond within one working day.
            </p>
          </div>
        )}

        {/* Quoted Lines Table */}
        <div className="border border-line rounded-r2 overflow-hidden bg-elevated">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-surface text-ink-3 uppercase text-[10px] font-semibold border-b border-line">
              <tr>
                <th className="p-3">Pane</th>
                <th className="p-3">Location</th>
                <th className="p-3">Dimensions</th>
                <th className="p-3">Specification</th>
                <th className="p-3 text-right">Price ex VAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {draft.lines.map(line => (
                <tr key={line.paneId} className="hover:bg-surface/40">
                  <td className="p-3 font-mono font-semibold text-primary">{line.paneDisplayId}</td>
                  <td className="p-3 text-ink-2">{line.roomName} ({line.windowLabel})</td>
                  <td className="p-3 font-mono text-ink-2">{formatDimensions(line.width, line.height)}</td>
                  <td className="p-3 text-ink-3 text-[12px]">
                    {line.colour.split(' ')[0]} · {line.furniture} {line.tags.length > 0 ? `· ${line.tags.join(', ')}` : ''}
                  </td>
                  <td className="p-3 text-right font-mono font-semibold text-ink">
                    {formatGbp(line.chargedPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="p-5 bg-bg rounded-r2 border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[13px]">
          <div className="text-ink-2 space-y-1">
            <span className="block text-ink font-semibold">Terms &amp; Payment</span>
            <p className="text-[12px] text-ink-3">
              secondary glazing panels fabricated to tolerance. Subtotal and total shown ex-VAT.
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="text-ink-3 text-[12px]">Total Payable (ex VAT)</div>
            <div className="font-mono text-[24px] font-semibold text-ink">
              {formatGbp(draft.totalExVat)}
            </div>
            <div className="text-[11px] text-ink-3">20% VAT shown on final tax invoice</div>
          </div>
        </div>

        {/* Customer Actions: Accept Quotation & I have a question */}
        {!isAcceptedSuccess && (
          <div className="pt-4 border-t border-line flex flex-wrap items-center justify-end gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsQueryModalOpen(true)}
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>I have a question</span>
            </Button>

            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsAcceptModalOpen(true)}
              className="gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Accept quotation ({formatGbp(draft.totalExVat)})</span>
            </Button>
          </div>
        )}
      </main>

      {/* ACCEPT MODAL CONFIRMATION */}
      {isAcceptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#1E2824]/30 backdrop-blur-[1px]" onClick={() => setIsAcceptModalOpen(false)} />
          <div className="relative w-full max-w-md bg-elevated border border-line-strong rounded-r3 shadow-sh-3 p-6 z-10 text-[13px] space-y-4">
            <h3 className="font-serif-display font-medium text-[18px] text-ink">
              Confirm Quotation Acceptance
            </h3>
            <p className="text-ink-2 text-[13px] leading-relaxed">
              Accepting lets Gecko Glazing schedule survey verification and prepare your bespoke acrylic fabrication order ({draft.lines.length} panes).
            </p>

            <label className="flex items-start gap-2.5 p-3 bg-bg rounded-r2 border border-line cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasAuthorityChecked}
                onChange={e => setHasAuthorityChecked(e.target.checked)}
                className="mt-0.5 accent-primary"
              />
              <span className="text-[12px] text-ink-2">
                I confirm I have authority to approve this secondary glazing order for{' '}
                <strong className="text-ink">{quote.propertyName}</strong>.
              </span>
            </label>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <Button variant="ghost" size="sm" onClick={() => setIsAcceptModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={!hasAuthorityChecked}
                onClick={handleConfirmAccept}
              >
                Confirm acceptance
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION MODAL */}
      {isQueryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#1E2824]/30" onClick={() => setIsQueryModalOpen(false)} />
          <div className="relative w-full max-w-md bg-elevated border border-line-strong rounded-r3 shadow-sh-3 p-6 z-10 text-[13px] space-y-4">
            <h3 className="font-serif-display font-medium text-[18px] text-ink">
              Ask a Question Regarding {quote.reference}
            </h3>
            <p className="text-ink-2 text-[12px]">
              Please describe your question or required adjustments. Our estimating team will reply promptly.
            </p>

            <form onSubmit={handleSendQuestion} className="space-y-3">
              <textarea
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                required
                minLength={10}
                placeholder="e.g. Can we adjust the finish on the master bedroom panels to match the cream woodwork?"
                className="w-full bg-surface border border-line-strong rounded p-3 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-accent min-h-[100px]"
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsQueryModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={questionText.length < 10}>
                  Send question
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
