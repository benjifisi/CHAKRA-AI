import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useKnowledge, MaintenanceRecord } from '../context/KnowledgeContext';
import { 
  FileUp, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Layers, 
  Database, 
  Upload, 
  Table, 
  FolderOpen, 
  Presentation, 
  Download, 
  AlertTriangle, 
  Check, 
  Eye, 
  FileSpreadsheet,
  Search,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Info,
  Clock,
  Wrench,
  DollarSign
} from 'lucide-react';

const PPT_SLIDES_DATA = [
  {
    slideNumber: 1,
    title: 'Manufacturing Knowledge Hub: P&ID & Plot Plan Asset Architecture',
    purpose: 'Connect process logic, field location, operations, troubleshooting, and maintenance knowledge.',
    columns: [
      {
        title: 'Equipment & Flow',
        items: ['Equipment list and asset hierarchy', 'Process flow paths and operating modes', 'Material & utility movement lines']
      },
      {
        title: 'Piping & Valve Logic',
        items: ['Pipes, tie-ins & line specifications', 'Valves, manual bypasses & minimum flow loops', 'Casing drains, vents & bleed lines']
      },
      {
        title: 'Instrumentation & Control',
        items: ['Sensors & transmitters (PT, TT, FT, VT)', 'Control valves & DVC smart positioners', 'DCS monitoring points & high/low alarms']
      },
      {
        title: 'Safety & Knowledge',
        items: ['Trips & permissive alarms (SIL 1)', 'Shutdown/interlocks (SEQ sequences)', 'SOPs, incident failure logs & live DCS data']
      }
    ],
    takeaway: 'P&ID explains how the system works. Plot Plan shows where equipment is located. Together they create operational context for decision-making and prevent improper execution.'
  },
  {
    slideNumber: 2,
    title: 'P&ID #SET 1 · Feed / Pumping System (GA-1201A)',
    tag: 'GA-1201A',
    service: 'HEXANE FEED PUMP',
    whatItShows: 'Feed transfer from storage tank 12-T-01 to reactor/process. Pump protection logic: min-flow bypass FV-1201, suction pressure PT-1201, seal flush Plan 11+62, vibration VT-1201, temperature trips.',
    whatCanBeExtracted: 'Pump, valve, line, flow, pressure, motor tags; Trip, permissive, alarm and seal flush conditions.',
    howItIsUseful: 'Explains start-up, low-flow and suction issues; Links logic with SOP-OLE-042 and maintenance history.'
  },
  {
    slideNumber: 3,
    title: 'P&ID #SET 2 · Polymer Fluid Bed Dryer (YD-2301)',
    tag: 'YD-2301',
    service: 'POLYMER FLUID BED DRYER',
    whatItShows: 'Dryer with powder inlet/outlet, N2 purge, venting and motor operation. Permissive and trip logic for flow, pressure, temperature, lube oil, vibration.',
    whatCanBeExtracted: 'Dryer, centrifuge, N2 purge, vent, motor and instrument tags; Start permissive, ESD, DCS reset and trip logic (SEQ-5500).',
    howItIsUseful: 'Explains dryer trips and operating requirements; Connects SOPs, purge requirements and maintenance records.'
  },
  {
    slideNumber: 4,
    title: 'P&ID #SET 3 · Catalyst Reduction Reactor & Heater (DC-3401A)',
    tag: 'DC-3401A',
    service: 'CATALYST REDUCTION REACTOR',
    whatItShows: 'Hydrogen injection, catalyst bed, analysis point and temperature control. Safety-critical interlocks, permissives and high-temperature protection.',
    whatCanBeExtracted: 'Reactor, heater, analyzer AI-3401, PSV-3401, flow, temperature and interlock tags; Cause-and-effect logic and trip conditions (SEQ-3401).',
    howItIsUseful: 'Answers safety-critical questions with verified citations; Supports startup and temperature-interlock troubleshooting.'
  },
  {
    slideNumber: 5,
    title: 'P&ID #SET 4 · Recycle Gas Compressor System (KC-4501)',
    tag: 'KC-4501',
    service: 'RECYCLE GAS COMPRESSOR',
    whatItShows: 'Recycle compressor with anti-surge protection FV-4502; Seal gas N2 buffer, lube oil and cooling-water support systems.',
    whatCanBeExtracted: 'Compressor, recycle valve, trip and permissive tags; Anti-surge logic, KO drum FA-4510 level and equipment protection data.',
    howItIsUseful: 'AI helps investigate compressor trips and root causes; Improves reliability and operational decision-making.'
  },
  {
    slideNumber: 6,
    title: 'P&ID #SET 5 · Solvent Heater System (EA-5601)',
    tag: 'EA-5601',
    service: 'SOLVENT HEATER',
    whatItShows: 'Hexane heating using steam shell-and-tube heater; Temperature control TIC-5602, condensate and steam trap system ST-5604.',
    whatCanBeExtracted: 'Heater, PSV-5607, steam valve, trap and alarm tags; Fouling alarm PDAH-5605 (>0.7 bar) and process protection information.',
    howItIsUseful: 'Helps AI support heater performance troubleshooting and fouling analysis; Supports energy and maintenance optimization.'
  },
  {
    slideNumber: 7,
    title: 'P&ID #SET 6 · Separation Level Control System (LV-6701)',
    tag: 'LV-6701',
    service: 'SEPARATOR LEVEL CONTROL VALVE',
    whatItShows: 'LP Separator FA-6710 and level-control valve system; Instrument air, HART communication, and voting logic.',
    whatCanBeExtracted: 'Separator, LIC, LV-6701, DVC6200 positioner tags; High/low level alarms (LSHH-6710, LSLL-6710), ESD actions, permissives.',
    howItIsUseful: 'Diagnose level excursions and valve issues; Supports control valve troubleshooting, alarm interpretation, and safer operating decisions.'
  },
  {
    slideNumber: 8,
    title: 'P&ID #SET 7 · Cooling Tower Fan System (CT-7801)',
    tag: 'CT-7801',
    service: 'COOLING TOWER CELL FAN',
    whatItShows: 'Cooling tower fan, gearbox, motor and cooling cell operation; Interlocks related to vibration, oil temperature and motor load.',
    whatCanBeExtracted: 'Fan, gearbox, motor, vibration VSHH-7802, temperature and permissive tags; Trip logic, spare-cell activation logic and DCS notifications.',
    howItIsUseful: 'AI helps analyze fan trips and cooling-system reliability issues; Assists maintenance planning for vibration, gearbox problems, and oil pressure verification.'
  },
  {
    slideNumber: 9,
    title: 'P&ID #SET 8 · Solvent Fractionation System (FA-8901)',
    tag: 'FA-8901',
    service: 'REFLUX ACCUMULATOR DRUM',
    whatItShows: 'Solvent fractionation and reflux accumulator drum system; Reflux pumps GA-8920, level protection, venting and start permissive logic.',
    whatCanBeExtracted: 'Accumulator drum, pumps, valves, flow and pressure tags; SIL logic, high/low level alarms, trips and DCS alarm actions (SEQ-8901).',
    howItIsUseful: 'Explains reflux operation and fractionation upsets; Supports root-cause analysis for trips, alarms and level-control issues.'
  },
  {
    slideNumber: 10,
    title: 'Maintenance History (Excel) · The Common Join Key',
    tag: 'Equipment_Tag',
    service: 'ALL 8 EQUIPMENT SETS',
    whatItShows: 'Historical maintenance records for plant equipment: Failures, inspections, preventive, predictive, calibration, and overhaul activities. Downtime, maintenance costs, root causes, and corrective actions for each work order.',
    whatCanBeExtracted: 'Equipment Tag as the common JOIN KEY across all datasets. Recurring issues, root causes, breakdown patterns, downtime hours, and spare parts consumed.',
    howItIsUseful: 'Connects maintenance history with operational, P&ID, and engineering data; Enables predictive maintenance and operational knowledge hub use cases.'
  }
];

export const DocumentIngestor: React.FC = () => {
  const { 
    selectedUnit, 
    machineFolderSets, 
    maintenanceRecords, 
    rawCaliberMaintenance,
    importMaintenanceExcel, 
    openDocumentViewer
  } = useKnowledge();

  const [activeIngestMode, setActiveIngestMode] = useState<'excel' | 'folderSets' | 'ppt'>('excel');

  // Excel State
  const [excelSearch, setExcelSearch] = useState('');
  const [filterTag, setFilterTag] = useState<string>('ALL');
  const [excelFileName, setExcelFileName] = useState<string | null>(null);
  const [excelImportSuccess, setExcelImportSuccess] = useState(false);
  const fileInputExcelRef = useRef<HTMLInputElement>(null);

  // Folder Sets State
  const [selectedMachineSetIdx, setSelectedMachineSetIdx] = useState<number>(0);

  // PPT State
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);

  // Filter maintenance records
  const filteredMaintenance = rawCaliberMaintenance.filter((r) => {
    const matchesTag = filterTag === 'ALL' || r.equipmentTag === filterTag;
    const query = (excelSearch || '').trim().toLowerCase();
    const matchesSearch = !query || 
      (r.woNumber || '').toLowerCase().includes(query) ||
      (r.equipmentTag || '').toLowerCase().includes(query) ||
      (r.problemDescription || '').toLowerCase().includes(query) ||
      (r.rootCause || '').toLowerCase().includes(query) ||
      (r.correctiveAction || '').toLowerCase().includes(query) ||
      (r.workType || '').toLowerCase().includes(query);
    return matchesTag && matchesSearch;
  });

  // Calculate totals
  const totalCost = rawCaliberMaintenance.reduce((sum, r) => sum + r.totalCostIDR, 0);
  const totalDowntime = rawCaliberMaintenance.reduce((sum, r) => sum + r.downtimeHours, 0);
  const breakdownCount = rawCaliberMaintenance.filter((r) => r.isBreakdown).length;

  const handleExcelFileUpload = (file: File) => {
    setExcelFileName(file.name);
    setExcelImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const mapped: MaintenanceRecord[] = rawJson.map((row, idx) => ({
          id: `excel-new-${Date.now()}-${idx}`,
          equipmentTag: String(row.Equipment_Tag || row.Tag || 'P-101B').trim(),
          notificationNo: String(row.Notification_No || `NT-${idx}`).trim(),
          orderNo: String(row.WO_Number || `WO-${idx}`).trim(),
          failureDate: String(row.Report_Date || new Date().toISOString().split('T')[0]).trim(),
          failureMode: String(row.Problem_Description || 'Equipment Issue').trim(),
          symptom: String(row.Problem_Description || '').trim(),
          rootCause: String(row.Root_Cause || 'Under investigation').trim(),
          correctiveAction: String(row.Corrective_Action || 'Maintenance performed').trim(),
          downtimeHours: parseFloat(String(row.Downtime_Hours || '0')) || 0,
          costEstimate: `Rp ${Number(row.Total_Cost_IDR || 0).toLocaleString()}`,
          severity: parseFloat(String(row.Downtime_Hours || '0')) > 12 ? 'Major Loss' : 'Moderate',
        }));

        importMaintenanceExcel(mapped, file.name);
        setExcelImportSuccess(true);
      } catch (err) {
        console.error('Failed to parse Excel workbook:', err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const getFileUrl = (folderName: string, fileName: string) => {
    if (fileName.startsWith('OPL-')) {
      const oplSubdir = folderName.includes('Set_01') || folderName.includes('Set_02') 
        ? 'One Point Lesson'
        : folderName.includes('Set_07') || folderName.includes('Set_08')
        ? 'One Point Lesson (OPL)'
        : 'OPL (One Point Lessons)';
      return `/sets/${folderName}/${oplSubdir}/${fileName}`;
    }
    return `/sets/${folderName}/${fileName}`;
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-gradient-to-b from-indigo-950/60 to-slate-950 border-2 border-indigo-500/60 shadow-xl shadow-indigo-950/40 flex items-center justify-center p-1">
                <img 
                  src="/mascots/mascot-doc-ingest.png" 
                  alt="CHAKRA Document Ingest Mascot" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-indigo-400 text-slate-950 text-[9px] font-mono font-bold uppercase tracking-wider shadow">
                INGEST
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold mb-1">
                <Database className="w-4 h-4" />
                <span>CHAKRA INDUSTRIAL DATASET & ASSET WORKBENCH</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Dataset Ingestion, Verification & Grounding Hub
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Your engineering assets are fully parsed and live: the <strong>8 Critical Machine Sets</strong> (32 technical engineering drawings/datasheets and 56 One Point Lessons), the <strong>Maintenance History Logs</strong> (212 authentic work orders), and the <strong>Asset Architecture Documentation</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-bold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>8 Machine Sets Live</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-teal-950 text-teal-300 border border-teal-800/60 font-bold">
              212 WOs Synced
            </span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveIngestMode('excel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              activeIngestMode === 'excel'
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-sm'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>1. Maintenance History (212 Work Orders)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 font-mono">
              Active
            </span>
          </button>

          <button
            onClick={() => setActiveIngestMode('folderSets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              activeIngestMode === 'folderSets'
                ? 'bg-teal-950/80 border-teal-500/60 text-teal-300 shadow-sm'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-teal-400" />
            <span>2. The 8 Machine Folder Sets (56 OPLs + Diagrams)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-900/60 text-teal-300 font-mono">
              8 Sets
            </span>
          </button>

          <button
            onClick={() => setActiveIngestMode('ppt')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              activeIngestMode === 'ppt'
                ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 shadow-sm'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Presentation className="w-4 h-4 text-amber-400" />
            <span>3. PPT Dataset Explanation (10 Slides Interactive)</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: MAINTENANCE HISTORY DATASET                           */}
      {/* ============================================================== */}
      {activeIngestMode === 'excel' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-400" />
                <span>Total Work Orders</span>
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {rawCaliberMaintenance.length}
              </div>
              <div className="text-[10px] text-teal-400 mt-0.5">All 8 Machines Covered</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Total Downtime</span>
              </div>
              <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                {totalDowntime.toFixed(1)} hrs
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{breakdownCount} Unplanned Breakdowns</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Total Maintenance Cost</span>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
                Rp {(totalCost / 1000000).toFixed(1)} M
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Labor + Material IDR</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>Join Key Status</span>
              </div>
              <div className="text-base font-bold font-mono text-cyan-300 mt-1">
                Equipment_Tag
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">100% Match with 8 Sets</div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Table className="w-4 h-4 text-emerald-400" />
                  <span>Maintenance History Records Explorer ({filteredMaintenance.length} Records)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Source: <strong className="text-slate-200">Maintenance History (All Equipment)-Maintenance History (All Equipm.csv</strong>
                </p>
              </div>

              {/* Upload New / Re-sync button */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputExcelRef}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleExcelFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <button
                  onClick={() => fileInputExcelRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-teal-400" />
                  <span>Import Newer CSV/Excel</span>
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={excelSearch}
                  onChange={(e) => setExcelSearch(e.target.value)}
                  placeholder="Search WO#, tag, symptom, root cause, or corrective action..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-400"
                />
              </div>

              {/* Tag filters */}
              <div className="flex flex-wrap items-center gap-1">
                {['ALL', 'GA-1201A', 'YD-2301', 'DC-3401A', 'KC-4501', 'EA-5601', 'LV-6701', 'CT-7801', 'FA-8901'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(tag)}
                    className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      filterTag === tag
                        ? 'bg-teal-600 text-white shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-[500px] rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">WO#</th>
                    <th className="p-2.5">Tag</th>
                    <th className="p-2.5">Report Date</th>
                    <th className="p-2.5">Work Type</th>
                    <th className="p-2.5">Problem Description</th>
                    <th className="p-2.5">Identified Root Cause</th>
                    <th className="p-2.5">Corrective Action Taken</th>
                    <th className="p-2.5">Downtime</th>
                    <th className="p-2.5">Cost (IDR)</th>
                    <th className="p-2.5">Interlock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                  {filteredMaintenance.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-mono font-bold text-slate-200 whitespace-nowrap">{r.woNumber}</td>
                      <td className="p-2.5 font-mono font-bold text-teal-400 whitespace-nowrap">{r.equipmentTag}</td>
                      <td className="p-2.5 font-mono text-slate-400 whitespace-nowrap">{r.reportDate.split(' ')[0]}</td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          r.workType === 'Corrective' ? 'bg-rose-950 text-rose-300' :
                          r.workType === 'Inspection' ? 'bg-cyan-950 text-cyan-300' :
                          r.workType === 'Overhaul' ? 'bg-purple-950 text-purple-300' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {r.workType}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-200 font-medium min-w-[200px]">{r.problemDescription}</td>
                      <td className="p-2.5 text-amber-300/90 text-[11px] min-w-[180px]">{r.rootCause}</td>
                      <td className="p-2.5 text-slate-300 text-[11px] min-w-[200px]">{r.correctiveAction}</td>
                      <td className="p-2.5 font-mono whitespace-nowrap">
                        {r.downtimeHours > 0 ? (
                          <span className="text-amber-400 font-bold">{r.downtimeHours} h</span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>
                      <td className="p-2.5 font-mono text-slate-300 whitespace-nowrap">Rp {r.totalCostIDR.toLocaleString()}</td>
                      <td className="p-2.5 font-mono text-cyan-400 whitespace-nowrap">{r.relatedInterlock || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: THE 8 MACHINE FOLDER SETS                             */}
      {/* ============================================================== */}
      {activeIngestMode === 'folderSets' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: 8 Machine Sets Selector (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>The 8 Machine Folder Sets</span>
                <span className="text-[10px] text-teal-400 font-mono">Select Set to Inspect</span>
              </h3>

              <div className="space-y-2">
                {machineFolderSets.map((mSet, idx) => {
                  const isSelected = selectedMachineSetIdx === idx;
                  return (
                    <div
                      key={mSet.setNumber}
                      onClick={() => setSelectedMachineSetIdx(idx)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-teal-950/70 border-teal-500/70 shadow-md ring-1 ring-teal-500/30'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-teal-400 uppercase font-mono">
                          SET 0{mSet.setNumber}
                        </span>
                        <span className="font-mono text-xs font-bold text-white">
                          {mSet.equipmentTag}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200 mt-1 line-clamp-1">
                        {mSet.folderName.replace(`Set_0${mSet.setNumber}_${mSet.equipmentTag}_`, '').replace(/_/g, ' ')}
                      </h4>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                        <span>{mSet.unit}</span>
                        <span className="text-cyan-400 font-medium">{mSet.files.length} Files</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Active Machine Set Detail (8 cols) */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              {(() => {
                const currentSet = machineFolderSets[selectedMachineSetIdx];
                return (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 font-bold font-mono">
                            FOLDER SET 0{currentSet.setNumber}
                          </span>
                          <span className="font-mono text-sm font-bold text-teal-300">
                            Tag: {currentSet.equipmentTag}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-1.5">{currentSet.folderName}</h3>
                        <p className="text-xs text-slate-400">{currentSet.equipmentName} · {currentSet.unit}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-emerald-400 font-mono font-bold block">
                          ✓ All 12 Files Indexed
                        </span>
                        <span className="text-[10px] text-slate-500">
                          1 Datasheet · 1 GA · 1 IL · 1 Plot · 1 P&ID · 7 OPLs
                        </span>
                      </div>
                    </div>

                    {/* Files List in this folder */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                        <span>Technical Documents in this Folder ({currentSet.files.length} Files)</span>
                        <span className="text-[10px] text-teal-400 font-mono">Click to View Original Document</span>
                      </h4>

                      <div className="space-y-2">
                        {currentSet.files.map((file, fIdx) => {
                          const fileUrl = getFileUrl(currentSet.folderName, file.name);
                          const isPdf = file.name.endsWith('.pdf');
                          const isPng = file.name.endsWith('.png');

                          return (
                            <div
                              key={fIdx}
                              className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-teal-400 shrink-0" />
                                  <span className="font-mono font-bold text-slate-200 truncate">{file.name}</span>
                                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0">
                                    {isPdf ? 'PDF' : isPng ? 'PNG' : file.type}
                                  </span>
                                </div>
                                {file.extractedSummary && (
                                  <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                                    {file.extractedSummary}
                                  </p>
                                )}
                              </div>

                              <button
                                onClick={() => openDocumentViewer({
                                  fileUrl,
                                  fileName: file.name,
                                  title: `${currentSet.equipmentTag} · ${file.name}`,
                                  fileType: isPdf ? 'pdf' : isPng ? 'image' : 'doc'
                                })}
                                className="px-3 py-1.5 rounded-lg bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-700/60 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 3: INTERACTIVE PPT PRESENTATION SLIDES                     */}
      {/* ============================================================== */}
      {activeIngestMode === 'ppt' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Slide Deck Viewer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
            {/* Top Presentation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold font-mono">
                    OFFICIAL PRESENTATION
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Slide {activeSlideIdx + 1} of {PPT_SLIDES_DATA.length}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  Technical Architecture: Manufacturing Knowledge & Asset Reliability System
                </h3>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSlideIdx((prev) => Math.max(0, prev - 1))}
                  disabled={activeSlideIdx === 0}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => setActiveSlideIdx((prev) => Math.min(PPT_SLIDES_DATA.length - 1, prev + 1))}
                  disabled={activeSlideIdx === PPT_SLIDES_DATA.length - 1}
                  className="px-3 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 disabled:opacity-40 text-amber-300 text-xs font-bold border border-amber-700/60 flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Current Slide Display */}
            {(() => {
              const slide = PPT_SLIDES_DATA[activeSlideIdx];
              return (
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-6">
                  {/* Slide Title */}
                  <div className="border-b border-slate-800/80 pb-3">
                    <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block">
                      Slide {slide.slideNumber}
                    </span>
                    <h4 className="text-xl font-bold text-white mt-1">{slide.title}</h4>
                    {slide.purpose && (
                      <p className="text-xs text-slate-300 mt-1 italic">{slide.purpose}</p>
                    )}
                    {slide.tag && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-mono font-bold text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                          {slide.tag}
                        </span>
                        <span className="text-xs text-slate-400">{slide.service}</span>
                      </div>
                    )}
                  </div>

                  {/* Slide 1 Grid */}
                  {slide.columns && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {slide.columns.map((col, cIdx) => (
                        <div key={cIdx} className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                          <h5 className="text-xs font-bold text-teal-300 uppercase tracking-wider">{col.title}</h5>
                          <ul className="space-y-1.5 text-xs text-slate-300 pl-4 list-disc marker:text-teal-400">
                            {col.items.map((it, itIdx) => (
                              <li key={itIdx}>{it}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Detail Breakdown for Machine Slides */}
                  {slide.whatItShows && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                          1. What It Shows
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">{slide.whatItShows}</p>
                      </div>

                      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                          2. What Can Be Extracted
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">{slide.whatCanBeExtracted}</p>
                      </div>

                      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                          3. How It Is Useful (Knowledge Hub)
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">{slide.howItIsUseful}</p>
                      </div>
                    </div>
                  )}

                  {/* Takeaway */}
                  {slide.takeaway && (
                    <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200">
                      <strong>Core Takeaway:</strong> {slide.takeaway}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Slide Quick Picker */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              {PPT_SLIDES_DATA.map((s, idx) => (
                <button
                  key={s.slideNumber}
                  onClick={() => setActiveSlideIdx(idx)}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                    activeSlideIdx === idx
                      ? 'bg-amber-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Slide {s.slideNumber}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
