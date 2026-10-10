import React, { useState } from 'react';
import { useAppStore } from '../../mock/store';
import { useNavigate } from 'react-router-dom';
import { Compass, RotateCcw, CheckCircle, ChevronRight, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';

export const DemoGuide: React.FC = () => {
  const navigate = useNavigate();
  const {
    demoSettings,
    setDemoStep,
    toggleDemoSetting,
    resetAllDemoState,
    simulateOmsIncomingUpdate,
    allPanes,
  } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Hero Sash Measurement',
      desc: 'Watch the live architectural SVG draw and calculate prices',
      link: '/',
    },
    {
      num: 2,
      title: 'Four-Stage Pipeline Story',
      desc: 'Review the 4 stages and 5 settled architectural rules',
      link: '/#story',
    },
    {
      num: 3,
      title: 'Home Action & Quotes Queue',
      desc: 'Review quotes awaiting reply & workshop production status',
      link: '/app',
    },
    {
      num: 4,
      title: 'Calloway Survey & Room Selection',
      desc: 'Expand 4-level accordion & tick a whole room for running total',
      link: '/app/customers/cust_calloway',
    },
    {
      num: 5,
      title: 'Pane Drawer & Lineage Diff',
      desc: 'Inspect w1p3 vs w1p3-2 version history and immutable order link',
      link: '/app/customers/cust_calloway',
      action: () => {
        // Automatically open w1p3 drawer for demo
        useAppStore.getState().openPaneDrawer('pane_cal_w1p3');
      },
    },
    {
      num: 6,
      title: 'Quote Builder & Audited Override',
      desc: 'Toggle Frosted off, override price, apply HERITAGE10 coupon, send',
      link: '/app/quotes/QT-2026-0412',
    },
    {
      num: 7,
      title: 'Customer View & WooCommerce Push',
      desc: 'Accept quote as customer -> Home queue updates -> Create order push',
      link: '/customer-view/QT-2026-0412',
    },
  ];

  const handleStepClick = (step: typeof steps[0]) => {
    setDemoStep(step.num);
    navigate(step.link);
    if (step.action) {
      setTimeout(step.action, 150);
    }
    setIsOpen(false);
  };

  const handleSimulateOms = () => {
    simulateOmsIncomingUpdate('op_cal_w1p1', 'In Production');
  };

  return (
    <>
      {/* Floating Demo Guide Pill in Bottom Left */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 px-3 rounded-full bg-elevated border border-accent/40 shadow-sh-2 text-ink flex items-center gap-2 text-[12px] font-medium font-ui hover:border-accent hover:shadow-sh-3 transition-all duration-120 group select-none"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>Demo Path {demoSettings.currentDemoStep}/7</span>
          <Compass className="w-3.5 h-3.5 text-accent group-hover:rotate-45 transition-transform duration-200" />
        </button>
      </div>

      {/* Guide Popover Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-start sm:justify-start p-4 sm:p-6 pointer-events-none">
          <div
            className="fixed inset-0 bg-[#1E2824]/20 pointer-events-auto"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-md bg-elevated border border-line-strong rounded-r3 shadow-sh-3 p-5 pointer-events-auto z-10 text-[13px] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-ink text-[14px]">
                  Guided Demo Journey (7 Steps)
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-ink-3 hover:text-ink text-[16px]"
              >
                ×
              </button>
            </div>

            <p className="text-[12px] text-ink-2 py-2">
              Follow this 2-minute walkthrough to experience Gecko Glazing's full survey → quote → order pipeline.
            </p>

            {/* 7 Steps List */}
            <div className="space-y-1.5 py-2">
              {steps.map(s => {
                const isCurrent = demoSettings.currentDemoStep === s.num;
                return (
                  <div
                    key={s.num}
                    onClick={() => handleStepClick(s)}
                    className={`p-2.5 rounded-r2 border cursor-pointer transition-all duration-120 flex items-start gap-2.5 ${
                      isCurrent
                        ? 'border-accent bg-accent-tint/30 text-ink'
                        : 'border-line hover:border-line-strong hover:bg-surface text-ink-2'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono shrink-0 font-semibold ${
                        isCurrent ? 'bg-accent text-elevated' : 'bg-surface text-ink-3'
                      }`}
                    >
                      {s.num}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-[13px] text-ink flex items-center justify-between">
                        <span>{s.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-ink-3" />
                      </div>
                      <p className="text-[11px] text-ink-3 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Simulation Controls & Failures */}
            <div className="mt-3 pt-3 border-t border-line space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-3 block">
                Simulation Controls
              </span>

              <div className="flex flex-col gap-1.5 text-[12px]">
                <label className="flex items-center justify-between p-2 rounded bg-surface border border-line cursor-pointer">
                  <span className="text-ink-2">Simulate WooCommerce Push Error</span>
                  <input
                    type="checkbox"
                    checked={demoSettings.simulateWooCommerceError}
                    onChange={() => toggleDemoSetting('simulateWooCommerceError')}
                    className="accent-primary"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleSimulateOms}
                  className="p-2 text-left rounded bg-surface border border-line hover:border-ink-3 text-ink-2 flex items-center justify-between"
                >
                  <span>Simulate incoming OMS update</span>
                  <span className="text-[11px] text-accent font-mono font-medium">Trigger</span>
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
              <span className="text-[11px] text-ink-3">Password hint: <code className="font-mono text-accent">gecko</code></span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  resetAllDemoState();
                  setIsOpen(false);
                  navigate('/app');
                }}
                className="text-error hover:bg-red-50 text-[12px] gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset demo state
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
