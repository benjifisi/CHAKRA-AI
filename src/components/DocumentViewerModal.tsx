import React from 'react';
import { useKnowledge } from '../context/KnowledgeContext';
import { CanvasPDFViewer } from './CanvasPDFViewer';
import { InteractiveDrawingViewer } from './InteractiveDrawingViewer';
import { 
  X, 
  FileText, 
  ShieldCheck, 
  Printer, 
  Download, 
  ExternalLink,
  Lock,
  AlertTriangle,
  FileCheck2,
  Layers,
  Sparkles
} from 'lucide-react';

interface DocumentViewerModalProps {
  documentId?: string | null;
  onClose?: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  documentId: propDocId,
  onClose: propOnClose,
}) => {
  const { viewerState, closeDocumentViewer, sopList } = useKnowledge();

  const isOpen = viewerState.isOpen || Boolean(propDocId);
  const handleClose = () => {
    if (propOnClose) propOnClose();
    closeDocumentViewer();
  };

  if (!isOpen) return null;

  const docId = viewerState.docId || propDocId;
  const isFilePreview = Boolean(viewerState.fileUrl);
  const isPdf = viewerState.fileUrl?.toLowerCase().endsWith('.pdf') || viewerState.fileType === 'pdf';
  const isImage = viewerState.fileUrl?.toLowerCase().endsWith('.png') || viewerState.fileUrl?.toLowerCase().endsWith('.jpg') || viewerState.fileType === 'image';

  // Find SOP if docId is present
  const sop = docId ? (sopList.find((s) => s.id === docId || (s.docNumber && s.docNumber.toLowerCase().includes(String(docId).toLowerCase()))) || sopList[0]) : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        
        {/* Modal Top Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-teal-950/80 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-teal-300">
                  {isFilePreview ? viewerState.fileName : (sop?.docNumber || 'TECHNICAL DOC')}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-700/50 font-mono">
                  {isFilePreview ? (isPdf ? 'PDF / CONTROLLED' : isImage ? 'P&ID DIAGRAM' : 'FILE') : sop?.revision}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-medium">
                  {isFilePreview ? 'OFFICIAL CONTROLLED ASSET' : (sop?.status || 'APPROVED & ACTIVE')}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1 truncate">
                {isFilePreview ? (viewerState.title || viewerState.fileName) : sop?.title}
              </h3>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {viewerState.fileUrl && (
              <a
                href={viewerState.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                title="Open in new window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open New Tab</span>
              </a>
            )}

            {viewerState.fileUrl && (
              <a
                href={viewerState.fileUrl}
                download
                className="px-3 py-1.5 rounded-lg bg-teal-950/80 hover:bg-teal-900 text-teal-300 text-xs font-medium flex items-center gap-1.5 transition-colors border border-teal-700/60"
                title="Download local copy"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </a>
            )}

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Print Controlled Copy"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 flex items-center justify-center transition-colors border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6 text-slate-200 text-xs leading-relaxed flex-1">
          
          {/* Official Letterhead */}
          <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400">
            <div>
              <div className="font-bold text-slate-200 uppercase tracking-wider text-xs">
                PT Chandra Asri Pacific Tbk · CHAKRA
              </div>
              <div>Operations & Process Safety Engineering Division</div>
              <div>Cilegon Petrochemical Complex, Banten, Indonesia</div>
            </div>

            <div className="text-right space-y-0.5 font-mono text-[10px]">
              <div>Classification: <strong className="text-amber-400">CONFIDENTIAL / CONTROLLED</strong></div>
              <div>Platform: <strong className="text-teal-400">CHAKRA Knowledge Platform</strong></div>
            </div>
          </div>

          {/* CASE 1: File URL is present (PDF / Image / Diagram) */}
          {isFilePreview && viewerState.fileUrl && (
            <div className="space-y-4">
              {isPdf && (
                <CanvasPDFViewer
                  fileUrl={viewerState.fileUrl}
                  fileName={viewerState.fileName || 'Authentic_Document.pdf'}
                  title={viewerState.title || viewerState.fileName || 'Authentic Technical Document'}
                />
              )}

              {isImage && (
                <InteractiveDrawingViewer
                  imageUrl={viewerState.fileUrl}
                  fileName={viewerState.fileName || 'Engineering_Drawing.png'}
                  title={viewerState.title || viewerState.fileName || 'P&ID Blueprint Diagram'}
                />
              )}

              {!isPdf && !isImage && (
                <div className="p-8 text-center space-y-4 bg-slate-950/80 rounded-xl border border-slate-800">
                  <FileText className="w-12 h-12 text-teal-400 mx-auto" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{viewerState.fileName}</h4>
                    <p className="text-xs text-slate-400 mt-1">This file format can be downloaded or opened directly.</p>
                  </div>
                  <a
                    href={viewerState.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {viewerState.fileName}</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* CASE 2: SOP Document View */}
          {!isFilePreview && sop && (
            <div className="space-y-6">
              {/* Document Summary */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-2">
                <h4 className="font-bold text-teal-300 uppercase tracking-wider text-[11px]">
                  1.0 Purpose & Operational Scope
                </h4>
                <p className="text-slate-300 leading-relaxed">{sop.summary}</p>
              </div>

              {/* Safety & PPE Notice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-rose-950/20 border border-rose-500/30 rounded-lg p-3.5 space-y-1.5">
                  <h5 className="font-bold text-rose-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Mandatory PPE Requirements</span>
                  </h5>
                  <ul className="space-y-1 text-slate-300 pl-4 list-disc marker:text-rose-400">
                    {sop.mandatoryPPE.map((ppe, i) => (
                      <li key={i}>{ppe}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-lg p-3.5 space-y-1.5">
                  <h5 className="font-bold text-cyan-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Target Equipment & Work Permits</span>
                  </h5>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {sop.targetEquipment.map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-[10px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Permits: {sop.permitsRequired.join(' · ')}
                  </div>
                </div>
              </div>

              {/* Step-by-Step Procedure */}
              <div className="space-y-3">
                <h4 className="font-bold text-teal-300 uppercase tracking-wider text-[11px]">
                  2.0 Standard Execution Protocol
                </h4>

                <div className="space-y-2.5">
                  {sop.steps.map((st) => (
                    <div
                      key={st.stepNumber}
                      className={`p-3.5 rounded-lg border ${
                        st.stepNumber === 3
                          ? 'bg-teal-950/40 border-teal-500/60 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-teal-400 text-xs">
                          Step {st.stepNumber}: {st.phase}
                        </span>
                        {st.stepNumber === 3 && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-teal-900 text-teal-200 border border-teal-700 font-bold">
                            ★ Highlighted Clause in AI Answer
                          </span>
                        )}
                      </div>
                      <p className="text-slate-200 leading-relaxed font-medium">{st.action}</p>
                      {st.cautionNote && (
                        <div className="mt-2 text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-500/30">
                          <strong>CAUTION:</strong> {st.cautionNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tacit Knowledge Additions */}
              {sop.tacitAdditions && sop.tacitAdditions.length > 0 && (
                <div className="bg-teal-950/20 border border-teal-500/30 rounded-lg p-4 space-y-2">
                  <h4 className="font-bold text-teal-300 uppercase tracking-wider text-[11px]">
                    3.0 Codified Field Tacit Insights (Shift Lessons Learned)
                  </h4>
                  <ul className="space-y-1.5 pl-4 list-disc marker:text-teal-400 text-slate-300">
                    {sop.tacitAdditions.map((t, idx) => (
                      <li key={idx} className="italic">{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Formal Approval Sign-off Box */}
              <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-6 text-[11px] text-slate-400">
                <div>
                  <div className="text-slate-500 uppercase text-[10px] font-mono">Prepared & Verified By</div>
                  <div className="font-bold text-slate-200 mt-1">Lead Process Engineer</div>
                  <div className="text-emerald-400">Digital Signature Validated ✓</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 uppercase text-[10px] font-mono">Approved By</div>
                  <div className="font-bold text-slate-200 mt-1">{sop.approvedBy}</div>
                  <div className="text-emerald-400">Management of Change (MOC) Cleared ✓</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
