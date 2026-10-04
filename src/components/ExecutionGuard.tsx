import React, { useState, useEffect } from 'react';
import { useKnowledge } from '../context/KnowledgeContext';
import { SOP_ARCHIVE, SOPDocument, PlantUnit, OnePointLesson } from '../data/plantData';
import { 
  CheckCircle2, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  UserCheck, 
  FileText, 
  Lock, 
  Unlock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers
} from 'lucide-react';

interface ExecutionGuardProps {
  selectedUnit: PlantUnit;
  preselectedTag?: string;
  preselectedSopId?: string;
  highlightedStepNumber?: number | null;
  deployedTacitRules?: OnePointLesson[];
  onOpenDocument?: (docId: string) => void;
  onNavigateToPid?: (tag: string) => void;
}

export const ExecutionGuard: React.FC<ExecutionGuardProps> = ({
  selectedUnit,
  preselectedTag,
  preselectedSopId,
  highlightedStepNumber,
  deployedTacitRules,
  onOpenDocument,
  onNavigateToPid,
}) => {
  const { activePersonaConfig } = useKnowledge();
  const [selectedSopId, setSelectedSopId] = useState<string>(preselectedSopId || 'sop-lld-1201');
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [completedTacitCheckpoints, setCompletedTacitCheckpoints] = useState<Record<string, boolean>>({});
  const [verifiedSignoffs, setVerifiedSignoffs] = useState<Record<number, string>>({});
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  useEffect(() => {
    if (preselectedSopId) {
      setSelectedSopId(preselectedSopId);
    } else if (preselectedTag) {
      const matched = SOP_ARCHIVE.find(
        (s) => s.targetEquipment.includes(preselectedTag) || s.targetEquipment.some((t) => t.startsWith(preselectedTag))
      );
      if (matched) {
        setSelectedSopId(matched.id);
      }
    }
  }, [preselectedSopId, preselectedTag]);

  // Timer for Step 3 (Casing Venting - 180 seconds rule from OPL-2026-004)
  const [timerSeconds, setTimerSeconds] = useState<number>(180);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerFinished, setTimerFinished] = useState<boolean>(false);

  const activeSop =
    SOP_ARCHIVE.find((s) => s.id === selectedSopId) || SOP_ARCHIVE[0];

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      setTimerFinished(true);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const toggleStep = (stepNumber: number) => {
    // If it's step 3 (timer step), require timer finished or override
    if (stepNumber === 3 && !timerFinished && !completedSteps[3]) {
      return; // prevent skip
    }

    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));

    if (!completedSteps[stepNumber]) {
      const rolePrefix = activePersonaConfig.name;
      setVerifiedSignoffs((prev) => ({
        ...prev,
        [stepNumber]: `${rolePrefix} Sign-off @ ${new Date().toLocaleTimeString()} WIB`,
      }));
    }
  };

  const totalSteps = activeSop.steps.length;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-gradient-to-b from-emerald-950/60 to-slate-950 border-2 border-emerald-500/60 shadow-xl shadow-emerald-950/40 flex items-center justify-center p-1">
                <img 
                  src="/mascots/mascot-field-operator.png" 
                  alt="CHAKRA Execution Guard" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-mono font-bold uppercase tracking-wider shadow">
                {progressPercent === 100 ? "CLEARED" : "GUARD"}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold mb-1 flex-wrap">
                <ShieldCheck className="w-4 h-4" />
                <span>CORE PURPOSE: ERADICATE IMPROPER EXECUTION RISKS</span>
                <span className="text-slate-600">·</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${activePersonaConfig.badgeColorClass}`}>
                  ACTIVE SIGN-OFF ROLE: {activePersonaConfig.name.toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Execution Guard · Interactive Procedure Verification Runner
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Enforces procedural discipline during startup, line-up, and switchover operations. Binds active SOP steps with real-time interlock permissives, mandatory bleed timers, and double sign-offs to eliminate tacit memory shortcuts.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-800 text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">Execution Status</div>
            <div className="text-sm font-bold text-teal-300 font-mono">
              {completedCount} / {totalSteps} Steps Cleared ({progressPercent}%)
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full transition-all duration-300 shadow-sm shadow-teal-500/50"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Procedure Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold px-2">Active Standard Operating Procedure:</span>
          {SOP_ARCHIVE.map((sop) => (
            <button
              key={sop.id}
              onClick={() => {
                setSelectedSopId(sop.id);
                setCompletedSteps({});
                setVerifiedSignoffs({});
                setTimerSeconds(180);
                setIsTimerRunning(false);
                setTimerFinished(false);
              }}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer flex items-center gap-2 ${
                selectedSopId === sop.id
                  ? 'bg-teal-950 border-teal-500 text-teal-300 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span className="font-mono text-[10px] font-bold">{sop.docNumber}</span>
              <span>·</span>
              <span className="font-semibold text-slate-200">{sop.targetEquipment[0]}</span>
            </button>
          ))}
        </div>
        <div className="text-[11px] text-slate-400 font-mono pr-2">
          Equipment Scope: <strong className="text-teal-400">{activeSop.targetEquipment.join(', ')}</strong>
        </div>
      </div>

      {/* Main Execution View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: SOP Meta & Requirements (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div>
              <span className="font-mono text-xs font-bold text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-500/40">
                {activeSop.docNumber}
              </span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {activeSop.revision}
              </span>
              <h3 className="text-sm font-bold text-white mt-2 leading-tight">
                {activeSop.title}
              </h3>
            </div>

            <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Execution Risk:</span>
                <span className="font-bold text-rose-400">{activeSop.executionRisk} RISK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Effective Date:</span>
                <span className="font-mono text-slate-300">{activeSop.effectiveDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Approval Stamp:</span>
                <span className="text-emerald-400 font-medium">{activeSop.approvedBy.split('&')[0]}</span>
              </div>
            </div>

            {/* Mandatory PPE */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Mandatory PPE Clearance
              </span>
              <ul className="text-xs text-slate-300 space-y-1">
                {activeSop.mandatoryPPE.map((ppe, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>{ppe}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Active permits */}
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Required Work Permits (PTW)
              </span>
              {activeSop.permitsRequired.map((p, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-950/80 border border-slate-800 text-[11px] text-teal-300 font-mono">
                  {p}
                </div>
              ))}
            </div>

            <button
              onClick={() => onOpenDocument && onOpenDocument(activeSop.id)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Inspect Full Approved SOP Text</span>
            </button>
          </div>
        </div>

        {/* Right: Step-by-Step Checklist Runner (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Verified Step-by-Step Sequence</span>
            <span className="text-[11px] text-teal-400">
              Double-Signoff Enforced · Zero Skips Permitted
            </span>
          </div>

          <div className="space-y-3">
            {activeSop.steps.map((step) => {
              const isChecked = !!completedSteps[step.stepNumber];
              const isTimerStep = step.stepNumber === 3;
              const isNavigatedTarget = highlightedStepNumber === step.stepNumber;

              return (
                <div
                  key={step.stepNumber}
                  id={`sop-step-${step.stepNumber}`}
                  className={`p-4 rounded-xl border transition-all ${
                    isNavigatedTarget
                      ? 'border-amber-400 ring-2 ring-amber-500/40 bg-slate-900/95 shadow-lg shadow-amber-950/40'
                      : isChecked
                      ? 'bg-teal-950/30 border-teal-500/50 text-slate-300'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleStep(step.stepNumber)}
                        disabled={isTimerStep && !timerFinished && !isChecked}
                        className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                          isChecked
                            ? 'bg-teal-500 border-teal-400 text-white shadow-sm shadow-teal-500/50'
                            : isTimerStep && !timerFinished
                            ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-950 border-slate-700 text-transparent hover:border-teal-400 cursor-pointer'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-teal-400">
                            STEP {step.stepNumber}
                          </span>
                          <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {step.phase}
                          </span>
                          {step.isMandatorySignoff && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800/40 font-medium">
                              Mandatory Sign-off
                            </span>
                          )}
                          {isNavigatedTarget && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/60 font-bold font-mono animate-pulse">
                              📍 NAVIGATED FROM P&ID HOTSPOT
                            </span>
                          )}
                        </div>

                        <p className={`text-xs leading-relaxed font-medium ${isChecked ? 'text-slate-300 line-through' : 'text-slate-100'}`}>
                          {step.action}
                        </p>

                        {/* Interlock requirement badge if any */}
                        {step.interlockRequirement && (
                          <div className="text-[11px] font-mono text-cyan-300 flex items-center gap-1.5 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/50 w-fit">
                            <Lock className="w-3 h-3 text-cyan-400" />
                            <span>Interlock Permissive: {step.interlockRequirement}</span>
                          </div>
                        )}

                        {/* Locate on P&ID button for cross-navigation */}
                        {onNavigateToPid && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => onNavigateToPid(activeSop.targetEquipment[0] || 'GA-1201A')}
                              className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-teal-300 border border-teal-800/60 text-[10px] font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
                              title={`Locate ${activeSop.targetEquipment[0] || 'equipment'} on the P&ID blueprint`}
                            >
                              <Layers className="w-3 h-3 text-teal-400" />
                              <span>Locate on P&ID Blueprint ({activeSop.targetEquipment[0] || 'GA-1201A'})</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}

                        {/* Caution note if any */}
                        {step.cautionNote && (
                          <div className="text-xs bg-amber-950/40 border border-amber-500/40 rounded p-2 text-amber-200/90 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>{step.cautionNote}</span>
                          </div>
                        )}

                        {/* Special Timer Module for Step 3 (Casing Venting) */}
                        {isTimerStep && (
                          <div className="mt-3 p-3.5 rounded-lg bg-slate-950 border border-cyan-500/40 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Mandatory 180s Casing Bleed Protocol (OPL-2026-004)</span>
                              </span>
                              <span className="font-mono text-sm font-bold text-white">
                                {Math.floor(timerSeconds / 60)}:
                                {(timerSeconds % 60).toString().padStart(2, '0')}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-400">
                              Enforces continuous hydrocarbon bleed into closed slop drain to prevent trapped vapor locks before motor start.
                            </p>

                            <div className="flex items-center gap-2">
                              {!isTimerRunning && !timerFinished && (
                                <button
                                  onClick={() => setIsTimerRunning(true)}
                                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium flex items-center gap-1"
                                >
                                  <Play className="w-3 h-3" />
                                  <span>Start Bleed Timer</span>
                                </button>
                              )}
                              {isTimerRunning && (
                                <button
                                  onClick={() => setIsTimerRunning(false)}
                                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-medium flex items-center gap-1"
                                >
                                  <Pause className="w-3 h-3" />
                                  <span>Pause</span>
                                </button>
                              )}
                              {timerFinished && (
                                <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Bleed Duration Satisfied! You may now sign off Step 3.</span>
                                </div>
                              )}
                              <button
                                onClick={() => {
                                  setIsTimerRunning(false);
                                  setTimerSeconds(180);
                                  setTimerFinished(false);
                                }}
                                className="px-2 py-1 bg-slate-800 text-slate-400 hover:text-slate-200 rounded text-xs"
                                title="Reset Timer"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Signoff stamp */}
                        {verifiedSignoffs[step.stepNumber] && (
                          <div className="text-[10px] text-teal-400 flex items-center gap-1 pt-1 font-mono">
                            <UserCheck className="w-3 h-3" />
                            <span>Signed: {verifiedSignoffs[step.stepNumber]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Codified Tacit Rules Deployed from OPL Studio (Item 4 Improvement) */}
          {deployedTacitRules && deployedTacitRules.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Live Deployed Tacit Knowledge Checkpoints ({deployedTacitRules.length}):
                </span>
                <span className="text-[10px] text-amber-400 font-mono bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/40">
                  Peer-Verified Field Heuristics
                </span>
              </div>

              {deployedTacitRules.map((opl, idx) => {
                const isChecked = !!completedTacitCheckpoints[opl.id];
                return (
                  <div
                    key={opl.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isChecked
                        ? 'bg-amber-950/30 border-amber-500/50 text-slate-300'
                        : 'bg-slate-900/90 border-amber-500/30 hover:border-amber-400/60 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setCompletedTacitCheckpoints((prev) => ({
                            ...prev,
                            [opl.id]: !prev[opl.id],
                          }));
                        }}
                        className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-sm shadow-amber-500/50'
                            : 'bg-slate-950 border-slate-700 text-transparent hover:border-amber-400'
                        }`}
                      >
                        <Check className="w-4 h-4 font-bold" />
                      </button>

                      <div className="space-y-1.5 flex-1 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-amber-400">
                            {opl.oplNumber || `OPL-${idx + 1}`}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700 font-mono font-bold">
                            {opl.equipmentTag}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {opl.category}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            Verified by: {opl.verifiedBy || 'Senior Specialist'}
                          </span>
                        </div>

                        <h5 className="font-semibold text-slate-100">{opl.title}</h5>

                        <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-amber-200 font-mono text-[11px] italic">
                          "{opl.goldenRule}"
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {opl.visualCheckNote}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Completion summary */}
          {progressPercent === 100 && (
            <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-5 text-center space-y-3 animate-fadeIn">
              <div className="w-16 h-16 mx-auto rounded-xl overflow-hidden bg-slate-950/80 border border-emerald-400/60 flex items-center justify-center p-1 shadow-md">
                <img 
                  src="/mascots/mascot-field-operator.png" 
                  alt="Execution Guard Cleared" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h4 className="text-sm font-bold text-emerald-300 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Procedure Execution Successfully Verified & Archived</span>
              </h4>
              <p className="text-xs text-emerald-200/80 max-w-lg mx-auto leading-relaxed">
                All interlock permissives, bleeder dwell times, and physical valve positions have been confirmed by the CHAKRA Execution Guard. An electronic execution record has been logged in EDMS/SAP PM with zero deviations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
