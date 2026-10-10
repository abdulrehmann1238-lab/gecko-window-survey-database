import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { HeroScene } from '../components/landing/HeroScene';
import { PinnedStory } from '../components/landing/PinnedStory';
import { RulesStrip } from '../components/landing/RulesStrip';
import { ClosingCta } from '../components/landing/ClosingCta';
import { Loader } from '../components/landing/Loader';
import { ArrowRight, Play, Database, ShieldCheck, Zap } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showLoader, setShowLoader] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-bg text-ink font-ui antialiased selection:bg-accent-tint">
      {/* Initial Measurement Loader */}
      {showLoader && <Loader onComplete={() => setShowLoader(false)} />}

      {/* Sticky Navigation (64px) */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 h-16 transition-all duration-160 flex items-center justify-between px-6 md:px-12 ${
          isScrolled
            ? 'bg-bg/95 backdrop-blur-[2px] border-b border-line shadow-sh-1'
            : 'bg-transparent'
        }`}
      >
        {/* Left: Wordmark */}
        <NavLink to="/" className="flex items-center gap-2">
          <span className="font-serif-display font-medium text-[22px] text-primary tracking-tight">
            Gecko Glazing
          </span>
        </NavLink>

        {/* Centre Links */}
        <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-ink-2">
          <a href="#story" className="hover:text-ink transition-colors">
            Pipeline
          </a>
          <NavLink to="/app/customers" className="hover:text-ink transition-colors">
            Pane database
          </NavLink>
          <NavLink to="/app/quotes/QT-2026-0412" className="hover:text-ink transition-colors">
            Quoting
          </NavLink>
          <NavLink to="/app/orders" className="hover:text-ink transition-colors">
            Order book
          </NavLink>
        </div>

        {/* Right CTA */}
        <button
          type="button"
          onClick={() => navigate('/app')}
          className="h-10 px-5 rounded-r2 bg-primary text-elevated text-[14px] font-medium hover:bg-primary-hover active:bg-primary-active transition-all duration-120 flex items-center gap-2 group cursor-pointer shadow-sh-1"
        >
          <span>Enter workspace</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-28 md:pt-36 pb-16 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left 5 Columns: Copy */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-accent font-mono block">
              SURVEY · QUOTE · ORDER
            </span>

            <h1 className="text-[38px] md:text-[52px] font-serif-display font-normal text-ink leading-[1.08] tracking-tight">
              Every pane, measured once. Priced, ordered and traced from the same record.
            </h1>

            <p className="text-[15px] md:text-[16px] text-ink-2 leading-relaxed">
              Thousands of survey workbooks become one searchable pane database, a quoting engine that always uses today's prices, and an order book that can never be rewritten.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate('/app')}
                className="h-12 px-6 rounded-r2 bg-primary text-elevated text-[15px] font-medium hover:bg-primary-hover active:bg-primary-active transition-all duration-120 flex items-center gap-2.5 group cursor-pointer shadow-sh-2"
              >
                <span>Enter the workspace</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#story"
                className="h-12 px-5 rounded-r2 bg-surface border border-line-strong text-ink text-[14px] font-medium hover:bg-[#F2EFE8] transition-colors flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 text-accent fill-accent" />
                <span>Watch the pipeline run</span>
              </a>
            </div>

            {/* Hairline Row of 3 Mono Facts */}
            <div className="pt-6 border-t border-line flex items-center justify-between text-[12px] font-mono text-ink-2">
              <div>
                <strong className="text-ink font-semibold">4,812</strong> panes in demo
              </div>
              <span className="text-line-strong">·</span>
              <div>
                <strong className="text-ink font-semibold">4</strong> live stages
              </div>
              <span className="text-line-strong">·</span>
              <div>
                <strong className="text-ink font-semibold">0</strong> re-keyed values
              </div>
            </div>
          </div>

          {/* Right 7 Columns: Live Architectural Sash Window SVG Scene */}
          <div className="lg:col-span-7">
            <HeroScene />
          </div>
        </div>

        {/* Scroll Cue */}
        <div className="mt-12 flex items-center gap-3 text-[11px] font-mono text-ink-3">
          <div className="w-[1px] h-10 bg-line-strong relative overflow-visible">
            <div className="w-1.5 h-1.5 rounded-full bg-accent absolute left-[-2px] animate-bounce" />
          </div>
          <span>Scroll to explore architecture</span>
        </div>
      </section>

      {/* Counters Strip: Scale Proof */}
      <section className="py-12 border-y border-line bg-surface">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-1">
            <span className="font-serif-display text-[32px] text-primary font-medium">
              Thousands of workbooks
            </span>
            <span className="block text-[13px] text-ink-2 font-mono">
              → Consolidated into 1 relational database
            </span>
          </div>

          <div className="space-y-1">
            <span className="font-serif-display text-[32px] text-primary font-medium">
              4,812 Bespoke Panes
            </span>
            <span className="block text-[13px] text-ink-2 font-mono">
              Indexed live with sub-100ms facets
            </span>
          </div>

          <div className="space-y-1">
            <span className="font-serif-display text-[32px] text-primary font-medium">
              0 Overwritten Orders
            </span>
            <span className="block text-[13px] text-ink-2 font-mono">
              Guaranteed by immutable snapshots
            </span>
          </div>
        </div>
      </section>

      {/* Four-Stage Story Section */}
      <PinnedStory />

      {/* Settled Architectural Rules Strip */}
      <RulesStrip />

      {/* Closing Proposal Section & Footer */}
      <ClosingCta />
    </div>
  );
};
