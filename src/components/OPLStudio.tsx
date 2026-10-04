import React, { useState } from 'react';
import { OnePointLesson, PlantUnit } from '../data/plantData';
import { OPL_PDF_MAP } from '../data/caliberRealData';
import { useKnowledge } from '../context/KnowledgeContext';
import { 
  Sparkles, 
  ThumbsUp, 
  UserCheck, 
  PlusCircle, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  Layers,
  Award,
  Send,
  Sliders,
  FileText,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Stamp,
  User,
  MessageSquare,
  FileCheck,
  BadgeCheck
} from 'lucide-react';

interface OPLStudioProps {
  selectedUnit: PlantUnit;
  onDeployToExecutionGuard?: (opl: OnePointLesson) => void;
}

export const OPLStudio: React.FC<OPLStudioProps> = ({ 
  selectedUnit,
  onDeployToExecutionGuard,
}) => {
  const { oplList, verifyOPL, rejectOPL, addOPL, openDocumentViewer } = useKnowledge();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'REJECTED'>('ALL');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(oplList[0]?.id || 'opl-ga-1201a-01');

  // Peer-Verification Sign-off Modal State
  const [showSignOffModal, setShowSignOffModal] = useState(false);
  const [verifierName, setVerifierName] = useState('Wahyu Setiadi, ST (Lead Reliability Specialist)');
  const [verifierRole, setVerifierRole] = useState('Senior Lead Asset Integrity & Reliability Engineer (19 yrs)');
  const [verifierComment, setVerifierComment] = useState('Verified against P&ID setpoints, field operating envelope, and SIS interlock voting logic. Approved for standard shift execution.');
  const [safetyScore, setSafetyScore] = useState(5);
  const [checkPsmCompliant, setCheckPsmCompliant] = useState(true);
  const [checkLimitsRespected, setCheckLimitsRespected] = useState(true);
  const [checkTestedInField, setCheckTestedInField] = useState(true);

  // New Tacit Knowledge Capture Form State
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [rawNotes, setRawNotes] = useState('');
  const [authorName, setAuthorName] = useState('Sugeng Riyadi');
  const [authorRole, setAuthorRole] = useState('Shift Specialist, Olefins & LLDPE (21 yrs)');
  const [equipmentTag, setEquipmentTag] = useState('GA-1201A');
  const [converting, setConverting] = useState(false);

  // Filter lessons by category and verification status
  const filteredLessons = oplList.filter((l) => {
    const matchesCategory = activeCategory === 'ALL' || l.category === activeCategory;
    const status = l.verificationStatus || 'VERIFIED';
    const matchesVerification = 
      verificationFilter === 'ALL' ? true :
      verificationFilter === 'VERIFIED' ? status === 'VERIFIED' :
      verificationFilter === 'PENDING' ? status === 'PENDING_REVIEW' :
      status === 'REJECTED';
    return matchesCategory && matchesVerification;
  });

  const activeLesson =
    oplList.find((l) => l.id === selectedLessonId) || filteredLessons[0] || oplList[0];

  const verifiedCount = oplList.filter((l) => (l.verificationStatus || 'VERIFIED') === 'VERIFIED').length;
  const pendingCount = oplList.filter((l) => l.verificationStatus === 'PENDING_REVIEW').length;
  const rejectedCount = oplList.filter((l) => l.verificationStatus === 'REJECTED').length;

  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Upvotes are maintained locally or via context
  };

  const handleConfirmSignOff = () => {
    if (!activeLesson) return;
    verifyOPL(
      activeLesson.id,
      verifierName,
      verifierRole,
      verifierComment,
      safetyScore
    );
    setShowSignOffModal(false);
  };

  const handleConfirmReject = () => {
    if (!activeLesson) return;
    rejectOPL(
      activeLesson.id,
      verifierComment || 'Safety review flagged potential inconsistency with DCS trip limits. Revision requested.'
    );
    setShowSignOffModal(false);
  };

  const handleConvertTacitToOPL = async () => {
    if (!rawNotes.trim()) return;

    setConverting(true);
    try {
      const res = await fetch('/api/tacit-to-opl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawNotes,
          author: authorName,
          plantArea: selectedUnit.name,
          equipmentCategory: 'Rotating Equipment',
        }),
      });

      const data = await res.json();
      const generatedOpl = data.opl;

      const newEntry: OnePointLesson = {
        id: `opl-${Date.now()}`,
        oplNumber: `OPL-2026-${Math.floor(Math.random() * 800 + 100)}`,
        title: generatedOpl.title || 'Field Practice: Lineup & Bleed Protocol',
        unitId: selectedUnit.id,
        category: (generatedOpl.category as any) || 'Basic Operation',
        equipmentTag,
        authorName,
        authorRole,
        experienceYears: 21,
        publishedDate: new Date().toISOString().split('T')[0],
        verificationStatus: 'PENDING_REVIEW', // Enters Peer-Verification Queue
        verifiedBy: 'Pending Senior Peer Sign-off',
        goldenRule: generatedOpl.keyRule || 'Always purge before starting.',
        practicalTip: Array.isArray(generatedOpl.stepByStepGuidance)
          ? generatedOpl.stepByStepGuidance.join(' ')
          : rawNotes,
        visualCheckNote: Array.isArray(generatedOpl.checkPoints)
          ? generatedOpl.checkPoints.join(' · ')
          : 'Check pressure transmitter and level gauge.',
        consequencesOfOmission:
          generatedOpl.consequencesOfNonCompliance ||
          'Equipment damage, unexpected tripping, and process safety breach.',
        upvotes: 1,
      };

      addOPL(newEntry);
      setSelectedLessonId(newEntry.id);
      setShowCaptureModal(false);
      setRawNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-gradient-to-b from-amber-950/60 to-slate-950 border-2 border-amber-500/60 shadow-xl shadow-amber-950/40 flex items-center justify-center p-1">
                <img 
                  src="/mascots/mascot-idea-opl.png" 
                  alt="CHAKRA OPL Idea Mascot" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-mono font-bold uppercase tracking-wider shadow">
                TACIT
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>TACIT KNOWLEDGE CAPTURE & SENIOR PEER-VERIFICATION WORKFLOW</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                SME Tacit Knowledge & One Point Lessons (OPL) Studio
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Transforms unwritten field heuristics into structured, peer-verified 5-minute modules. Senior engineers sign off on submitted tacit wisdom to guarantee that every rule conforms with Process Safety Management (PSM Level 4) before deployment into operational checklists.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCaptureModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-lg text-xs font-medium shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Codify New Field Tacit Tip</span>
            </button>
          </div>
        </div>

        {/* Dual Filter Row: Category & Peer-Verification Status */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Peer-Verification Status Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              Verification Queue:
            </span>
            <button
              onClick={() => setVerificationFilter('ALL')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                verificationFilter === 'ALL'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              All Modules ({oplList.length})
            </button>
            <button
              onClick={() => setVerificationFilter('VERIFIED')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                verificationFilter === 'VERIFIED'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800/60 text-emerald-400 hover:text-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-300" />
              <span>Peer-Verified ({verifiedCount})</span>
            </button>
            <button
              onClick={() => setVerificationFilter('PENDING')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                verificationFilter === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-800/60 text-amber-400 hover:text-amber-200'
              }`}
            >
              <Clock className="w-3 h-3 text-amber-300" />
              <span>Awaiting Sign-off ({pendingCount})</span>
            </button>
            {rejectedCount > 0 && (
              <button
                onClick={() => setVerificationFilter('REJECTED')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  verificationFilter === 'REJECTED'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-800/60 text-rose-400 hover:text-rose-200'
                }`}
              >
                <XCircle className="w-3 h-3 text-rose-300" />
                <span>Revision Requested ({rejectedCount})</span>
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-slate-400" />
              Category:
            </span>
            {['ALL', 'Safety', 'Basic Operation', 'Troubleshooting', 'Improvement'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-slate-700 text-teal-300 border border-teal-500/40'
                    : 'bg-slate-800/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: OPL Card List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Tacit Knowledge Repository
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              Showing {filteredLessons.length} Modules
            </span>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredLessons.map((opl) => {
              const isSelected = opl.id === activeLesson.id;
              const status = opl.verificationStatus || 'VERIFIED';
              return (
                <div
                  key={opl.id}
                  onClick={() => setSelectedLessonId(opl.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-950/50 border-teal-500/60 shadow-md ring-1 ring-teal-500/20'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-500/40">
                        {opl.oplNumber}
                      </span>
                      <span className="font-mono text-xs font-semibold text-cyan-300">
                        {opl.equipmentTag}
                      </span>
                    </div>

                    {/* Verification Status Pill */}
                    {status === 'VERIFIED' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Peer-Verified</span>
                      </span>
                    ) : status === 'PENDING_REVIEW' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Awaiting Sign-off</span>
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40 font-semibold flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-rose-400" />
                        <span>Revision Req.</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-white mt-1.5 leading-snug">
                    {opl.title}
                  </h4>

                  <p className="text-[11px] text-slate-300 mt-2 line-clamp-2 italic bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    "{opl.goldenRule}"
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <UserCheck className="w-3 h-3 text-teal-400" />
                      {opl.authorName} ({opl.experienceYears}y)
                    </span>
                    <span className="text-slate-500 font-mono">
                      Category: <strong className="text-slate-300">{opl.category}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected OPL Detailed 5-Minute Sheet (7 cols) */}
        {activeLesson && (
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
            {/* Header */}
            <div className="pb-4 border-b border-slate-800 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-500/40">
                    {activeLesson.oplNumber}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Tag: <strong className="text-cyan-300 font-mono">{activeLesson.equipmentTag}</strong>
                  </span>
                  <span className="text-xs text-slate-400">Published: {activeLesson.publishedDate}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-2 leading-tight">
                  {activeLesson.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {OPL_PDF_MAP[activeLesson.oplNumber] && (
                  <button
                    onClick={() => openDocumentViewer({
                      fileUrl: OPL_PDF_MAP[activeLesson.oplNumber],
                      fileName: `${activeLesson.oplNumber}.pdf`,
                      title: `${activeLesson.oplNumber} · ${activeLesson.title}`,
                      fileType: 'pdf'
                    })}
                    className="px-3 py-1.5 rounded-lg bg-teal-950/80 hover:bg-teal-900 text-teal-300 text-xs font-bold border border-teal-500/50 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Open Controlled PDF</span>
                  </button>
                )}

                {/* Sign-off Trigger Button */}
                <button
                  onClick={() => setShowSignOffModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Stamp className="w-3.5 h-3.5" />
                  <span>Senior Sign-Off</span>
                </button>
              </div>
            </div>

            {/* Peer-Verification Certificate Ribbon */}
            <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
              (activeLesson.verificationStatus || 'VERIFIED') === 'VERIFIED'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : activeLesson.verificationStatus === 'PENDING_REVIEW'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  (activeLesson.verificationStatus || 'VERIFIED') === 'VERIFIED'
                    ? 'bg-emerald-900/60 border border-emerald-500/60 text-emerald-300'
                    : activeLesson.verificationStatus === 'PENDING_REVIEW'
                    ? 'bg-amber-900/60 border border-amber-500/60 text-amber-300'
                    : 'bg-rose-900/60 border border-rose-500/60 text-rose-300'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider font-mono">
                      {(activeLesson.verificationStatus || 'VERIFIED') === 'VERIFIED'
                        ? '✓ PSM Level 4 Certified · Peer-Verified'
                        : activeLesson.verificationStatus === 'PENDING_REVIEW'
                        ? '⏳ Awaiting Senior Reliability Sign-Off'
                        : '⚠️ Revision Requested by Senior Engineer'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 font-mono">
                      ISO 14224
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {(activeLesson.verificationStatus || 'VERIFIED') === 'VERIFIED' ? (
                      <span>Certified by <strong>{activeLesson.verifiedBy}</strong> on {activeLesson.verifiedAt || '2025-06-20'}</span>
                    ) : (
                      <span>Field submission undergoing technical review before deployment to execution runner</span>
                    )}
                  </div>
                </div>
              </div>

              {activeLesson.verificationStatus === 'PENDING_REVIEW' && (
                <button
                  onClick={() => setShowSignOffModal(true)}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-xs font-bold transition-all cursor-pointer shadow"
                >
                  Review & Sign Off Now
                </button>
              )}
            </div>

            {/* Golden Rule Highlight Card */}
            <div className="bg-gradient-to-r from-teal-950/80 to-slate-950 border border-teal-500/40 rounded-xl p-4 shadow-inner">
              <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>The 10-Second Golden Rule</span>
              </div>
              <p className="text-sm font-semibold text-white leading-relaxed">
                "{activeLesson.goldenRule}"
              </p>
            </div>

            {/* Practical Field Guidance */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Practical Veteran Operator Tip</span>
              </h4>
              <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-2">
                <p>{activeLesson.practicalTip}</p>
              </div>
            </div>

            {/* Visual Checkpoint & Sensory Indicator */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                <h5 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Visual / Sensory Check</span>
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeLesson.visualCheckNote}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-rose-950/30 border border-rose-500/30 space-y-2">
                <h5 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Consequences of Omission</span>
                </h5>
                <p className="text-xs text-rose-200/90 leading-relaxed">
                  {activeLesson.consequencesOfOmission}
                </p>
              </div>
            </div>

            {/* Senior Verifier Comments & Lineage */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4 text-teal-400" />
                <span>Senior Engineering Review & Governance Audit Trail</span>
              </h5>
              
              <div className="text-xs space-y-2 text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-slate-500 w-28 shrink-0">Reviewer:</span>
                  <strong className="text-teal-300">{activeLesson.verifiedBy}</strong>
                </div>
                {activeLesson.verifierRole && (
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 w-28 shrink-0">Role & Discipline:</span>
                    <span>{activeLesson.verifierRole}</span>
                  </div>
                )}
                {activeLesson.verifierComment && (
                  <div className="flex items-start gap-2 bg-slate-900/70 p-2.5 rounded border border-slate-800/80 text-[11px] text-slate-300 italic">
                    <span className="text-slate-500 not-italic w-28 shrink-0 font-medium">Review Notes:</span>
                    <span>"{activeLesson.verifierComment}"</span>
                  </div>
                )}
              </div>
            </div>

            {/* Live Checklist Deployment Box (Item 4 Improvement) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-teal-500/40 space-y-3 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-slate-200 text-xs">
                    Continuous Learning Loop · Operational Deployment
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 font-mono font-bold border border-teal-800">
                  Real-Time Procedure Sync
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Directly codify this verified lesson into the live Execution Guard checklist for <strong>{activeLesson.equipmentTag}</strong>. Prevents recurrence during the next startup shift.
              </p>

              <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                <span className="text-[11px] font-mono text-amber-300 italic truncate max-w-md">
                  "{activeLesson.goldenRule}"
                </span>

                {onDeployToExecutionGuard && (
                  <button
                    type="button"
                    onClick={() => onDeployToExecutionGuard(activeLesson)}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-teal-950 shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Deploy into Live Execution Guard ➔</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Senior Peer-Verification Sign-off Modal */}
      {showSignOffModal && activeLesson && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Stamp className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Senior Peer-Verification & Sign-Off
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Module: {activeLesson.oplNumber} · {activeLesson.equipmentTag}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSignOffModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Reviewer Details */}
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Senior Certifying Engineer Name & EMP ID
                </label>
                <input
                  type="text"
                  value={verifierName}
                  onChange={(e) => setVerifierName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Engineering Discipline & Role
                </label>
                <input
                  type="text"
                  value={verifierRole}
                  onChange={(e) => setVerifierRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {/* PSM Verification Checkpoints */}
              <div className="space-y-2 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Mandatory PSM Level 4 Checkpoints
                </span>
                
                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkPsmCompliant}
                    onChange={(e) => setCheckPsmCompliant(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <span>Verified against active P&ID Drawing and safe operating limits</span>
                </label>

                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkLimitsRespected}
                    onChange={(e) => setCheckLimitsRespected(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <span>No conflict with Safety Instrumented System (SIS) cause & effect interlocks</span>
                </label>

                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkTestedInField}
                    onChange={(e) => setCheckTestedInField(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <span>Approved for inclusion in shift handovers and Execution Guard runner</span>
                </label>
              </div>

              {/* Technical Remarks */}
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Technical Verification Comment / Approval Remarks
                </label>
                <textarea
                  rows={3}
                  value={verifierComment}
                  onChange={(e) => setVerifierComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-3.5 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/40 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Request Revision / Reject</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmSignOff}
                disabled={!checkPsmCompliant || !checkLimitsRespected || !checkTestedInField}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sign & Issue PSM Certification</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tacit Knowledge Ingestion Modal */}
      {showCaptureModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white">
                  Capture Field Tacit Knowledge (SECI Model)
                </h3>
              </div>
              <button
                onClick={() => setShowCaptureModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Enter raw field experience, handover notes, or operator instincts. The AI will structure them into a formal Chandra Asri One Point Lesson (OPL) and queue it for senior peer verification.
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">
                    Operator / SME Name
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">
                    Equipment Tag
                  </label>
                  <input
                    type="text"
                    value={equipmentTag}
                    onChange={(e) => setEquipmentTag(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Role & Experience
                </label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Raw Field Heuristic / Veteran Tip
                </label>
                <textarea
                  rows={4}
                  value={rawNotes}
                  onChange={(e) => setRawNotes(e.target.value)}
                  placeholder="e.g., In rainy shift, seal barrier fluid pressure drops slightly because of cooling. Always add 0.2 bar nitrogen cushion before switching pumps, otherwise seal faces flash..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-400 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[10px] text-amber-400 font-mono">
                Will be submitted to Senior Peer-Verification Queue
              </span>
              <button
                onClick={handleConvertTacitToOPL}
                disabled={converting || !rawNotes.trim()}
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {converting ? (
                  <span>Synthesizing OPL...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit for Peer Verification</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
