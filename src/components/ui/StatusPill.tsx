import React from 'react';
import { ProductionStatus } from '../../data/types';
import { Scissors, Clock, PackageCheck, Cog, CheckCircle2 } from 'lucide-react';

interface StatusPillProps {
  status: ProductionStatus;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'Ready to Cut':
      return (
        <span className={`status-pill status-ready-to-cut border border-slate-300 ${className}`}>
          <Scissors className="w-3 h-3 text-slate-600" />
          <span>Ready to Cut</span>
        </span>
      );
    case 'Awaiting Acrylic':
      return (
        <span className={`status-pill status-awaiting-acrylic border border-amber-300 ${className}`}>
          <Clock className="w-3 h-3 text-amber-700" />
          <span>Awaiting Acrylic</span>
        </span>
      );
    case 'Acrylic Received':
      return (
        <span className={`status-pill status-acrylic-received border border-[#D5C2A5] ${className}`}>
          <PackageCheck className="w-3 h-3 text-amber-900" />
          <span>Acrylic Received</span>
        </span>
      );
    case 'In Production':
      return (
        <span className={`status-pill status-in-production border border-sky-300 ${className}`}>
          <Cog className="w-3 h-3 text-sky-700 animate-spin" style={{ animationDuration: '6s' }} />
          <span>In Production</span>
        </span>
      );
    case 'Complete':
      return (
        <span className={`status-pill status-complete border border-emerald-300 ${className}`}>
          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
          <span>Complete</span>
        </span>
      );
    default:
      return (
        <span className={`status-pill bg-gray-100 text-gray-800 border border-gray-200 ${className}`}>
          {status}
        </span>
      );
  }
};
