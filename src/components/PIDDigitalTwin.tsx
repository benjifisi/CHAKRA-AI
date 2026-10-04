import React, { useState } from 'react';
import { EQUIPMENT_DATABASE, EquipmentTag, PlantUnit } from '../data/plantData';
import { EQUIPMENT_DOCUMENTS_MAP } from '../data/caliberRealData';
import { useKnowledge } from '../context/KnowledgeContext';
import { MachineVectorOverlay } from './MachineVectorOverlay';
import { 
  Layers, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  FileText, 
  ShieldCheck, 
  Maximize2, 
  Eye,
  Download,
  Image as ImageIcon,
  Cpu,
  Search,
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface PIDDigitalTwinProps {
  selectedUnit: PlantUnit;
  targetTag?: string | null;
  onOpenDocument?: (docId: string) => void;
  onSelectTag?: (tag: string) => void;
  onNavigateToSopStep?: (sopId: string, stepNumber: number) => void;
}

const SET_PIDS = [
  { set: 1, tag: 'GA-1201A', name: 'HEXANE FEED PUMP', code: 'PID_SET_01', image: '/public/pid/pid_set_01.png' },
  { set: 2, tag: 'YD-2301', name: 'POLYMER FLUID BED DRYER', code: 'PID_SET_02', image: '/public/pid/pid_set_02.png' },
  { set: 3, tag: 'DC-3401A', name: 'CATALYST REDUCTION REACTOR', code: 'PID_SET_03', image: '/public/pid/pid_set_03.png' },
  { set: 4, tag: 'KC-4501', name: 'RECYCLE GAS COMPRESSOR', code: 'PID_SET_04', image: '/public/pid/pid_set_04.png' },
  { set: 5, tag: 'EA-5601', name: 'SOLVENT HEATER', code: 'PID_SET_05', image: '/public/pid/pid_set_05.png' },
  { set: 6, tag: 'LV-6701', name: 'SEPARATOR LEVEL CONTROL VALVE', code: 'PID_SET_06', image: '/public/pid/pid_set_06.png' },
  { set: 7, tag: 'CT-7801', name: 'COOLING TOWER CELL FAN', code: 'PID_SET_07', image: '/public/pid/pid_set_07.png' },
  { set: 8, tag: 'FA-8901', name: 'REFLUX ACCUMULATOR DRUM', code: 'PID_SET_08', image: '/public/pid/pid_set_08.png' },
];

export const PIDDigitalTwin: React.FC<PIDDigitalTwinProps> = ({
  selectedUnit,
  targetTag,
  onOpenDocument,
  onSelectTag,
  onNavigateToSopStep,
}) => {
  const { openDocumentViewer } = useKnowledge();
  const [selectedSetIdx, setSelectedSetIdx] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'raster' | 'vector'>('raster');
  const [simulationState, setSimulationState] = useState<'NORMAL' | 'UPSET_VIBRATION' | 'SEAL_LEAK'>('NORMAL');

  // Synchronize active machine set if targetTag is provided from external navigation
  React.useEffect(() => {
    if (targetTag) {
      const idx = SET_PIDS.findIndex((p) => p.tag === targetTag);
      if (idx !== -1) {
        setSelectedSetIdx(idx);
      }
    }
  }, [targetTag]);

  const currentSet = SET_PIDS[selectedSetIdx];
  const activeEquipment = EQUIPMENT_DATABASE.find((e) => e.tag === currentSet.tag) || EQUIPMENT_DATABASE[0];
  const docInfo = EQUIPMENT_DOCUMENTS_MAP[currentSet.tag] || {};

  // Instrument & Valve Hotspots per machine set for P&ID <-> SOP cross-navigation
  const getHotspotsForTag = (tag: string) => {
    switch (tag) {
      case 'GA-1201A':
        return [
          {
            tag: 'XV-1201',
            name: 'Suction Isolation Valve',
            condition: '100% Full Open Permissive',
            sopId: 'sop-lld-1201',
            stepNumber: 2,
            sopAction: 'Step 2: Verify XV-1201 is 100% open with limit switch feedback.',
          },
          {
            tag: 'High-Point Bleeder',
            name: 'Casing Venting Bleeder',
            condition: '180s Continuous Venting',
            sopId: 'sop-lld-1201',
            stepNumber: 3,
            sopAction: 'Step 3: Crack casing bleeder into closed slop drain to prevent seal vapor lock.',
          },
          {
            tag: 'PDI-1201',
            name: 'API Plan 11 Seal Flush dP',
            condition: '>= 1.5 bar (Start Permissive)',
            sopId: 'sop-lld-1201',
            stepNumber: 4,
            sopAction: 'Step 4: Verify Plan 11+62 seal flush dP exceeds 1.5 bar.',
          },
          {
            tag: 'FV-1201',
            name: 'Minimum Flow Recirculation Valve',
            condition: '100% Open at Startup (9 m³/h)',
            sopId: 'sop-lld-1201',
            stepNumber: 5,
            sopAction: 'Step 5: Confirm minimum flow line to slop tank is unobstructed.',
          },
          {
            tag: 'M-1201A',
            name: 'Drive Motor & E-Stop',
            condition: '30 kW 2-Pole (2950 RPM)',
            sopId: 'sop-lld-1201',
            stepNumber: 6,
            sopAction: 'Step 6: Press local start pushbutton; verify amperage within FLA.',
          },
        ];
      case 'YD-2301':
        return [
          {
            tag: 'SCM440 Drive',
            name: 'Dryer Drive Chain & Sprocket',
            condition: 'ISO VG 220 Lube Verified',
            sopId: 'sop-lld-2301',
            stepNumber: 1,
            sopAction: 'Step 1: Inspect trunnion bearings and drive chain oil level.',
          },
          {
            tag: 'ASHH-2307',
            name: 'Oxygen Concentration Analyzer',
            condition: '< 100 ppm O2 Permissive',
            sopId: 'sop-lld-2301',
            stepNumber: 2,
            sopAction: 'Step 2: Verify N2 purge cycle achieves < 100 ppm O2.',
          },
          {
            tag: 'Kadant Joint',
            name: 'Rotary Steam Joint Seal Face',
            condition: 'Seal Barrier DP >= 0.5 bar',
            sopId: 'sop-lld-2301',
            stepNumber: 3,
            sopAction: 'Step 3: Inspect rotary steam joint and barrier gas tightness.',
          },
          {
            tag: 'FT-2301',
            name: 'Fluidizing Gas Flow Controller',
            condition: '>= 450 Nm³/h Flow Permissive',
            sopId: 'sop-lld-2301',
            stepNumber: 4,
            sopAction: 'Step 4: Start recirculation blower; verify minimum gas velocity.',
          },
        ];
      case 'DC-3401A':
        return [
          {
            tag: 'AI-3401',
            name: 'Reactor Bed O2 Freeing Analyzer',
            condition: '< 10 ppm O2 (Interlock T3)',
            sopId: 'sop-lld-3401',
            stepNumber: 1,
            sopAction: 'Step 1: Circulate ultra-pure N2 until O2 is below 10 ppm.',
          },
          {
            tag: 'EA-3401',
            name: 'Electric Bed Pre-Heater',
            condition: 'TIC-17343 < 280°C Skin Limit',
            sopId: 'sop-lld-3401',
            stepNumber: 2,
            sopAction: 'Step 2: Energize circulation heater with sheath temp protection.',
          },
          {
            tag: 'MFC-3402',
            name: 'Hydrogen Feed Mass Flow Controller',
            condition: '<= 5 kg/h per 10 min Ramp Limit',
            sopId: 'sop-lld-3401',
            stepNumber: 3,
            sopAction: 'Step 3: Introduce micro-metered H2 feed per OPL-DC-3401A-04.',
          },
          {
            tag: 'TSHH-3401',
            name: 'Multipoint Bed Thermocouple (2oo3)',
            condition: 'Normal 185°C · Trip 230°C',
            sopId: 'sop-lld-3401',
            stepNumber: 4,
            sopAction: 'Step 4: Monitor multipoint bed thermocouple reaction exotherm front.',
          },
        ];
      case 'KC-4501':
        return [
          {
            tag: 'PSLL-4504',
            name: 'Lube Oil Header Pressure Switch',
            condition: '>= 2.5 barg Permissive',
            sopId: 'sop-lld-4501',
            stepNumber: 1,
            sopAction: 'Step 1: Start auxiliary lube oil pump P1 and verify pressure.',
          },
          {
            tag: 'FT-4506',
            name: 'N2 Seal Gas Buffer Flow Meter',
            condition: '>= 15 Nm³/h (Permissive 2)',
            sopId: 'sop-lld-4501',
            stepNumber: 2,
            sopAction: 'Step 2: Confirm nitrogen buffer flow and positive dP.',
          },
          {
            tag: 'LT-4510',
            name: 'Suction KO Drum Level Transmitter',
            condition: '< 10% Level (Condensate Cleared)',
            sopId: 'sop-lld-4501',
            stepNumber: 3,
            sopAction: 'Step 3: Drain condensate from suction KO drum FA-4510.',
          },
          {
            tag: 'FV-4502',
            name: 'Anti-Surge Recycle Valve',
            condition: '100% Full Open Recirculation',
            sopId: 'sop-lld-4501',
            stepNumber: 4,
            sopAction: 'Step 4: Verify anti-surge recycle valve is 100% open before rolling.',
          },
          {
            tag: 'VSHH-4505',
            name: 'Crosshead Vibration Transmitter',
            condition: 'Baseline 14 µm · Trip 28 µm',
            sopId: 'sop-lld-4501',
            stepNumber: 5,
            sopAction: 'Step 5: Verify crosshead acceleration vibration envelope.',
          },
        ];
      case 'EA-5601':
        return [
          {
            tag: 'Solvent Inlet',
            name: 'Hexane Process Circulation Loop',
            condition: '>= 120 m³/h Steady Flow',
            sopId: 'sop-lld-5601',
            stepNumber: 1,
            sopAction: 'Step 1: Establish steady solvent circulation before steam admission.',
          },
          {
            tag: 'TI-5604',
            name: 'Steam Trap Condensate Bypass',
            condition: 'Condensate Cleared (Dry Steam)',
            sopId: 'sop-lld-5601',
            stepNumber: 2,
            sopAction: 'Step 2: Crack condensate bypass valves to clear cold water.',
          },
          {
            tag: 'Warmup Bypass',
            name: 'Manual Warmup Bypass Valve',
            condition: '15-min Ramp (<= 5°C/min)',
            sopId: 'sop-lld-5601',
            stepNumber: 3,
            sopAction: 'Step 3: Execute mandatory 15-min gradual steam warmup (OPL-EA-5601-04).',
          },
          {
            tag: 'PDT-5605',
            name: 'Tube Differential Pressure Transmitter',
            condition: '<= 0.35 bar (Clean Baseline)',
            sopId: 'sop-lld-5601',
            stepNumber: 4,
            sopAction: 'Step 4: Verify tube differential pressure and absence of fouling.',
          },
          {
            tag: 'TV-5602',
            name: 'Steam Temperature Control Valve',
            condition: 'Cascade Auto at 145°C',
            sopId: 'sop-lld-5601',
            stepNumber: 5,
            sopAction: 'Step 5: Transfer TV-5602 to DCS cascade auto mode.',
          },
        ];
      case 'LV-6701':
        return [
          {
            tag: 'PI-6702',
            name: 'Actuator Air Supply Gauge',
            condition: '>= 1.2 barg Air Supply',
            sopId: 'sop-lld-6701',
            stepNumber: 1,
            sopAction: 'Step 1: Check instrument air supply pressure and zero diaphragm leaks.',
          },
          {
            tag: 'DVC6200',
            name: 'Fisher Digital Valve Controller',
            condition: 'Travel Deviation < 1.0%',
            sopId: 'sop-lld-6701',
            stepNumber: 2,
            sopAction: 'Step 2: Validate DVC6200 diagnostics and stem travel feedback.',
          },
          {
            tag: 'HV-6701',
            name: 'Manual Equalizer Bypass Valve',
            condition: '100% Closed & Locked',
            sopId: 'sop-lld-6701',
            stepNumber: 3,
            sopAction: 'Step 3: Verify manual bypass equalizer HV-6701 is closed.',
          },
          {
            tag: 'LSHH-6710',
            name: 'High Level Trip Safety Interlock',
            condition: 'Fast Open Response (< 2.5s)',
            sopId: 'sop-lld-6701',
            stepNumber: 4,
            sopAction: 'Step 4: Test DCS emergency high-level trip fast-opening response.',
          },
        ];
      case 'CT-7801':
        return [
          {
            tag: 'LSL-7804',
            name: 'Cold Water Basin Level Switch',
            condition: 'Normal Operating Level',
            sopId: 'sop-lld-7801',
            stepNumber: 1,
            sopAction: 'Step 1: Confirm cooling tower basin water level is healthy.',
          },
          {
            tag: 'PSL-7807',
            name: 'Gearbox Lube Oil Pressure Switch',
            condition: '>= 0.8 barg (Trip on Low)',
            sopId: 'sop-lld-7801',
            stepNumber: 2,
            sopAction: 'Step 2: Check reduction gearbox oil level and pressure switch.',
          },
          {
            tag: 'Blade Shroud',
            name: 'FRP Fan Blade Tip Clearance',
            condition: '>= 25 mm Radial Clearance',
            sopId: 'sop-lld-7801',
            stepNumber: 3,
            sopAction: 'Step 3: Rotate fan blade by hand through 360° to verify clearance.',
          },
          {
            tag: 'VSHH-7802',
            name: 'Cell Vibration High-High Transmitter',
            condition: '<= 3.2 mm/s RMS (Trip: 9.0 mm/s)',
            sopId: 'sop-lld-7801',
            stepNumber: 5,
            sopAction: 'Step 5: Measure and sign off overall dynamic vibration envelope.',
          },
        ];
      case 'FA-8901':
        return [
          {
            tag: 'PCV-8905',
            name: 'Nitrogen Blanket & Flare Vent Valve',
            condition: '4.5 barg Positive Pad',
            sopId: 'sop-lld-8901',
            stepNumber: 1,
            sopAction: 'Step 1: Verify N2 blanket pressure and flare vent valve readiness.',
          },
          {
            tag: 'HV-8904',
            name: 'Manual Water Boot Drain Valve',
            condition: 'Free Water Drained Clean',
            sopId: 'sop-lld-8901',
            stepNumber: 2,
            sopAction: 'Step 2: Crack water boot drain valve until clear solvent appears.',
          },
          {
            tag: 'LT-8901A/B',
            name: 'Dual Redundant Level Transmitters',
            condition: 'DCS Deviation < 2.0%',
            sopId: 'sop-lld-8901',
            stepNumber: 3,
            sopAction: 'Step 3: Cross-check redundant magnetic level transmitters.',
          },
          {
            tag: 'LSLL-8901',
            name: 'Low-Low Level Trip Interlock',
            condition: 'Level > 20% (Permissive Cleared)',
            sopId: 'sop-lld-8901',
            stepNumber: 4,
            sopAction: 'Step 4: Verify low level trip is cleared before starting reflux pump.',
          },
        ];
      default:
        return [
          {
            tag: `XV-${tag.replace(/[^0-9]/g, '') || '01'}`,
            name: `${tag} Main Process Isolation Valve`,
            condition: 'Verified In-Line Permissive',
            sopId: 'sop-lld-1201',
            stepNumber: 2,
            sopAction: 'Step 2: Confirm process line-up and isolation status.',
          },
          {
            tag: `PDI-${tag.replace(/[^0-9]/g, '') || '01'}`,
            name: `${tag} Differential Pressure Loop`,
            condition: 'Within Safe Operating Limit',
            sopId: 'sop-lld-1201',
            stepNumber: 4,
            sopAction: 'Step 4: Check instrumentation loop calibration.',
          },
          {
            tag: `SIS-${tag.replace(/[^0-9]/g, '') || '01'}`,
            name: `${tag} Emergency Trip Interlock`,
            condition: 'Armed & Active (Zero Faults)',
            sopId: 'sop-lld-1201',
            stepNumber: 6,
            sopAction: 'Step 6: Monitor permissives on DCS console.',
          },
        ];
    }
  };

  // Dynamic telemetry depending on simulation state
  const currentTelemetry = {
    vibration: simulationState === 'UPSET_VIBRATION' ? 6.8 : (activeEquipment.liveDCS.vibration || 2.1),
    dischargePress: simulationState === 'SEAL_LEAK' ? 18.2 : activeEquipment.liveDCS.dischargePressure,
    sealDP: simulationState === 'SEAL_LEAK' ? 0.7 : (activeEquipment.liveDCS.sealDP || 2.2),
    flow: activeEquipment.liveDCS.flow,
    temp: simulationState === 'UPSET_VIBRATION' ? 48.2 : activeEquipment.liveDCS.temperature,
    status: (simulationState === 'NORMAL' ? 'NORMAL' : 'WARNING') as 'NORMAL' | 'WARNING' | 'TRIP',
  };

  const handleOpenPdf = (fileUrl: string, fileName: string, title: string) => {
    if (!fileUrl) return;
    openDocumentViewer({
      fileUrl,
      fileName,
      title,
      fileType: 'pdf'
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-gradient-to-b from-cyan-950/60 to-slate-950 border-2 border-cyan-500/60 shadow-xl shadow-cyan-950/40 flex items-center justify-center p-1">
                <img 
                  src="/mascots/mascot-pointing.png" 
                  alt="CHAKRA P&ID Twin Mascot" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 text-[9px] font-mono font-bold uppercase tracking-wider shadow">
                TWIN
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
                <Layers className="w-4 h-4" />
                <span>DIGITAL TWIN & EDMS INTEGRATION · 8 CRITICAL MACHINE SETS GROUNDED</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Interactive As-Built P&ID & Live Asset Telemetry
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Explore authentic high-resolution P&ID schematics, live DCS telemetry, and instantly open verified engineering documents (Datasheets, GA Drawings, Interlock Logic, and Plot Plans) connected via <strong>Equipment Tag</strong> join key.
              </p>
            </div>
          </div>

          {/* Simulation & View Controls */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
            <div className="flex items-center rounded bg-slate-900 p-0.5 border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('raster')}
                className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'raster' ? 'bg-teal-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>As-Built P&ID Drawing</span>
              </button>
              <button
                onClick={() => setViewMode('vector')}
                className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'vector' ? 'bg-teal-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Interactive DCS Overlay</span>
              </button>
            </div>

            <div className="h-5 w-[1px] bg-slate-800 hidden sm:block"></div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSimulationState('NORMAL')}
                className={`px-2 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                  simulationState === 'NORMAL' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setSimulationState('UPSET_VIBRATION')}
                className={`px-2 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                  simulationState === 'UPSET_VIBRATION' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Vib Alarm
              </button>
              <button
                onClick={() => setSimulationState('SEAL_LEAK')}
                className={`px-2 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                  simulationState === 'SEAL_LEAK' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Seal DP Low
              </button>
            </div>
          </div>
        </div>

        {/* 8 Machine Sets Selector Tabs */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Select P&ID Machine Set (1 through 8):</span>
            <span className="text-teal-400 font-mono">Join Key: Equipment_Tag</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {SET_PIDS.map((p, idx) => {
              const isSelected = selectedSetIdx === idx;
              return (
                <button
                  key={p.set}
                  onClick={() => setSelectedSetIdx(idx)}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-950/80 border-teal-500/80 text-white shadow-sm ring-1 ring-teal-500/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[9px] font-bold uppercase tracking-wider text-teal-400 font-mono">
                    SET 0{p.set}
                  </div>
                  <div className="text-xs font-bold font-mono text-white mt-0.5 truncate">
                    {p.tag}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {p.name.split(' ')[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Interactive Diagram & Context Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Schematic Viewport (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl overflow-hidden relative flex flex-col justify-between">
          
          {/* Top Controls Overlay */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
              <span className="font-mono text-slate-300 font-bold">
                {currentSet.code} · {currentSet.tag} ({currentSet.name})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openDocumentViewer({
                  fileUrl: currentSet.image,
                  fileName: `${currentSet.code}.png`,
                  title: `P&ID Drawing · Set 0${currentSet.set} · ${currentSet.tag}`,
                  fileType: 'image'
                })}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-teal-300 text-[11px] font-medium border border-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Fullscreen P&ID</span>
              </button>
            </div>
          </div>

          {/* Schematic Content: Raster vs Vector */}
          <div className="relative py-3 flex items-center justify-center min-h-[460px]">
            {viewMode === 'raster' ? (
              <div className="w-full flex flex-col items-center justify-center group relative">
                <img
                  src={currentSet.image}
                  alt={`P&ID Diagram for ${currentSet.tag}`}
                  className="max-h-[460px] w-auto object-contain rounded-lg border border-slate-800 shadow-lg cursor-zoom-in hover:brightness-105 transition-all"
                  onClick={() => openDocumentViewer({
                    fileUrl: currentSet.image,
                    fileName: `${currentSet.code}.png`,
                    title: `P&ID Drawing · Set 0${currentSet.set} · ${currentSet.tag}`,
                    fileType: 'image'
                  })}
                />
                <div className="mt-2 text-[11px] text-slate-400 font-mono flex items-center gap-2">
                  <span>As-Built Engineering P&ID Drawing · Click image to enlarge in HD</span>
                </div>
              </div>
            ) : (
              /* Dedicated Tailored CAD Vector Overlay per Machine Set */
              <div className="w-full h-auto max-h-[460px] overflow-hidden rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-center shadow-inner">
                <MachineVectorOverlay
                  setNumber={currentSet.set}
                  tag={currentSet.tag}
                  name={currentSet.name}
                  interlockSequence={activeEquipment.interlockSequence || `SEQ-${currentSet.tag.replace(/[^0-9]/g, '')}`}
                  telemetry={currentTelemetry}
                />
              </div>
            )}
          </div>

          {/* Bottom quick-action bar */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div>
              Active Asset: <strong className="text-teal-300 font-mono">{currentSet.tag}</strong> ({currentSet.name})
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400 font-mono">EDMS Status: Approved As-Built Rev 3</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400 font-mono">4 Documents Linked</span>
            </div>
          </div>

          {/* Interactive Instrument & Valve Hotspots Tray (Improvement B: P&ID -> SOP Cross-Navigation) */}
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <Sliders className="w-3.5 h-3.5 text-teal-400" />
                <span>P&ID Instrument & Valve Lineup (Click to Cross-Navigate into SOP Step):</span>
              </div>
              <span className="text-[10px] text-teal-400 font-mono bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/60">
                Direct Execution Guard Integration
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {getHotspotsForTag(currentSet.tag).map((hs, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-teal-500/50 flex flex-col justify-between gap-1.5 transition-all group shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-teal-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                          {hs.tag}
                        </span>
                        <span className="text-xs font-medium text-slate-200">{hs.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        Normal / Permissive: <span className="text-amber-300">{hs.condition}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
                    <span className="text-slate-400 truncate max-w-[200px]" title={hs.sopAction}>
                      {hs.sopAction}
                    </span>
                    {onNavigateToSopStep && (
                      <button
                        onClick={() => onNavigateToSopStep(hs.sopId, hs.stepNumber)}
                        className="px-2 py-1 rounded bg-teal-950/80 hover:bg-teal-900 text-teal-300 font-medium border border-teal-700/60 flex items-center gap-1 transition-colors text-[10px] shrink-0 cursor-pointer shadow"
                        title="Jump to verified step in Execution Guard"
                      >
                        <span>Jump to Step {hs.stepNumber}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Context Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Real-time DCS Gauge Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live DCS Telemetry · {currentSet.tag}
                </h3>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  currentTelemetry.status === 'NORMAL'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                    : 'bg-rose-950 text-rose-300 border border-rose-800/50 animate-pulse'
                }`}
              >
                {currentTelemetry.status}
              </span>
            </div>

            <div className="space-y-3">
              {activeEquipment.operatingLimits.dischargePressure && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Pressure:</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {currentTelemetry.dischargePress} / {activeEquipment.operatingLimits.dischargePressure.tripHigh} barg
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (currentTelemetry.dischargePress / parseFloat(activeEquipment.operatingLimits.dischargePressure.tripHigh)) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {activeEquipment.liveDCS.vibration !== undefined && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Vibration:</span>
                    <span className={`font-mono font-bold ${currentTelemetry.vibration > 4.5 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {currentTelemetry.vibration} mm/s (Trip: 4.5)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        currentTelemetry.vibration > 4.5 ? 'bg-rose-500' : 'bg-teal-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (currentTelemetry.vibration / 6.5) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Operating Temperature:</span>
                  <span className="font-mono text-slate-200 font-bold">
                    {currentTelemetry.temp} °C
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (currentTelemetry.temp / 80) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Diagnostic Alert message if simulated */}
            {simulationState !== 'NORMAL' && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 space-y-1 animate-fadeIn">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Abnormal Operating Excursion Detected</span>
                </div>
                <p className="text-[11px] text-rose-300/80 leading-relaxed">
                  {simulationState === 'UPSET_VIBRATION'
                    ? `Vibration trip limit exceeded on ${currentSet.tag}. Initiates automated trip sequence ${activeEquipment.interlockSequence || 'SEQ'}.`
                    : `Low Seal DP detected on ${currentSet.tag}. Inner barrier seal compromised.`}
                </p>
              </div>
            )}
          </div>

          {/* Connected Verified Documents (Datasheet, GA, Interlock, Plot Plan) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-400" />
                <span>Verified Engineering Documents</span>
              </span>
              <span className="text-[10px] text-teal-400 font-mono">EDMS Live</span>
            </h4>

            <div className="space-y-2 text-xs">
              {/* Datasheet */}
              {docInfo.datasheet && (
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono font-bold text-teal-300 truncate">Datasheet: {currentSet.tag}</div>
                    <div className="text-[10px] text-slate-400 truncate">{docInfo.datasheetName}</div>
                  </div>
                  <button
                    onClick={() => handleOpenPdf(docInfo.datasheet, docInfo.datasheetName, `Equipment Datasheet · ${currentSet.tag}`)}
                    className="px-2.5 py-1 rounded bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-700/60 text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View PDF</span>
                  </button>
                </div>
              )}

              {/* GA Drawing */}
              {docInfo.gaDrawing && (
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono font-bold text-cyan-300 truncate">GA Drawing: {currentSet.tag}</div>
                    <div className="text-[10px] text-slate-400 truncate">{docInfo.gaDrawingName}</div>
                  </div>
                  <button
                    onClick={() => handleOpenPdf(docInfo.gaDrawing, docInfo.gaDrawingName, `Equipment GA Drawing · ${currentSet.tag}`)}
                    className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View PDF</span>
                  </button>
                </div>
              )}

              {/* Interlock Diagram */}
              {docInfo.interlock && (
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono font-bold text-amber-300 truncate">Interlock Logic & C&E Matrix</div>
                    <div className="text-[10px] text-slate-400 truncate">{docInfo.interlockName}</div>
                  </div>
                  <button
                    onClick={() => handleOpenPdf(docInfo.interlock, docInfo.interlockName, `Interlock Logic Diagram · ${currentSet.tag}`)}
                    className="px-2.5 py-1 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-700/60 text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View PDF</span>
                  </button>
                </div>
              )}

              {/* Plot Plan */}
              {docInfo.plotPlan && (
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono font-bold text-slate-200 truncate">Plot Plan: {currentSet.tag}</div>
                    <div className="text-[10px] text-slate-400 truncate">{docInfo.plotPlanName}</div>
                  </div>
                  <button
                    onClick={() => handleOpenPdf(docInfo.plotPlan, docInfo.plotPlanName, `Plot Plan · ${currentSet.tag}`)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View PDF</span>
                  </button>
                </div>
              )}
            </div>

            {/* AIMS Remaining Life Badge */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">AIMS Wall Thickness:</span>
              <span className="font-mono text-emerald-400 font-bold">
                {activeEquipment.aimsData.measuredWallThicknessMm} mm ({activeEquipment.aimsData.remainingLifeYears} yrs life)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
