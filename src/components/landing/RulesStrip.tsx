import React from 'react';
import { NavLink } from 'react-router-dom';
import { Database, Lock, Code2, Tag, ShieldCheck, ArrowRight } from 'lucide-react';

export const RulesStrip: React.FC = () => {
  const rules = [
    {
      num: 'Rule 1',
      title: 'Database Owns Pricing',
      where: "Price cells show tiny 'Rule' label; resolved from rules table, never read from workbook.",
      link: '/app/intake',
      icon: Database,
    },
    {
      num: 'Rule 2',
      title: 'Ordered Panes Immutable',
      where: "Padlock glyph & 'Ordered Snapshot'; corrections create w1p3-3, previous orders never overwritten.",
      link: '/app/orders',
      icon: Lock,
    },
    {
      num: 'Rule 3',
      title: 'Metadata Contract Fixed',
      where: "Payload inspector in order step with locked 'Contract v1 · fixed' badge and checksum verification.",
      link: '/app/orders/new/QT-2026-0412',
      icon: Code2,
    },
    {
      num: 'Rule 4',
      title: 'Totals Ex-VAT, Discounts Coupons',
      where: "Quote totals strictly labelled 'ex VAT'; no manual discount fields, only WooCommerce coupons.",
      link: '/app/quotes/QT-2026-0412',
      icon: Tag,
    },
    {
      num: 'Rule 5',
      title: 'Everything Audited',
      where: "Every measurement change, override, and status flip writes to live searchable ledger with user & time.",
      link: '/app/audit',
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-16 border-t border-line bg-surface/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-accent font-mono block mb-1">
            SETTLED ARCHITECTURAL RULES
          </span>
          <h3 className="text-[24px] font-serif-display font-medium text-ink">
            Five rules from your brief — visibly enforced across the prototype.
          </h3>
        </div>

        {/* 5 Hairline-Separated Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 border border-line divide-y md:divide-y-0 md:divide-x divide-line rounded-r3 bg-surface overflow-hidden shadow-sh-1">
          {rules.map(r => {
            const Icon = r.icon;
            return (
              <NavLink
                key={r.num}
                to={r.link}
                className="p-5 flex flex-col justify-between hover:bg-primary-tint/30 transition-colors group text-[13px]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-semibold text-accent">
                      {r.num}
                    </span>
                    <Icon className="w-4 h-4 text-ink-3 group-hover:text-primary transition-colors" />
                  </div>

                  <h4 className="font-semibold text-ink text-[14px] leading-snug">
                    {r.title}
                  </h4>

                  <p className="text-[12px] text-ink-2 leading-relaxed">
                    {r.where}
                  </p>
                </div>

                <div className="pt-4 flex items-center gap-1 text-[11px] font-semibold text-primary opacity-80 group-hover:opacity-100 mt-2">
                  <span>See in demo</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>
    </section>
  );
};
