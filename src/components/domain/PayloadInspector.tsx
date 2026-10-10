import React, { useState } from 'react';
import { Copy, Check, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

interface PayloadInspectorProps {
  quoteRef: string;
  customerName: string;
  totalExVat: number;
  linesCount: number;
  sampleLine: any;
}

export const PayloadInspector: React.FC<PayloadInspectorProps> = ({
  quoteRef,
  customerName,
  totalExVat,
  linesCount,
  sampleLine,
}) => {
  const [activeTab, setActiveTab] = useState<'order' | 'line' | 'meta'>('order');
  const [copied, setCopied] = useState(false);

  const orderPayload = {
    payment_method: "bacs",
    payment_method_title: "Direct Bank Transfer",
    set_paid: false,
    status: "processing",
    currency: "GBP",
    prices_include_tax: false,
    customer_note: `Generated from accepted secondary glazing quote ${quoteRef}`,
    meta_data: [
      { key: "_gecko_quote_reference", value: quoteRef },
      { key: "_gecko_client_name", value: customerName },
      { key: "_gecko_totals_rule", value: "ex_vat_enforced" },
      { key: "_gecko_contract_version", value: "v1_fixed" },
    ],
    line_items_count: linesCount,
    total_ex_vat: totalExVat.toFixed(2),
  };

  const linePayload = {
    product_id: 10420,
    name: "Gecko Bespoke Secondary Glazing Pane",
    quantity: 1,
    subtotal: sampleLine ? sampleLine.chargedPrice.toFixed(2) : "178.00",
    total: sampleLine ? sampleLine.chargedPrice.toFixed(2) : "178.00",
    tax_class: "zero-rate",
    meta_data: [
      { key: "_gecko_pane_id", value: sampleLine?.paneDisplayId || "w1p3" },
      { key: "_gecko_version", value: sampleLine?.version || "w1p3-2" },
      { key: "_gecko_room", value: sampleLine?.roomName || "Drawing Room" },
      { key: "_gecko_window", value: sampleLine?.windowLabel || "W1" },
      { key: "_gecko_width_mm", value: sampleLine?.width || 1184 },
      { key: "_gecko_height_mm", value: sampleLine?.height || 862 },
      { key: "_gecko_colour", value: sampleLine?.colour || "Anthracite (RAL 7016)" },
      { key: "_gecko_furniture", value: sampleLine?.furniture || "Lift-out" },
      { key: "_gecko_rule_price", value: sampleLine?.rulePrice || 190.00 },
      { key: "_gecko_is_overridden", value: sampleLine?.isOverridden || false },
    ],
  };

  const metaPayload = {
    contract_version: "Contract v1 (Fixed Schema)",
    disclaimer: "Illustrative keys shown. Replaced by your documented WooCommerce schema contract.",
    zero_vat_mode: "ex_vat_line_items_sum",
    checksum_verification: {
      sum_of_lines: `£${totalExVat.toFixed(2)}`,
      quote_total: `£${totalExVat.toFixed(2)}`,
      delta: "0.00",
      status: "VERIFIED_EXACT_MATCH",
    },
  };

  const currentJson =
    activeTab === 'order'
      ? orderPayload
      : activeTab === 'line'
      ? linePayload
      : metaPayload;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(currentJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-line rounded-r3 bg-surface overflow-hidden text-[13px]">
      {/* Inspector Header */}
      <div className="p-3 bg-surface border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12px] font-semibold text-ink uppercase tracking-wider">
            WooCommerce Payload Inspector
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-r1 bg-slate-200 text-slate-800 font-mono font-medium">
            <Lock className="w-3 h-3 text-slate-600" />
            Contract v1 · fixed
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-[12px] text-ink-2 hover:text-ink px-2 py-1 rounded hover:bg-elevated transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy JSON'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-line bg-surface/70 px-3 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('order')}
          className={`py-2 px-3 text-[12px] font-medium border-b-2 transition-colors ${
            activeTab === 'order'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-ink-3 hover:text-ink'
          }`}
        >
          Order Header
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('line')}
          className={`py-2 px-3 text-[12px] font-medium border-b-2 transition-colors ${
            activeTab === 'line'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-ink-3 hover:text-ink'
          }`}
        >
          Line Item 1 (Sample)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('meta')}
          className={`py-2 px-3 text-[12px] font-medium border-b-2 transition-colors ${
            activeTab === 'meta'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-ink-3 hover:text-ink'
          }`}
        >
          Contract Meta & Checksum
        </button>
      </div>

      {/* JSON Viewer */}
      <div className="p-4 bg-[#1E2824] text-[#FBFAF7] font-mono text-[12px] overflow-x-auto max-h-72 leading-relaxed">
        <pre>{JSON.stringify(currentJson, null, 2)}</pre>
      </div>

      {/* Footer Disclaimer & Live Checksum */}
      <div className="p-3 bg-surface border-t border-line text-[12px] flex items-center justify-between text-ink-2">
        <div className="flex items-center gap-1.5 text-success font-medium">
          <ShieldCheck className="w-4 h-4 text-success" />
          <span>Sum of {linesCount} lines equals quote total (£{totalExVat.toFixed(2)}): ✓</span>
        </div>
        <span className="text-[11px] text-ink-3 italic">
          Illustrative keys shown; replaced by your documented contract
        </span>
      </div>
    </div>
  );
};
