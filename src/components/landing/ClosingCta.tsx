import React, { useState } from 'react';
import { proposalConfig } from '../../config/proposal';
import { Loader2, CheckCircle2, ArrowUp } from 'lucide-react';

export const ClosingCta: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setMessage('');
    setSubmitted(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="bg-primary text-[#F5F3EE] pt-20 pb-12 border-t border-line-strong select-none">
      <div className="max-w-6xl mx-auto px-6 space-y-16">
        {/* Headline */}
        <div className="max-w-2xl">
          <h2 className="text-[36px] md:text-[48px] font-serif-display font-normal leading-[1.08] tracking-tight">
            Let's make the next survey the last spreadsheet.
          </h2>
          <p className="text-[15px] text-[#F5F3EE]/80 mt-3 leading-relaxed">
             secondary glazing deserves a system as precise as your laser measures. Everything you saw in this prototype can be deployed into your Retool + Supabase architecture.
          </p>
        </div>

        {/* 2 Columns: Left Proposal Table / Right Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left 7 Columns: Proposal Timeline & Price Table */}
          <div className="lg:col-span-7 space-y-4">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-accent font-mono">
              PROPOSED STAGE SCOPE &amp; TIMELINE
            </span>

            <div className="border border-[#46524C] rounded-r3 overflow-hidden bg-[#253D33]">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#1D312A] text-[#F5F3EE]/60 uppercase text-[10px] font-semibold border-b border-[#46524C] tracking-wider">
                  <tr>
                    <th className="p-3">Stage</th>
                    <th className="p-3">Scope Overview</th>
                    <th className="p-3">Timeline</th>
                    <th className="p-3 text-right">Investment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#46524C]">
                  {proposalConfig.stages.map(st => (
                    <tr key={st.stageNumber} className="hover:bg-[#1D312A]/50">
                      <td className="p-3 font-semibold text-[#F5F3EE] whitespace-nowrap">
                        {st.stageNumber}
                      </td>
                      <td className="p-3 text-[#F5F3EE]/80 text-[12px] leading-snug">
                        <strong className="block text-[#F5F3EE]">{st.name}</strong>
                        {st.scope}
                      </td>
                      <td className="p-3 font-mono text-accent text-[12px] whitespace-nowrap">
                        {st.timeline}
                      </td>
                      <td className="p-3 font-mono text-right text-accent text-[12px] whitespace-nowrap">
                        {st.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-[#F5F3EE]/60 italic">
              Configured via proposal.ts — timelines and fixed prices customized to your rollout sequence.
            </p>
          </div>

          {/* Right 5 Columns: Compact Contact Form */}
          <div className="lg:col-span-5 bg-[#253D33] border border-[#46524C] rounded-r3 p-6 space-y-4 shadow-sh-2">
            <h3 className="font-serif-display text-[20px] font-medium text-[#F5F3EE]">
              Start the Build
            </h3>
            <p className="text-[13px] text-[#F5F3EE]/80">
              Send a note to confirm questions or discuss your Retool environment setup.
            </p>

            {submitted ? (
              <div className="p-5 bg-[#1D312A] border border-[#46524C] rounded-r2 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-[14px] font-medium text-[#F5F3EE]">
                  Thanks. I'll reply within one working day.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[12px] text-accent underline hover:text-accent-tint"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-[13px]">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#F5F3EE]/70 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="e.g. Shahzaib Rajpoot Khan"
                    className="w-full bg-[#1D312A] border border-[#46524C] rounded-r2 px-3 py-1.5 text-[#F5F3EE] placeholder:text-[#F5F3EE]/30 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#F5F3EE]/70 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="e.g. director@geckoglazing.co.uk"
                    className="w-full bg-[#1D312A] border border-[#46524C] rounded-r2 px-3 py-1.5 text-[#F5F3EE] placeholder:text-[#F5F3EE]/30 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#F5F3EE]/70 mb-1">
                    Message
                  </label>
                  <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="e.g. Ready to schedule a 30-min architecture call"
                    className="w-full bg-[#1D312A] border border-[#46524C] rounded-r2 px-3 py-1.5 text-[#F5F3EE] placeholder:text-[#F5F3EE]/30 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 mt-2 bg-accent text-[#1E2824] font-semibold text-[13px] rounded-r2 hover:bg-[#C29858] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-current" />
                      <span>Sending message...</span>
                    </>
                  ) : (
                    <span>Submit Inquiry</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Thin Developer Details Row */}
        <div className="pt-8 border-t border-[#46524C] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[13px] text-[#F5F3EE]/80">
          <div className="flex flex-wrap items-center gap-4">
            <strong className="text-[#F5F3EE]">{proposalConfig.developerName}</strong>
            <span>{proposalConfig.developerEmail}</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{proposalConfig.availability}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1 text-[12px] text-accent hover:underline self-start sm:self-auto"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Back to top</span>
          </button>
        </div>

        {/* Footer Honesty Strip */}
        <div className="pt-4 border-t border-[#46524C]/60 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#F5F3EE]/50 gap-2">
          <span>© 2026 Gecko Glazing Demo Prototype · All client rules and metadata schemas strictly modelled.</span>
          <span className="italic">
            Built as a design &amp; UX prototype. Final production delivery is in Retool on PostgreSQL / Supabase.
          </span>
        </div>
      </div>
    </section>
  );
};
