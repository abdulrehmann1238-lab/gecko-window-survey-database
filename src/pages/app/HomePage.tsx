import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../mock/store';
import { formatGbp, timeAgo } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import {
  FileText,
  Scissors,
  Clock,
  PackageCheck,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  UploadCloud,
  Check,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { quotes, orderedPanes, customers, allPanes } = useAppStore();

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Count items
  const readyToCutCount = orderedPanes.filter(p => p.productionStatus === 'Ready to Cut').length;
  const awaitingAcrylicCount = orderedPanes.filter(p => p.productionStatus === 'Awaiting Acrylic').length;
  const inProductionCount = orderedPanes.filter(p => p.productionStatus === 'In Production').length;
  const completeCount = orderedPanes.filter(p => p.productionStatus === 'Complete').length;

  const queriedQuotesCount = quotes.filter(q => q.status === 'Queried').length;
  const acceptedQuotesCount = quotes.filter(q => q.status === 'Accepted').length;

  // Pipeline figures
  const totalSurveyedValue = customers.reduce((acc, c) => acc + c.surveyValueExVat, 0);
  const totalQuotedValue = quotes.reduce((acc, q) => {
    const draft = q.drafts[q.activeVersion];
    return acc + (draft ? draft.totalExVat : 0);
  }, 0);
  const totalAcceptedValue = quotes
    .filter(q => q.status === 'Accepted')
    .reduce((acc, q) => acc + (q.drafts[q.activeVersion]?.totalExVat || 0), 0);
  const totalOrderedValue = customers.reduce((acc, c) => acc + c.orderedValueExVat, 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-serif-display font-medium text-ink leading-tight">
            {greeting}, Priya.
          </h1>
          <p className="text-[14px] text-ink-2 mt-1">
            {queriedQuotesCount + acceptedQuotesCount} quotes need attention · {readyToCutCount} panes ready to cut
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/app/intake')}
            className="gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>New survey</span>
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/app/quotes/QT-2026-0412')}
            className="gap-2"
          >
            <span>Open next quote</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Columns: Quotes Action Queue */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-serif-display font-medium text-ink">
              Action Queue: Active Quotations
            </h2>
            <span className="text-[12px] text-ink-3">
              Sorted by urgency
            </span>
          </div>

          <div className="border border-line rounded-r3 bg-surface overflow-hidden shadow-sh-1">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-surface text-ink-3 uppercase text-[10px] font-semibold border-b border-line tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Reference</th>
                  <th className="py-2.5 px-4">Customer &amp; Query</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Value ex VAT</th>
                  <th className="py-2.5 px-4 text-right">Age</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {quotes.map(q => {
                  const draft = q.drafts[q.activeVersion];
                  const value = draft?.totalExVat || 0;
                  const queryText = draft?.questionExcerpt;

                  return (
                    <tr
                      key={q.id}
                      onClick={() => navigate(`/app/quotes/${q.reference}`)}
                      className={`hover:bg-[#F2EFE8] cursor-pointer transition-colors duration-120 group ${
                        q.status === 'Accepted' ? 'bg-[#FAF8F3]' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-primary">
                        {q.reference}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-ink block">{q.customerName}</span>
                        {queryText ? (
                          <span className="text-[11px] text-amber-800 flex items-center gap-1 mt-0.5 line-clamp-1 italic">
                            <MessageSquare className="w-3 h-3 shrink-0" />
                            "{queryText}"
                          </span>
                        ) : (
                          <span className="text-[11px] text-ink-3 block mt-0.5">
                            {q.propertyName}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {q.status === 'Accepted' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-r1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Accepted
                          </span>
                        )}
                        {q.status === 'Queried' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-r1 text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <MessageSquare className="w-3 h-3 text-amber-600" />
                            Queried
                          </span>
                        )}
                        {q.status === 'Sent' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-r1 text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
                            Sent
                          </span>
                        )}
                        {q.status === 'Draft' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-r1 text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            Draft ({q.activeVersion})
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-medium text-ink">
                        {formatGbp(value)}
                      </td>

                      <td className="py-3 px-4 text-right text-ink-3 text-[12px]">
                        {timeAgo(q.updatedAt)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="text-[12px] font-semibold text-primary group-hover:underline">
                          {q.status === 'Accepted' ? 'Create order' : 'Review'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 Columns: Pipeline Snapshot & Workshop Production */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pipeline Snapshot Card */}
          <div className="border border-line rounded-r3 bg-surface p-5 shadow-sh-1 space-y-4">
            <h3 className="font-serif-display font-medium text-[16px] text-ink">
              Glazing Pipeline Snapshot
            </h3>

            <div className="space-y-3 text-[13px]">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-ink-2">1. Surveyed</span>
                  <span className="font-mono font-medium text-ink">{formatGbp(totalSurveyedValue)}</span>
                </div>
                <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-ink-2">2. Quoted</span>
                  <span className="font-mono font-medium text-ink">{formatGbp(totalQuotedValue)}</span>
                </div>
                <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-[65%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-ink-2">3. Accepted</span>
                  <span className="font-mono font-medium text-ink">{formatGbp(totalAcceptedValue)}</span>
                </div>
                <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-[45%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-ink-2">4. Ordered</span>
                  <span className="font-mono font-semibold text-ink">{formatGbp(totalOrderedValue)}</span>
                </div>
                <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-[38%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Workshop Production Today Card */}
          <div className="border border-line rounded-r3 bg-surface p-5 shadow-sh-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-display font-medium text-[16px] text-ink">
                Workshop Production Today
              </h3>
              <button
                onClick={() => navigate('/app/orders')}
                className="text-[12px] text-primary hover:underline font-medium"
              >
                View all
              </button>
            </div>

            <div className="divide-y divide-line/60 text-[13px]">
              <div
                onClick={() => navigate('/app/orders?status=Ready to Cut')}
                className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#F2EFE8] px-2 rounded transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-slate-600" />
                  <span className="text-ink-2">Ready to Cut</span>
                </div>
                <span className="font-mono font-semibold text-ink bg-slate-200 px-2 py-0.5 rounded text-[12px]">
                  {readyToCutCount}
                </span>
              </div>

              <div
                onClick={() => navigate('/app/orders?status=Awaiting Acrylic')}
                className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#F2EFE8] px-2 rounded transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span className="text-ink-2">Awaiting Acrylic</span>
                </div>
                <span className="font-mono font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[12px]">
                  {awaitingAcrylicCount}
                </span>
              </div>

              <div
                onClick={() => navigate('/app/orders?status=In Production')}
                className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#F2EFE8] px-2 rounded transition-colors"
              >
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-sky-700" />
                  <span className="text-ink-2">In Production</span>
                </div>
                <span className="font-mono font-semibold text-sky-800 bg-sky-100 px-2 py-0.5 rounded text-[12px]">
                  {inProductionCount}
                </span>
              </div>

              <div
                onClick={() => navigate('/app/orders?status=Complete')}
                className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#F2EFE8] px-2 rounded transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span className="text-ink-2">Complete (This Month)</span>
                </div>
                <span className="font-mono font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[12px]">
                  {completeCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
