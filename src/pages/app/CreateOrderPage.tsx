import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../mock/store';
import { PayloadInspector } from '../../components/domain/PayloadInspector';
import { formatGbp, formatDimensions } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import {
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Layers,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export const CreateOrderPage: React.FC = () => {
  const { quoteRef } = useParams<{ quoteRef: string }>();
  const navigate = useNavigate();
  const { quotes, createWooCommerceOrder, demoSettings } = useAppStore();
  const { addToast } = useToast();

  const quote = quotes.find(q => q.reference === quoteRef) || quotes[0];
  const draft = quote?.drafts[quote.activeVersion] || Object.values(quote?.drafts || {})[0];

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pushStage, setPushStage] = useState<number>(0); // 0 = idle, 1..5 = stages, 6 = success, -1 = error
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!quote || !draft) return <div>Quote not found.</div>;

  const totalExVat = draft.totalExVat;

  const handleStartPush = async () => {
    setIsConfirmOpen(false);
    setPushStage(1);
    setErrorMessage(null);

    // Stage 1: Sending order to WooCommerce
    setTimeout(async () => {
      setPushStage(2);

      // Check simulated error
      if (demoSettings.simulateWooCommerceError) {
        setTimeout(() => {
          setPushStage(-1);
          setErrorMessage('WooCommerce returned an error. Nothing was written locally.');
        }, 600);
        return;
      }

      // Stage 3: Order created
      setTimeout(() => {
        setPushStage(3);

        // Stage 4: Writing ordered-pane records
        setTimeout(() => {
          setPushStage(4);

          // Stage 5: Linking order number
          setTimeout(async () => {
            setPushStage(5);
            const res = await createWooCommerceOrder(quote.id);
            if (res.success && res.orderNumber) {
              setCreatedOrderNumber(res.orderNumber);
              setPushStage(6);
              addToast({
                type: 'success',
                message: `Order ${res.orderNumber} created. ${draft.lines.length} ordered panes written & locked.`,
              });
            } else {
              setPushStage(-1);
              setErrorMessage(res.error || 'Push failed');
            }
          }, 600);
        }, 600);
      }, 600);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(`/app/quotes/${quote.reference}`)}
            className="text-[12px] text-ink-3 hover:text-ink flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Quote {quote.reference}</span>
          </button>
          <h1 className="text-[26px] font-serif-display font-medium text-ink">
            Create WooCommerce Order
          </h1>
          <p className="text-[13px] text-ink-2 mt-0.5">
            Stage 3: Pushing accepted quote {quote.reference} ({quote.customerName}) to WooCommerce order book
          </p>
        </div>

        {pushStage === 0 && (
          <Button
            variant="accent"
            size="lg"
            onClick={() => setIsConfirmOpen(true)}
            className="gap-2 self-start sm:self-auto"
          >
            <Lock className="w-4 h-4" />
            <span>Execute transactional push</span>
          </Button>
        )}
      </div>

      {/* STAGED PROGRESS SIMULATION CARD */}
      {pushStage > 0 && pushStage <= 5 && (
        <div className="p-6 bg-surface border border-accent rounded-r3 shadow-sh-2 space-y-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-accent animate-spin" />
            <span className="font-serif-display text-[18px] font-medium text-ink">
              Executing Transactional WooCommerce Order Creation...
            </span>
          </div>

          <div className="space-y-2 text-[13px]">
            <div className={`flex items-center gap-2 ${pushStage >= 1 ? 'text-ink font-semibold' : 'text-ink-3'}`}>
              <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">1</span>
              <span>Sending validated JSON payload to WooCommerce REST endpoint...</span>
            </div>
            <div className={`flex items-center gap-2 ${pushStage >= 2 ? 'text-ink font-semibold' : 'text-ink-3'}`}>
              <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">2</span>
              <span>WooCommerce order entity created and verified...</span>
            </div>
            <div className={`flex items-center gap-2 ${pushStage >= 3 ? 'text-ink font-semibold' : 'text-ink-3'}`}>
              <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">3</span>
              <span>Writing {draft.lines.length} immutable ordered-pane snapshot records...</span>
            </div>
            <div className={`flex items-center gap-2 ${pushStage >= 4 ? 'text-ink font-semibold' : 'text-ink-3'}`}>
              <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">4</span>
              <span>Linking order numbers back to each survey pane record...</span>
            </div>
            <div className={`flex items-center gap-2 ${pushStage >= 5 ? 'text-ink font-semibold' : 'text-ink-3'}`}>
              <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">5</span>
              <span>Locking ordered panes under Settled Rule 2 (permanently immutable)...</span>
            </div>
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {pushStage === -1 && (
        <div className="p-6 bg-red-50 border border-red-300 rounded-r3 text-[13px] space-y-3">
          <div className="flex items-center gap-2 text-error font-semibold text-[16px]">
            <AlertCircle className="w-5 h-5 text-error" />
            <span>WooCommerce Order Creation Failed</span>
          </div>
          <p className="text-red-900">
            {errorMessage || 'WooCommerce returned an error. Nothing was written locally.'}
          </p>
          <div className="pt-2 flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => setPushStage(0)}>
              Reset
            </Button>
            <Button variant="danger" size="sm" onClick={handleStartPush}>
              Retry push
            </Button>
          </div>
        </div>
      )}

      {/* SUCCESS STATE */}
      {pushStage === 6 && (
        <div className="p-8 bg-emerald-50 border border-emerald-300 rounded-r3 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="font-serif-display font-medium text-[22px] text-emerald-950">
            Order {createdOrderNumber} Created Successfully
          </h3>

          <p className="text-[14px] text-emerald-900 max-w-md mx-auto">
            {draft.lines.length} ordered panes have been written to the production database and locked as immutable snapshots.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/app/customers/cust_calloway')}
            >
              Back to customer
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/app/orders')}
            >
              View in Order Book →
            </Button>
          </div>
        </div>
      )}

      {/* 2-Column Grid: Lines Table & Payload Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Quoted Order Lines Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-ink text-[16px]">
              Order Lines ({draft.lines.length} Panes)
            </h3>
            <span className="text-[12px] text-ink-3">
              Total: {formatGbp(totalExVat)} ex VAT
            </span>
          </div>

          <div className="border border-line rounded-r3 bg-surface overflow-hidden shadow-sh-1">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-surface text-ink-3 uppercase text-[10px] font-semibold border-b border-line sticky top-0 z-10">
                  <tr>
                    <th className="p-2.5">Pane</th>
                    <th className="p-2.5">Room / Window</th>
                    <th className="p-2.5">Dimensions</th>
                    <th className="p-2.5">Colour</th>
                    <th className="p-2.5 text-right">Price ex VAT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-elevated">
                  {draft.lines.map(line => (
                    <tr key={line.paneId} className="hover:bg-surface/50">
                      <td className="p-2.5 font-mono font-semibold text-primary">{line.paneDisplayId}</td>
                      <td className="p-2.5 text-ink-2">{line.roomName} ({line.windowLabel})</td>
                      <td className="p-2.5 font-mono text-ink-3">{formatDimensions(line.width, line.height)}</td>
                      <td className="p-2.5 text-ink-2">{line.colour.split(' ')[0]}</td>
                      <td className="p-2.5 text-right font-mono font-semibold text-ink">
                        {formatGbp(line.chargedPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pre-Flight Checklist */}
          <div className="p-4 bg-surface border border-line rounded-r3 space-y-2 text-[12px]">
            <span className="block font-semibold text-ink uppercase text-[11px] tracking-wider mb-1">
              Transactional Pre-Flight Checks
            </span>
            <div className="space-y-1.5 text-ink-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                <span>All lines priced from catalogue &amp; rules table ✓</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                <span>No pane ordered twice in this order batch ✓</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                <span>Coupon applied as a coupon (not as an arbitrary discount line) ✓</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                <span>Subtotal and total verified ex-VAT ✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Payload Inspector */}
        <div className="lg:col-span-5 sticky top-20">
          <PayloadInspector
            quoteRef={quote.reference}
            customerName={quote.customerName}
            totalExVat={totalExVat}
            linesCount={draft.lines.length}
            sampleLine={draft.lines[0]}
          />
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#1E2824]/30 backdrop-blur-[1px]" onClick={() => setIsConfirmOpen(false)} />
          <div className="relative w-full max-w-md bg-elevated border border-line-strong rounded-r3 shadow-sh-3 p-6 z-10 text-[13px] space-y-4">
            <h3 className="font-serif-display font-medium text-[18px] text-ink">
              Confirm Order Book Generation
            </h3>

            <p className="text-ink-2 leading-relaxed">
              This action pushes <strong className="text-ink">{draft.lines.length} lines</strong> to WooCommerce. Once written, each ordered pane record is locked as an <strong className="text-ink">immutable snapshot</strong> under Rule 2 and cannot be altered.
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-[12px] text-amber-900">
              Future survey corrections will spawn versioned pane iterations (e.g. w1p3-3) while this order remains permanent.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <Button variant="ghost" size="sm" onClick={() => setIsConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleStartPush}>
                Confirm and Push
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
