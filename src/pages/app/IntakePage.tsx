import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../mock/store';
import { HubSpotContact } from '../../data/types';
import { Button } from '../../components/ui/Button';
import { TagChip } from '../../components/ui/TagChip';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Building,
  User,
  Check,
  Search,
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

interface SurveyLine {
  id: string;
  paneId: string;
  room: string;
  window: string;
  width: number;
  height: number;
  shape: 'Rectangle' | 'Arched' | 'Angled';
  tags: string[];
  status: 'ok' | 'warning' | 'error';
  warningMessage?: string;
  originalWidth?: number;
  isEdited?: boolean;
}

export const IntakePage: React.FC = () => {
  const navigate = useNavigate();
  const { hubspotContacts, commitSurveyIntake } = useAppStore();
  const { addToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isUploading, setIsUploading] = useState(false);

  // Seeded intake survey lines (Calloway 38 lines sample)
  const [lines, setLines] = useState<SurveyLine[]>([
    {
      id: 'l1',
      paneId: 'w1p1',
      room: 'Drawing Room',
      window: 'W1',
      width: 1184,
      height: 860,
      shape: 'Rectangle',
      tags: ['3mm'],
      status: 'ok',
    },
    {
      id: 'l2',
      paneId: 'w1p2',
      room: 'Drawing Room',
      window: 'W1',
      width: 1184,
      height: 860,
      shape: 'Rectangle',
      tags: ['3mm'],
      status: 'ok',
    },
    {
      id: 'l3',
      paneId: 'w1p3',
      room: 'Drawing Room',
      window: 'W1',
      width: 1181,
      height: 860,
      shape: 'Rectangle',
      tags: ['Frosted', '3mm'],
      status: 'ok',
    },
    {
      id: 'l4',
      paneId: 'w1p4',
      room: 'Drawing Room',
      window: 'W1',
      width: 1184,
      height: 862,
      shape: 'Arched',
      tags: ['Arched'],
      status: 'ok',
    },
    {
      id: 'l5',
      paneId: 'w2p1',
      room: 'Drawing Room',
      window: 'W2',
      width: 1184,
      height: 2520, // Height > 2400 triggers warning!
      shape: 'Rectangle',
      tags: ['Frosted'],
      status: 'warning',
      warningMessage: 'Oversize height > 2,400 mm requires 2-person fitting',
    },
    {
      id: 'l6',
      paneId: 'w2p2',
      room: 'Drawing Room',
      window: 'W2',
      width: 0, // Missing width triggers error!
      height: 860,
      shape: 'Rectangle',
      tags: ['Frosted'],
      status: 'error',
      warningMessage: 'Width missing or invalid in workbook row',
    },
    // Remainder lines to complete 38 lines sample
    ...Array.from({ length: 32 }, (_, i) => ({
      id: `l_${i + 7}`,
      paneId: `w${(i % 3) + 1}p${(i % 4) + 1}`,
      room: i < 8 ? 'Dining Room' : i < 16 ? 'Library' : 'Master Bedroom',
      window: `W${(i % 2) + 1}`,
      width: 950 + (i % 5) * 40,
      height: 1400 + (i % 6) * 30,
      shape: (i === 12 ? 'Arched' : 'Rectangle') as any,
      tags: i % 3 === 0 ? ['3mm', 'Frosted'] : ['3mm'],
      status: (i === 18 ? 'warning' : 'ok') as any,
      warningMessage: i === 18 ? 'Historic masonry rebate uneven' : undefined,
    })),
  ]);

  // Selected HubSpot contact
  const [selectedContact, setSelectedContact] = useState<HubSpotContact | null>(
    hubspotContacts[0] // Eleanor Calloway preselected for convenience
  );
  const [contactSearch, setContactSearch] = useState('');
  const [propertyName, setPropertyName] = useState('14 Pelham Crescent');
  const [propertyAddress, setPropertyAddress] = useState('14 Pelham Crescent, Bath BA1 2LJ');

  // Active cell edit
  const [editingCell, setEditingCell] = useState<{ id: string; field: 'width' | 'height' | 'room' } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Commit state
  const [isCommitting, setIsCommitting] = useState(false);
  const [committedCustId, setCommittedCustId] = useState<string | null>(null);

  // Issues count
  const errorCount = lines.filter(l => l.status === 'error').length;
  const warningCount = lines.filter(l => l.status === 'warning').length;

  const handleDropSample = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setStep(2);
      addToast({
        type: 'success',
        message: 'Workbook parsed · DB Output tab verified · 38 panes loaded',
      });
    }, 700);
  };

  const handleSaveCell = (lineId: string, field: 'width' | 'height' | 'room') => {
    setLines(prev =>
      prev.map(l => {
        if (l.id === lineId) {
          const num = Number(editValue);
          if (field === 'width') {
            const newStatus = num > 100 && num <= 4000 ? (l.height > 2400 ? 'warning' : 'ok') : 'error';
            return {
              ...l,
              originalWidth: l.originalWidth || l.width,
              width: num,
              isEdited: true,
              status: newStatus,
              warningMessage: newStatus === 'error' ? 'Invalid width' : undefined,
            };
          }
          if (field === 'height') {
            const newStatus = num > 2400 ? 'warning' : num < 100 ? 'error' : 'ok';
            return {
              ...l,
              height: num,
              isEdited: true,
              status: newStatus,
              warningMessage: num > 2400 ? 'Oversize height > 2,400 mm' : undefined,
            };
          }
          if (field === 'room') {
            return { ...l, room: editValue, isEdited: true };
          }
        }
        return l;
      })
    );
    setEditingCell(null);
  };

  const handleSendToDatabase = () => {
    if (!selectedContact || errorCount > 0) return;

    setIsCommitting(true);
    setTimeout(() => {
      const newId = commitSurveyIntake(
        selectedContact,
        propertyName,
        propertyAddress,
        lines.map(l => ({
          paneId: l.paneId,
          room: l.room,
          window: l.window,
          width: l.width || 1184,
          height: l.height || 860,
          shape: l.shape,
          tags: l.tags,
        }))
      );
      setCommittedCustId(newId);
      setIsCommitting(false);
      setStep(3);
      addToast({
        type: 'success',
        message: `Survey committed. 38 panes entered under ${propertyName}.`,
      });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* 3-Step Wizard Navigation Header */}
      <div className="pb-4 border-b border-line flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-serif-display font-medium text-ink">
            Survey Intake
          </h1>
          <p className="text-[13px] text-ink-2 mt-0.5">
            Stage 1: Excel workbook intake, rule pricing validation &amp; database commit
          </p>
        </div>

        {/* Stepper Indicator */}
        <div className="flex items-center gap-6 text-[13px] font-ui">
          <div
            className={`flex items-center gap-2 pb-1 ${
              step === 1 ? 'font-semibold text-ink border-b-2 border-accent' : 'text-ink-3'
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[11px] font-mono">
              1
            </span>
            <span>Upload</span>
          </div>

          <div
            className={`flex items-center gap-2 pb-1 ${
              step === 2 ? 'font-semibold text-ink border-b-2 border-accent' : 'text-ink-3'
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[11px] font-mono">
              2
            </span>
            <span>Check lines</span>
          </div>

          <div
            className={`flex items-center gap-2 pb-1 ${
              step === 3 ? 'font-semibold text-ink border-b-2 border-accent' : 'text-ink-3'
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[11px] font-mono">
              3
            </span>
            <span>Send</span>
          </div>
        </div>
      </div>

      {/* STEP 1: UPLOAD */}
      {step === 1 && (
        <div className="max-w-2xl mx-auto py-8 space-y-6">
          <div
            onClick={handleDropSample}
            className={`border-2 border-dashed rounded-r3 h-72 flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-200 ${
              isUploading
                ? 'border-primary bg-primary-tint/50'
                : 'border-line-strong hover:border-primary hover:bg-[#F2EFE8] bg-surface'
            }`}
          >
            <FileSpreadsheet className="w-12 h-12 text-primary/70 mb-3" />
            <span className="text-[16px] font-medium text-ink">
              Drop a survey workbook here
            </span>
            <span className="text-[13px] text-ink-3 mt-1">
              or browse (.xlsx format)
            </span>

            {isUploading && (
              <div className="w-48 mt-4">
                <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                  <div className="h-full bg-accent animate-pulse w-full" />
                </div>
                <span className="text-[11px] text-ink-3 mt-1 block">
                  Parsing workbook tabs...
                </span>
              </div>
            )}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleDropSample}
              className="text-[13px] text-primary hover:underline font-medium inline-flex items-center gap-1.5"
            >
              <span>Use sample survey (Calloway, 38 panes)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CHECK LINES GRID & HUBSPOT CUSTOMER */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Rules Banner (Settled Rule 1) */}
          <div className="p-3 bg-surface border-l-4 border-l-primary border border-line rounded-r2 text-[13px] flex items-center justify-between text-ink-2">
            <div>
              <strong className="text-ink">Settled Rule 1 enforced:</strong> Prices are not read from the workbook. The database prices every pane from current rules upon commit.
            </div>
            <span className="text-[11px] font-mono bg-elevated px-2 py-0.5 rounded border border-line text-ink-3">
              No price column in survey
            </span>
          </div>

          {/* Sticky summary bar */}
          <div className="p-3 bg-elevated border border-line rounded-r3 flex items-center justify-between shadow-sh-1">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-ink text-[14px]">
                {lines.length} lines to enter
              </span>
              {errorCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-[12px] text-error font-medium bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5 text-error" />
                  {errorCount} error (must fix before commit)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[12px] text-success font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  All critical dimensions valid
                </span>
              )}
              {warningCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[12px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  {warningCount} flagged warnings
                </span>
              )}
            </div>

            <Button
              variant="primary"
              size="md"
              disabled={errorCount > 0 || !selectedContact}
              onClick={handleSendToDatabase}
              isLoading={isCommitting}
            >
              Send to database ({lines.length} panes)
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Columns: Editable Grid */}
            <div className="lg:col-span-8 border border-line rounded-r3 bg-surface overflow-hidden shadow-sh-1">
              <div className="overflow-x-auto max-h-[520px]">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-surface text-ink-3 uppercase text-[10px] font-semibold border-b border-line sticky top-0 z-10">
                    <tr>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Pane ID</th>
                      <th className="p-2.5">Room</th>
                      <th className="p-2.5">Window</th>
                      <th className="p-2.5">Width (mm)</th>
                      <th className="p-2.5">Height (mm)</th>
                      <th className="p-2.5">Shape / Tags</th>
                      <th className="p-2.5">Product Hint</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line bg-elevated">
                    {lines.map(line => {
                      const isRowError = line.status === 'error';
                      const isRowWarn = line.status === 'warning';

                      return (
                        <tr
                          key={line.id}
                          className={`hover:bg-[#F2EFE8] transition-colors ${
                            isRowError
                              ? 'border-l-4 border-l-error bg-red-50/20'
                              : isRowWarn
                              ? 'border-l-4 border-l-amber-500 bg-amber-50/20'
                              : ''
                          }`}
                        >
                          <td className="p-2.5">
                            {isRowError && (
                              <span title={line.warningMessage}>
                                <AlertCircle className="w-4 h-4 text-error" />
                              </span>
                            )}
                            {isRowWarn && (
                              <span title={line.warningMessage}>
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                              </span>
                            )}
                            {line.status === 'ok' && (
                              <CheckCircle2 className="w-4 h-4 text-success" />
                            )}
                          </td>

                          <td className="p-2.5 font-mono font-semibold text-ink">
                            {line.paneId}
                          </td>

                          {/* Editable Room */}
                          <td
                            className="p-2.5 text-ink-2 cursor-pointer hover:bg-surface"
                            onClick={() => {
                              setEditingCell({ id: line.id, field: 'room' });
                              setEditValue(line.room);
                            }}
                          >
                            {editingCell?.id === line.id && editingCell?.field === 'room' ? (
                              <input
                                autoFocus
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={() => handleSaveCell(line.id, 'room')}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleSaveCell(line.id, 'room');
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                className="w-24 bg-surface border border-accent rounded px-1.5 py-0.5 text-[12px] text-ink focus:outline-none"
                              />
                            ) : (
                              <span>{line.room}</span>
                            )}
                          </td>

                          <td className="p-2.5 text-ink-3 font-mono">{line.window}</td>

                          {/* Editable Width (Click to edit inline cell) */}
                          <td
                            className={`p-2.5 font-mono cursor-pointer hover:bg-surface relative ${
                              line.width === 0 ? 'text-error font-semibold underline' : 'text-ink'
                            }`}
                            onClick={() => {
                              setEditingCell({ id: line.id, field: 'width' });
                              setEditValue(String(line.width || ''));
                            }}
                          >
                            {editingCell?.id === line.id && editingCell?.field === 'width' ? (
                              <input
                                autoFocus
                                type="number"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={() => handleSaveCell(line.id, 'width')}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleSaveCell(line.id, 'width');
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                className="w-20 bg-surface border border-accent rounded px-1.5 py-0.5 text-[12px] text-ink focus:outline-none"
                              />
                            ) : (
                              <div className="flex items-center gap-1">
                                <span>{line.width || 'Fix width'}</span>
                                {line.isEdited && (
                                  <span className="w-1.5 h-1.5 bg-accent rounded-full" title={`Edited before commit (was ${line.originalWidth})`} />
                                )}
                              </div>
                            )}
                          </td>

                          {/* Editable Height */}
                          <td
                            className="p-2.5 font-mono text-ink cursor-pointer hover:bg-surface"
                            onClick={() => {
                              setEditingCell({ id: line.id, field: 'height' });
                              setEditValue(String(line.height));
                            }}
                          >
                            {editingCell?.id === line.id && editingCell?.field === 'height' ? (
                              <input
                                autoFocus
                                type="number"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={() => handleSaveCell(line.id, 'height')}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleSaveCell(line.id, 'height');
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                className="w-20 bg-surface border border-accent rounded px-1.5 py-0.5 text-[12px] text-ink focus:outline-none"
                              />
                            ) : (
                              <span>{line.height}</span>
                            )}
                          </td>

                          <td className="p-2.5">
                            <div className="flex flex-wrap gap-1">
                              {line.tags.map(t => (
                                <TagChip key={t} label={t} />
                              ))}
                            </div>
                          </td>

                          <td className="p-2.5 text-ink-3 italic text-[11px]">
                            Resolved on commit
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right 4 Columns: HubSpot Customer & Property Block */}
            <div className="lg:col-span-4 space-y-4">
              <div className="border border-line rounded-r3 bg-surface p-4 shadow-sh-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-ink text-[14px]">
                    Customer &amp; Property Sync
                  </h3>
                  <span className="text-[11px] font-mono text-primary font-medium bg-primary-tint px-1.5 py-0.5 rounded">
                    HubSpot Sync
                  </span>
                </div>

                {/* HubSpot Search Combobox */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-2 mb-1">
                    Select Customer
                  </label>
                  <select
                    value={selectedContact?.id || ''}
                    onChange={e => {
                      const found = hubspotContacts.find(c => c.id === e.target.value);
                      if (found) {
                        setSelectedContact(found);
                        setPropertyName(found.addressLine1);
                        setPropertyAddress(`${found.addressLine1}, ${found.city} ${found.postcode}`);
                      }
                    }}
                    className="w-full bg-elevated border border-line-strong rounded-r2 px-3 py-1.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {hubspotContacts.slice(0, 15).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id}) · {c.city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Property Card */}
                {selectedContact && (
                  <div className="p-3 bg-elevated border border-line rounded-r2 space-y-2 text-[12px]">
                    <div className="flex items-center justify-between text-ink font-semibold">
                      <span>{selectedContact.name}</span>
                      <span className="font-mono text-ink-3 text-[11px]">{selectedContact.id}</span>
                    </div>
                    <p className="text-ink-2">{selectedContact.company}</p>

                    <div className="pt-2 border-t border-line">
                      <span className="block text-[11px] uppercase text-ink-3 mb-1">
                        Assigned Property
                      </span>
                      <input
                        type="text"
                        value={propertyName}
                        onChange={e => setPropertyName(e.target.value)}
                        className="w-full bg-surface border border-line rounded px-2 py-1 text-[13px] font-medium text-ink mb-1"
                      />
                      <p className="text-ink-3 text-[11px]">{propertyAddress}</p>
                    </div>

                    <p className="text-[11px] text-primary italic pt-1">
                      ✓ Address pre-filled from HubSpot contact record
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SEND CONFIRMATION */}
      {step === 3 && (
        <div className="max-w-xl mx-auto py-10 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          <h2 className="text-[24px] font-serif-display font-medium text-ink">
            Survey Committed to Database
          </h2>

          <p className="text-[14px] text-ink-2">
            38 bespoke panes successfully priced from rules and stored under{' '}
            <strong className="text-ink">{propertyName}</strong> for{' '}
            <strong className="text-ink">{selectedContact?.name}</strong>.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setStep(1);
                setCommittedCustId(null);
              }}
            >
              Upload another survey
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/app/customers/${committedCustId || 'cust_calloway'}`)}
            >
              Open customer view
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
