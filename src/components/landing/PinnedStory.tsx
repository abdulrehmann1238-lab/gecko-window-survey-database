import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FileSpreadsheet,
  Layers,
  Calculator,
  Lock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const PinnedStory: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(1);

  const stages = [
    {
      num: '01',
      title: 'Survey Intake & Pane Database',
      desc: 'Thousands of disconnected Excel workbooks become one searchable, relational pane database. Surveyors upload .xlsx files, correct any bad reveal dimensions inline, and commit hundreds of panes in seconds.',
      tryLink: '/app/intake',
      rule: 'Rule 1: The database owns pricing. Prices are never scraped from static Excel formulas.',
    },
    {
      num: '02',
      title: 'Quoting Engine & Customer Review',
      desc: 'Select any combination of panes across properties. Prices resolve dynamically from current catalog rules. Estimators can override lines with full audit stamps, apply synced coupons, calculate installation, and send quotes directly for customer online approval.',
      tryLink: '/app/quotes/QT-2026-0412',
      rule: 'Rule 4: Totals ex-VAT; discounts are WooCommerce coupons, not arbitrary markdown lines.',
    },
    {
      num: '03',
      title: 'Ordering & WooCommerce Order Book',
      desc: 'One click sends accepted quote lines with exact dimensions, colours, and metadata to WooCommerce. The local record is locked permanently as an immutable snapshot that production and cutting schedules can trust.',
      tryLink: '/app/orders',
      rule: 'Rule 2 & 3: Ordered panes are strictly immutable; WooCommerce metadata contracts are fixed.',
    },
    {
      num: '04',
      title: 'Testing, Tuning & Cutover',
      desc: 'Tuned with internal Gecko surveying and workshop staff. High-scale queries tested over 4,800+ panes. Legacy workbooks imported on demand without freezing production.',
      tryLink: '/app/audit',
      rule: 'Rule 5: Everything is audited. Zero unrecorded changes across all stages.',
    },
  ];

  const current = stages[activeStage - 1];

  return (
    <section id="story" className="py-20 border-t border-line">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-accent font-mono block mb-1">
            THE FOUR-STAGE PIPELINE
          </span>
          <h2 className="text-[32px] md:text-[38px] font-serif-display font-medium text-ink leading-tight">
            From fragmented spreadsheets to an unbroken digital thread.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 5 Columns: Stage Selector */}
          <div className="lg:col-span-5 space-y-4">
            {stages.map((st, idx) => {
              const isActive = activeStage === idx + 1;
              return (
                <div
                  key={st.num}
                  onClick={() => setActiveStage(idx + 1)}
                  className={`p-5 rounded-r3 border cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-surface border-line-strong shadow-sh-2'
                      : 'border-transparent hover:bg-surface/50 text-ink-3'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <span
                      className={`font-mono text-[13px] font-semibold ${
                        isActive ? 'text-accent' : 'text-ink-3'
                      }`}
                    >
                      {st.num}
                    </span>
                    <h3
                      className={`font-serif-display text-[18px] font-medium ${
                        isActive ? 'text-ink' : 'text-ink-3'
                      }`}
                    >
                      {st.title}
                    </h3>
                  </div>

                  <p
                    className={`text-[13px] leading-relaxed ${
                      isActive ? 'text-ink-2' : 'text-ink-3'
                    }`}
                  >
                    {st.desc}
                  </p>

                  {isActive && (
                    <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                      <span className="text-[11px] font-mono text-accent font-medium">
                        {st.rule.split(':')[0]}
                      </span>
                      <NavLink
                        to={st.tryLink}
                        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:underline"
                      >
                        <span>Try in workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </NavLink>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right 7 Columns: Framed Live Mini-UI Showcase */}
          <div className="lg:col-span-7 bg-surface border border-line-strong rounded-r3 p-6 shadow-sh-2 min-h-[460px] flex flex-col justify-between">
            {/* Stage 1 Mini-UI */}
            {activeStage === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-ink text-[14px]">
                      Survey Intake &amp; Inline Validation Grid
                    </span>
                  </div>
                  <span className="text-[11px] font-mono bg-primary-tint text-primary px-2 py-0.5 rounded">
                    Calloway · 38 Panes
                  </span>
                </div>

                <div className="border border-line rounded bg-elevated p-3 text-[12px] space-y-2">
                  <div className="flex items-center justify-between font-mono text-ink">
                    <span className="font-semibold">w1p3 (Drawing Room)</span>
                    <span className="text-amber-800 bg-amber-100 px-1.5 rounded">
                      Re-measured: 1,184 × 862 mm
                    </span>
                  </div>
                  <div className="text-ink-3 text-[11px]">
                    Price column: <strong className="text-ink">Resolved dynamically from catalogue</strong>
                  </div>
                </div>

                <div className="p-3 bg-[#F2EFE8] rounded text-[12px] text-ink-2 leading-relaxed">
                  "Surveyors can drop an Excel sheet, immediately see flag warnings for oversize glass, and send directly to the PostgreSQL database."
                </div>
              </div>
            )}

            {/* Stage 2 Mini-UI */}
            {activeStage === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-ink text-[14px]">
                      Quoting Engine with Version Snapshots
                    </span>
                  </div>
                  <span className="text-[11px] font-mono bg-primary-tint text-primary px-2 py-0.5 rounded">
                    QT-2026-0412 v2
                  </span>
                </div>

                <div className="p-3 bg-elevated border border-line rounded space-y-2 text-[12px]">
                  <div className="flex justify-between font-mono">
                    <span className="text-ink-2">w1p3 Anthracite Lift-out</span>
                    <span className="font-semibold text-ink">£175.00 ex VAT (Overridden)</span>
                  </div>
                  <div className="text-[11px] text-accent flex items-center gap-1 font-mono">
                    <span>▲ Stamped by Priya Raman: Client discount for pair symmetry</span>
                  </div>
                </div>

                <div className="p-3 bg-[#F2EFE8] rounded text-[12px] text-ink-2">
                  "Duplicate a draft, toggle frosted panes off, and both drafts persist with their own selection snapshot without polluting historical survey data."
                </div>
              </div>
            )}

            {/* Stage 3 Mini-UI */}
            {activeStage === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-ink text-[14px]">
                      WooCommerce Order Book &amp; Cutting Exports
                    </span>
                  </div>
                  <span className="text-[11px] font-mono bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                    Contract v1 Fixed
                  </span>
                </div>

                <div className="p-3 bg-elevated border border-line rounded space-y-2 text-[12px]">
                  <div className="flex items-center justify-between font-mono text-ink">
                    <span className="font-semibold">Order WC-10482</span>
                    <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                      🔒 Padlocked Snapshot
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-3">
                    Pane w1p3 locked at original survey version. Future survey changes create w1p3-3 without rewriting shopfloor production lines.
                  </p>
                </div>

                <div className="p-3 bg-[#F2EFE8] rounded text-[12px] text-ink-2">
                  "Ready to Cut panes generate one-click export spreadsheets for laser cutters and external acrylic batch suppliers."
                </div>
              </div>
            )}

            {/* Stage 4 Mini-UI */}
            {activeStage === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-ink text-[14px]">
                      Production Trial &amp; Cutover Checklist
                    </span>
                  </div>
                  <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    100% Audited
                  </span>
                </div>

                <div className="p-4 bg-elevated border border-line rounded space-y-2 text-[12px]">
                  <div className="flex items-center gap-2 text-success font-medium">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>End-to-end user trial with surveying &amp; shopfloor staff</span>
                  </div>
                  <div className="flex items-center gap-2 text-success font-medium">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>On-demand survey workbook import (no freeze)</span>
                  </div>
                  <div className="flex items-center gap-2 text-success font-medium">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>Performance verified on 4,812 panes</span>
                  </div>
                </div>

                <div className="p-3 bg-[#F2EFE8] rounded text-[12px] text-ink-2">
                  "Built for real craft and manufacturing teams. The density and keyboard navigation they expect, without the chaos of frozen Excel files."
                </div>
              </div>
            )}

            {/* Footer Try Button */}
            <div className="pt-4 border-t border-line flex items-center justify-between">
              <span className="text-[12px] text-ink-3 italic">
                Interactive prototype demonstrating Retool + Supabase architecture
              </span>
              <NavLink
                to={current.tryLink}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-elevated text-[13px] font-medium rounded-r2 hover:bg-primary-hover transition-colors"
              >
                <span>Launch Stage {current.num}</span>
                <ArrowRight className="w-4 h-4" />
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
