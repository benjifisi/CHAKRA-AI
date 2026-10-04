import React, { useState } from 'react';
import { EQUIPMENT_DATABASE, EquipmentTag, PlantUnit } from '../data/plantData';
import { TelemetryDriftMonitor } from './TelemetryDriftMonitor';
import { 
  Network, 
  Layers, 
  FileText, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  Wrench, 
  Sparkles, 
  ArrowRight,
  Database,
  Search,
  ExternalLink,
  Sliders,
  CheckCircle,
  Clock,
  Radio,
  BarChart3
} from 'lucide-react';

interface DataOpsGraphProps {
  selectedUnit: PlantUnit;
  onOpenDocument?: (docId: string) => void;
  onOpenExecutionChecklist?: (tag: string) => void;
  onNavigateToQa?: (query: string, tag: string) => void;
  onNavigateToPid?: (tag: string) => void;
  onNavigateToRca?: (tag: string) => void;
}

export const DataOpsGraph: React.FC<DataOpsGraphProps> = ({
  selectedUnit,
  onOpenDocument,
  onOpenExecutionChecklist,
  onNavigateToQa,
  onNavigateToPid,
  onNavigateToRca,
}) => {
  const [viewMode, setViewMode] = useState<'DRIFT_MONITOR' | 'KNOWLEDGE_GRAPH'>('DRIFT_MONITOR');
  const [selectedTagCode, setSelectedTagCode] = useState<string>('GA-1201A');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filteredEquipment = EQUIPMENT_DATABASE.filter((eq) => {
    const matchesUnit = eq.unitId === selectedUnit.id || selectedUnit.id === 'unit-olefins';
    const matchesCategory = filterCategory === 'ALL' || eq.category === filterCategory;
    return matchesUnit && matchesCategory;
  });

  const activeTag = EQUIPMENT_DATABASE.find((e) => e.tag === selectedTagCode) || EQUIPMENT_DATABASE[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-gradient-to-b from-teal-900/50 to-slate-950 border-2 border-teal-500/60 shadow-xl shadow-teal-950/40 flex items-center justify-center p-1">
                <img 
                  src="/mascots/mascot-field-operator.png" 
                  alt="CHAKRA DataOps Mascot" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 text-[9px] font-mono font-bold uppercase tracking-wider shadow">
                DATAOPS
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold mb-1">
                <Network className="w-4 h-4" />
                <span>KEY QUESTION 1: INDUSTRIAL DATA OPS & UNIFIED METADATA FOUNDATION</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Connected Asset Knowledge Graph
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Solves the challenge of scattered plant information. Unifies equipment tag data, P&ID topology, active SOPs, AIMS asset integrity thickness, SAP PM maintenance history, and tacit field lessons into a single governed entity view.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-xs">
            <Database className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-mono">
              <strong>{EQUIPMENT_DATABASE.length}</strong> Connected Plant Assets Mapped
            </span>
          </div>
        </div>

        {/* Navigation Mode Switcher: Drift Sentinel vs Knowledge Graph */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('DRIFT_MONITOR')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === 'DRIFT_MONITOR'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg ring-1 ring-teal-400/40'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
              <span>Real-Time Operational Drift Sentinel</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 text-teal-300 font-mono">
                LIVE DCS
              </span>
            </button>

            <button
              onClick={() => setViewMode('KNOWLEDGE_GRAPH')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === 'KNOWLEDGE_GRAPH'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg ring-1 ring-teal-400/40'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-300" />
              <span>Connected Knowledge Foundation (6 Streams)</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Simulated Telemetry Stream (Brownian Drift Engine)</span>
          </div>
        </div>

        {/* Filter Bar (for Knowledge Graph) */}
        {viewMode === 'KNOWLEDGE_GRAPH' && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 mr-2 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-slate-400" />
              Asset Discipline:
            </span>
            {['ALL', 'Rotating Equipment', 'Static Equipment', 'Instrumentation & Control'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-teal-600 text-white shadow'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main View Display: Drift Monitor vs Unified Knowledge Graph */}
      {viewMode === 'DRIFT_MONITOR' ? (
        <TelemetryDriftMonitor
          onOpenDocument={onOpenDocument}
          onOpenExecutionChecklist={onOpenExecutionChecklist}
          onSelectTag={(t) => {
            setSelectedTagCode(t);
            setViewMode('KNOWLEDGE_GRAPH');
          }}
        />
      ) : (
        /* Main Grid: Asset Selector & Knowledge Graph Entity Card */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tag Selection List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Plant Asset Hierarchy</span>
            <span className="text-[10px] text-slate-500 font-mono">Select Tag to Inspect</span>
          </h3>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredEquipment.map((eq) => {
              const isSelected = eq.tag === activeTag.tag;
              return (
                <div
                  key={eq.tag}
                  onClick={() => setSelectedTagCode(eq.tag)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-950/60 border-teal-500/60 shadow-md ring-1 ring-teal-500/20'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-teal-300 tracking-wide">
                      {eq.tag}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        eq.criticality.includes('CRITICAL')
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {eq.criticality.split(' ')[0]}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-100 mt-1 line-clamp-1">
                    {eq.name}
                  </h4>

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span>{eq.category}</span>
                    <span>·</span>
                    <span className="text-cyan-400 font-mono text-[10px]">{eq.pidDrawing}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-slate-400" />
                      {eq.sopDocs.length} SOPs
                    </span>
                    <span className="flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-amber-400" />
                      MTBF: {eq.maintenanceStats.mtbfHours.toLocaleString()} hrs
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-teal-400" />
                      {eq.tacitTipsCount} Tacit Tips
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Connected Knowledge Foundation Detail (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Tag Overview Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-teal-300 bg-teal-950/80 px-2.5 py-0.5 rounded border border-teal-500/40">
                    {activeTag.tag}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {activeTag.category}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/40 font-semibold">
                    {activeTag.criticality}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1.5">{activeTag.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Process Service: <strong className="text-slate-200">{activeTag.fluidService}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenExecutionChecklist && onOpenExecutionChecklist(activeTag.tag)}
                  className="px-3 py-1.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded text-xs font-medium shadow transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Start Guided Execution</span>
                </button>
              </div>
            </div>

            {/* Operational Launchpad Tray (Item 2 Improvement) */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-teal-500/40 space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  Cross-Tab Operational Launchpad for {activeTag.tag}:
                </span>
                <span className="text-[10px] text-teal-300 font-mono bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                  Instant Navigation Hub
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateToQa && onNavigateToQa(`What is the safe operating envelope, start-up permissive sequence, and interlock trips for ${activeTag.name} (${activeTag.tag})?`, activeTag.tag)}
                  className="px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-teal-400 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-sm group"
                  title="Ask AI questions grounded in this asset's specs"
                >
                  <Search className="w-3.5 h-3.5 text-teal-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">Ask AI in Q&A</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateToPid && onNavigateToPid(activeTag.tag)}
                  className="px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-400 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-sm group"
                  title="Open As-Built P&ID Blueprint for this asset"
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">View As-Built P&ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateToRca && onNavigateToRca(activeTag.tag)}
                  className="px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-rose-400 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-sm group"
                  title="Diagnose past breakdowns in Failure Memory RCA"
                >
                  <Wrench className="w-3.5 h-3.5 text-rose-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">Failure Memory RCA</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenExecutionChecklist && onOpenExecutionChecklist(activeTag.tag)}
                  className="px-2.5 py-2 rounded-lg bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-600/50 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm group"
                  title="Launch live interactive startup procedure"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">Execute Startup SOP</span>
                </button>
              </div>
            </div>

            {/* 6 Connected Data Streams Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stream 1: Process Operating Envelope & Limits */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Operating Envelope (Datasheet)</span>
                </h4>
                <div className="space-y-2 text-xs">
                  {activeTag.operatingLimits.dischargePressure && (
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Discharge Pressure:</span>
                      <span className="font-mono text-slate-200">
                        Normal: <strong>{activeTag.operatingLimits.dischargePressure.normal}</strong> | Trip:{' '}
                        <strong className="text-rose-400">
                          {activeTag.operatingLimits.dischargePressure.tripHigh} {activeTag.operatingLimits.dischargePressure.unit}
                        </strong>
                      </span>
                    </div>
                  )}
                  {activeTag.operatingLimits.temperature && (
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Temperature Limit:</span>
                      <span className="font-mono text-slate-200">
                        Normal: <strong>{activeTag.operatingLimits.temperature.normal}</strong> | Trip:{' '}
                        <strong className="text-rose-400">
                          {activeTag.operatingLimits.temperature.tripHigh} {activeTag.operatingLimits.temperature.unit}
                        </strong>
                      </span>
                    </div>
                  )}
                  {activeTag.operatingLimits.vibration && (
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Vibration Envelope:</span>
                      <span className="font-mono text-slate-200">
                        Normal: <strong>{activeTag.operatingLimits.vibration.normal}</strong> | Trip:{' '}
                        <strong className="text-rose-400">
                          {activeTag.operatingLimits.vibration.tripHigh} {activeTag.operatingLimits.vibration.unit}
                        </strong>
                      </span>
                    </div>
                  )}
                  {activeTag.operatingLimits.sealBarrierDP && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">API Plan 53A Barrier DP:</span>
                      <span className="font-mono text-slate-200">
                        Normal: <strong>{activeTag.operatingLimits.sealBarrierDP.normal}</strong> | Low Alarm:{' '}
                        <strong className="text-amber-400">
                          {activeTag.operatingLimits.sealBarrierDP.alarmLow} {activeTag.operatingLimits.sealBarrierDP.unit}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stream 2: AIMS Asset Integrity Management System */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>AIMS Integrity Records</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    {activeTag.aimsData.status}
                  </span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Measured Wall Thickness:</span>
                    <span className="font-mono text-slate-200">
                      <strong>{activeTag.aimsData.measuredWallThicknessMm} mm</strong> (Min: {activeTag.aimsData.minimumAllowedWallMm} mm)
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Corrosion Rate:</span>
                    <span className="font-mono text-slate-200">
                      <strong>{activeTag.aimsData.corrosionRateMmPerYear} mm/yr</strong>
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Calculated Remaining Life:</span>
                    <span className="font-mono text-emerald-300 font-bold">
                      {activeTag.aimsData.remainingLifeYears} Years
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Next NDT Inspection:</span>
                    <span className="font-mono text-slate-300">
                      {activeTag.aimsData.nextInspectionDue} ({activeTag.aimsData.inspectionType.split(' ')[0]})
                    </span>
                  </div>
                </div>
              </div>

              {/* Stream 3: Linked SOPs in EDMS */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-400" />
                  <span>Approved SOPs & Operating Manuals</span>
                </h4>
                <div className="space-y-2 text-xs">
                  {activeTag.sopDocs.map((docNo) => (
                    <div
                      key={docNo}
                      className="p-2 rounded bg-slate-900/90 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono font-bold text-teal-300">{docNo}</div>
                        <div className="text-[10px] text-slate-400">
                          Status: <span className="text-emerald-400">Approved & Active</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onOpenDocument && onOpenDocument('sop-ole-042')}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 text-[10px] font-medium flex items-center gap-1"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                  <div className="text-[10px] text-slate-500">
                    Engineering Datasheet: <strong className="text-slate-400">{activeTag.datasheetDoc}</strong>
                  </div>
                </div>
              </div>

              {/* Stream 4: P&ID Piping & Instrumentation Loop */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>As-Built P&ID Reference</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-300">{activeTag.pidDrawing}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                        Rev 4.0
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Contains safety interlock loop ESD-101, recirculation FV-1024, and barrier pot PDT-1020.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Drawing Vault: EDMS #882-OLE</span>
                    <button
                      onClick={() => onOpenDocument && onOpenDocument('pid-ole-1002')}
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>View Drawing</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stream 5: Historical Failure Memory & Maintenance Summary */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Maintenance History & Failure Memory</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  MTBF: {activeTag.maintenanceStats.mtbfHours.toLocaleString()} Operating Hours
                </span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80">
                  <div className="text-[10px] text-slate-500 uppercase">Last Maintenance</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{activeTag.maintenanceStats.lastMaintenance}</div>
                  <div className="text-[10px] text-emerald-400 mt-1">✓ Overhaul Verified</div>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80">
                  <div className="text-[10px] text-slate-500 uppercase">Historical Work Orders</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{activeTag.maintenanceStats.totalRecords} Work Orders</div>
                  <div className="text-[10px] text-slate-400 mt-1">PM & CM Logged</div>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80">
                  <div className="text-[10px] text-slate-500 uppercase">Unplanned Breakdowns</div>
                  <div className="font-semibold text-amber-300 mt-0.5">{activeTag.maintenanceStats.breakdownCount} Events</div>
                  <div className="text-[10px] text-amber-400/80 mt-1">Indexed in Failure Memory</div>
                </div>
              </div>
            </div>

            {/* Tacit Knowledge Snippet */}
            <div className="bg-teal-950/30 border border-teal-500/30 rounded-lg p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-teal-200 uppercase tracking-wider">
                  Associated Field Tacit Knowledge (OPL-2026-004)
                </h4>
                <p className="text-xs text-teal-300/90 mt-1 italic leading-relaxed">
                  "Put your hand with insulated glove on the casing bleeder line before starting {activeTag.tag}. In high ambient morning shifts, vapor lock can linger even after 1 minute of venting. Always wait until the casing outlet line feels uniformly ice-cold."
                </p>
                <div className="text-[10px] text-teal-400/80 mt-1.5">
                  Contributed by Rusdi Hermawan (Senior Field Operator, 24 years service) · Verified by Lead Reliability Engineer
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
