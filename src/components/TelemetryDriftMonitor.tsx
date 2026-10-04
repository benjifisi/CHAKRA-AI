import React, { useState, useEffect, useMemo } from 'react';
import { EQUIPMENT_DATABASE, EquipmentTag } from '../data/plantData';
import { 
  Activity, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Gauge, 
  Zap, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Play, 
  Pause, 
  RefreshCw, 
  Sliders, 
  Cpu, 
  Layers, 
  FileText, 
  Sparkles, 
  Wrench,
  Radio,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export type DriftScenario = 
  | 'NORMAL'
  | 'GA_1201A_SEAL_FLUSH_DRIFT'
  | 'KC_4501_VIBRATION_DRIFT'
  | 'YD_2301_TEMP_RUNAWAY'
  | 'LV_6701_CAVITATION_DRIFT';

interface TelemetryPoint {
  time: string;
  pressure: number;
  temperature: number;
  vibration: number;
  flow: number;
  customParam: number; // e.g. seal flush DP or O2%
}

interface TelemetryDriftMonitorProps {
  onOpenDocument?: (docId: string) => void;
  onOpenExecutionChecklist?: (tag: string) => void;
  onSelectTag?: (tag: string) => void;
}

export const TelemetryDriftMonitor: React.FC<TelemetryDriftMonitorProps> = ({
  onOpenDocument,
  onOpenExecutionChecklist,
  onSelectTag,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('GA-1201A');
  const [activeScenario, setActiveScenario] = useState<DriftScenario>('GA_1201A_SEAL_FLUSH_DRIFT');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simStep, setSimStep] = useState<number>(12); // Starting with active drift for immediate visibility

  // Historical trend points (last 16 intervals)
  const [history, setHistory] = useState<Record<string, TelemetryPoint[]>>({});

  const activeEquipment = useMemo(() => {
    return EQUIPMENT_DATABASE.find((e) => e.tag === selectedTag) || EQUIPMENT_DATABASE[0];
  }, [selectedTag]);

  // Simulation Engine: Calculates live telemetry and detects drift before SIS trip
  const calculateTelemetry = (tag: string, step: number, scenario: DriftScenario) => {
    const base = EQUIPMENT_DATABASE.find((e) => e.tag === tag) || EQUIPMENT_DATABASE[0];
    const limits = base.operatingLimits;

    // Default healthy nominal values with minor brownian noise
    const noise = (Math.sin(step * 0.7) + Math.cos(step * 1.3)) * 0.05;
    
    let pressure = Number(limits.dischargePressure?.normal || 18.5) + noise * 0.4;
    let temperature = Number(limits.temperature?.normal || 35.0) + noise * 1.2;
    let vibration = Number(limits.vibration?.normal || 1.8) + noise * 0.15;
    let flow = Number(limits.flowRate?.normal || 24.0) + noise * 0.5;
    let customParam = 2.1 + noise * 0.05; // Plan 11 Flush DP for GA-1201A

    let driftStage: 'OPTIMAL' | 'WATCH' | 'PRE_INCIDENT' | 'TRIP_BREACH' = 'OPTIMAL';
    let driftParameterName = 'Nominal Steady State';
    let tripLimitValue = 0;
    let etaMinutes = 0;

    // Apply Scenario Injections
    if (tag === 'GA-1201A' && scenario === 'GA_1201A_SEAL_FLUSH_DRIFT') {
      // Seal flush DP drifts from 2.1 down towards 1.5 bar trip
      const driftMagnitude = Math.min(step * 0.038, 0.58);
      customParam = Math.max(2.1 - driftMagnitude + noise * 0.02, 1.48);
      // Frictional heat builds up from restricted seal flush
      temperature = Math.min(35.0 + driftMagnitude * 68 + noise * 0.5, 78.5);
      // Slight vibration creep
      vibration = Math.min(1.8 + driftMagnitude * 1.8 + noise * 0.1, 3.2);

      driftParameterName = 'PDI-1201 API Plan 11 Flush Differential Pressure';
      tripLimitValue = 1.5; // Trip low limit

      if (customParam <= 1.5) {
        driftStage = 'TRIP_BREACH';
        etaMinutes = 0;
      } else if (customParam <= 1.68) {
        driftStage = 'PRE_INCIDENT';
        etaMinutes = Math.max(1, Math.round((customParam - 1.5) / 0.04));
      } else if (customParam <= 1.88) {
        driftStage = 'WATCH';
        etaMinutes = Math.round((customParam - 1.5) / 0.04);
      }
    } else if (tag === 'KC-4501' && scenario === 'KC_4501_VIBRATION_DRIFT') {
      // Crosshead & radial vibration spike towards 9.0 mm/s VSHH-4505 trip
      const driftMagnitude = Math.min(step * 0.35, 6.5);
      vibration = Math.min(2.4 + driftMagnitude + noise * 0.2, 9.2);
      temperature = Math.min(88.0 + driftMagnitude * 3.5, 122.0);

      driftParameterName = 'VSHH-4505 Crosshead & Frame Vibration RMS';
      tripLimitValue = 9.0;

      if (vibration >= 9.0) {
        driftStage = 'TRIP_BREACH';
      } else if (vibration >= 6.8) {
        driftStage = 'PRE_INCIDENT';
        etaMinutes = Math.max(1, Math.round((9.0 - vibration) / 0.4));
      } else if (vibration >= 4.2) {
        driftStage = 'WATCH';
        etaMinutes = Math.round((9.0 - vibration) / 0.4);
      }
    } else if (tag === 'YD-2301' && scenario === 'YD_2301_TEMP_RUNAWAY') {
      // Polymer Bed Temperature ramp excursion towards 95°C TSHH-2301 trip
      const driftMagnitude = Math.min(step * 1.8, 38.0);
      temperature = Math.min(58.0 + driftMagnitude + noise * 0.8, 97.0);

      driftParameterName = 'TSHH-2301 Fluidized Polymer Bed Temperature';
      tripLimitValue = 95.0;

      if (temperature >= 95.0) {
        driftStage = 'TRIP_BREACH';
      } else if (temperature >= 82.0) {
        driftStage = 'PRE_INCIDENT';
        etaMinutes = Math.max(1, Math.round((95.0 - temperature) / 2.0));
      } else if (temperature >= 68.0) {
        driftStage = 'WATCH';
        etaMinutes = Math.round((95.0 - temperature) / 2.0);
      }
    } else if (tag === 'LV-6701' && scenario === 'LV_6701_CAVITATION_DRIFT') {
      // Flashing & cavitation vibration spike
      const driftMagnitude = Math.min(step * 0.28, 4.8);
      vibration = Math.min(1.4 + driftMagnitude + noise * 0.2, 5.8);

      driftParameterName = 'Acoustic / Cavitation Vibration Sensor';
      tripLimitValue = 5.0;

      if (vibration >= 5.0) {
        driftStage = 'TRIP_BREACH';
      } else if (vibration >= 3.6) {
        driftStage = 'PRE_INCIDENT';
        etaMinutes = Math.max(1, Math.round((5.0 - vibration) / 0.3));
      } else if (vibration >= 2.5) {
        driftStage = 'WATCH';
        etaMinutes = Math.round((5.0 - vibration) / 0.3);
      }
    }

    return {
      pressure: Number(pressure.toFixed(2)),
      temperature: Number(temperature.toFixed(1)),
      vibration: Number(vibration.toFixed(2)),
      flow: Number(flow.toFixed(1)),
      customParam: Number(customParam.toFixed(2)),
      driftStage,
      driftParameterName,
      tripLimitValue,
      etaMinutes,
    };
  };

  // Live simulation tick every 2.5 seconds
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSimStep((prev) => prev + 1);

      setHistory((prevHistory) => {
        const updated = { ...prevHistory };
        EQUIPMENT_DATABASE.forEach((eq) => {
          const reading = calculateTelemetry(eq.tag, simStep, activeScenario);
          const currentList = updated[eq.tag] || [];
          const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

          const newPoint: TelemetryPoint = {
            time: nowStr,
            pressure: reading.pressure,
            temperature: reading.temperature,
            vibration: reading.vibration,
            flow: reading.flow,
            customParam: reading.customParam,
          };

          updated[eq.tag] = [...currentList.slice(-15), newPoint];
        });
        return updated;
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isSimulating, simStep, activeScenario]);

  // Current active telemetry
  const activeReading = calculateTelemetry(selectedTag, simStep, activeScenario);
  const activeHistory = history[selectedTag] || [];

  // Reset / Mitigate Drift
  const handleAvertDrift = () => {
    setActiveScenario('NORMAL');
    setSimStep(0);
  };

  // Flagged Drift Count across all 8 machines
  const driftingAssets = EQUIPMENT_DATABASE.map((eq) => {
    const reading = calculateTelemetry(eq.tag, simStep, activeScenario);
    return {
      tag: eq.tag,
      name: eq.name,
      stage: reading.driftStage,
      param: reading.driftParameterName,
      eta: reading.etaMinutes,
    };
  }).filter((a) => a.stage !== 'OPTIMAL');

  return (
    <div className="space-y-6">
      {/* Real-time Status & Alert Banner */}
      <div className={`p-4 rounded-xl border transition-all ${
        activeReading.driftStage === 'PRE_INCIDENT' || activeReading.driftStage === 'TRIP_BREACH'
          ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
          : activeReading.driftStage === 'WATCH'
          ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
          : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
              activeReading.driftStage === 'PRE_INCIDENT' || activeReading.driftStage === 'TRIP_BREACH'
                ? 'bg-rose-900/60 text-rose-300 border border-rose-500 animate-pulse'
                : activeReading.driftStage === 'WATCH'
                ? 'bg-amber-900/60 text-amber-300 border border-amber-500'
                : 'bg-emerald-900/60 text-emerald-300 border border-emerald-500'
            }`}>
              {activeReading.driftStage === 'OPTIMAL' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  {activeReading.driftStage === 'OPTIMAL'
                    ? 'All 8 Critical Plant Machines Operating Within Design Envelope'
                    : activeReading.driftStage === 'WATCH'
                    ? `Stage 1 Operational Drift Flagged: ${selectedTag}`
                    : `Pre-Incident Drift Warning (Stage 2): Emergency Shutdown Risk on ${selectedTag}`}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 font-mono">
                  Live DCS Simulation
                </span>
              </div>
              
              <p className="text-xs text-slate-300 mt-0.5">
                {activeReading.driftStage === 'OPTIMAL' ? (
                  <span>Continuous telemetry stream monitored every 2.4s against P&ID baseline & SIS interlocks.</span>
                ) : (
                  <span>
                    <strong>{activeReading.driftParameterName}</strong> is drifting towards trip limit ({activeReading.tripLimitValue}). 
                    {activeReading.etaMinutes > 0 && (
                      <span className="text-amber-300 ml-1 font-bold">
                        Estimated time to SIS trip: ~{activeReading.etaMinutes} mins if unmitigated.
                      </span>
                    )}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {activeReading.driftStage !== 'OPTIMAL' ? (
              <button
                onClick={handleAvertDrift}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Execute Preventive Mitigation (Clear Drift)</span>
              </button>
            ) : null}

            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center gap-1 border border-slate-700 cursor-pointer"
              title={isSimulating ? 'Pause live stream' : 'Resume live stream'}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isSimulating ? 'Live' : 'Paused'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scenario Injection Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5 shadow-md">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-teal-400" />
            <span>Simulate Plant Operational Scenarios (Brownian Drift Engine)</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Flags anomalies prior to DCS hard alarm activation
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => {
              setActiveScenario('NORMAL');
              setSimStep(0);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScenario === 'NORMAL'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Stable Baseline (All 8 Sets)</span>
          </button>

          <button
            onClick={() => {
              setSelectedTag('GA-1201A');
              setActiveScenario('GA_1201A_SEAL_FLUSH_DRIFT');
              setSimStep(14);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScenario === 'GA_1201A_SEAL_FLUSH_DRIFT'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800 text-amber-400 hover:text-amber-200'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>GA-1201A: Plan 11 Flush Clogging Drift (PDI-1201)</span>
          </button>

          <button
            onClick={() => {
              setSelectedTag('KC-4501');
              setActiveScenario('KC_4501_VIBRATION_DRIFT');
              setSimStep(12);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScenario === 'KC_4501_VIBRATION_DRIFT'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-800 text-rose-400 hover:text-rose-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>KC-4501: Crosshead Vibration Spike (VSHH-4505)</span>
          </button>

          <button
            onClick={() => {
              setSelectedTag('YD-2301');
              setActiveScenario('YD_2301_TEMP_RUNAWAY');
              setSimStep(11);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScenario === 'YD_2301_TEMP_RUNAWAY'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-800 text-rose-400 hover:text-rose-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>YD-2301: Bed Thermal Excursion (TSHH-2301)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Machine Fleet Status & Active Asset Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 8-Machine Fleet Live Health Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span>Plant Fleet Live DCS Monitor</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">8 Machine Sets</span>
          </div>

          <div className="space-y-2.5 max-h-[660px] overflow-y-auto pr-1">
            {EQUIPMENT_DATABASE.map((eq) => {
              const reading = calculateTelemetry(eq.tag, simStep, activeScenario);
              const isSelected = eq.tag === selectedTag;

              return (
                <div
                  key={eq.tag}
                  onClick={() => setSelectedTag(eq.tag)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-teal-500 shadow-md ring-1 ring-teal-500/30'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-teal-300">
                      {eq.tag}
                    </span>
                    
                    {reading.driftStage === 'OPTIMAL' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>Nominal</span>
                      </span>
                    ) : reading.driftStage === 'WATCH' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <span>Drift Watch</span>
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40 font-semibold flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        <span>Pre-Incident</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-semibold text-white mt-1 line-clamp-1">
                    {eq.name}
                  </h4>

                  {/* Telemetry Strip */}
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono">
                    <div>
                      <span className="text-slate-500 block">P (barg)</span>
                      <strong className="text-slate-200">{reading.pressure}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">T (°C)</span>
                      <strong className={reading.temperature > 65 ? 'text-amber-300' : 'text-slate-200'}>
                        {reading.temperature}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Vib (mm/s)</span>
                      <strong className={reading.vibration > 3.0 ? 'text-rose-400' : 'text-slate-200'}>
                        {reading.vibration}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Asset Live Drift Diagnostics & Knowledge Graph Action (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Real-time Telemetry Live Gauges Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-teal-300 bg-teal-950 px-2.5 py-0.5 rounded border border-teal-500/40">
                    {activeEquipment.tag}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {activeEquipment.category}
                  </span>
                  <span className="text-xs font-mono text-cyan-300">
                    Interlock: {activeEquipment.interlockSequence}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1.5">{activeEquipment.name}</h3>
                <p className="text-xs text-slate-400">
                  Service: <strong className="text-slate-200">{activeEquipment.fluidService}</strong>
                </p>
              </div>

              <div className="text-right font-mono text-xs">
                <span className="text-slate-500 block text-[10px] uppercase">Telemetry Timestamp</span>
                <span className="text-teal-400 font-bold">{new Date().toLocaleTimeString()} WIB</span>
              </div>
            </div>

            {/* 4 Live Telemetry Value Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {/* Pressure */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Discharge P</span>
                  <Gauge className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white">
                  {activeReading.pressure} <span className="text-xs font-normal text-slate-400">barg</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Trip: {activeEquipment.operatingLimits.dischargePressure?.tripHigh || '24.0'} barg
                </div>
              </div>

              {/* Temperature */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Temperature</span>
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className={`text-xl font-bold font-mono ${
                  activeReading.temperature > 65 ? 'text-amber-400' : 'text-white'
                }`}>
                  {activeReading.temperature} <span className="text-xs font-normal text-slate-400">°C</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Trip: {activeEquipment.operatingLimits.temperature?.tripHigh || '85.0'} °C
                </div>
              </div>

              {/* Vibration */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Vibration RMS</span>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className={`text-xl font-bold font-mono ${
                  activeReading.vibration > 3.0 ? 'text-rose-400' : 'text-white'
                }`}>
                  {activeReading.vibration} <span className="text-xs font-normal text-slate-400">mm/s</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Trip: {activeEquipment.operatingLimits.vibration?.tripHigh || '4.5'} mm/s
                </div>
              </div>

              {/* Custom Plan 11 DP / Secondary Parameter */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>{selectedTag === 'GA-1201A' ? 'Plan 11 dP' : 'Process Flow'}</span>
                  <Cpu className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className={`text-xl font-bold font-mono ${
                  selectedTag === 'GA-1201A' && activeReading.customParam < 1.7
                    ? 'text-rose-400 animate-pulse'
                    : 'text-white'
                }`}>
                  {selectedTag === 'GA-1201A' ? activeReading.customParam : activeReading.flow}
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    {selectedTag === 'GA-1201A' ? 'bar' : 'm³/h'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {selectedTag === 'GA-1201A' ? 'Permissive: > 1.5 bar' : 'Design: 24 m³/h'}
                </div>
              </div>
            </div>

            {/* Live Scrolling Trend Sparkline */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 font-mono flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-cyan-400" />
                  <span>Real-time Telemetry Trajectory (Last 15 Snapshots vs SIS Limits)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Sample Rate: 2.4s
                </span>
              </div>

              {/* SVG Trendline */}
              <div className="h-32 w-full pt-2">
                <svg className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="100%" y2="20" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
                  <line x1="0" y1="60" x2="100%" y2="60" stroke="#1e293b" strokeWidth="1" />
                  <line x1="0" y1="100" x2="100%" y2="100" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />

                  {/* SIS Trip Limit Line */}
                  <text x="10" y="18" fill="#f43f5e" fontSize="9" fontFamily="monospace">
                    SIS Emergency Trip Threshold
                  </text>
                  <text x="10" y="98" fill="#10b981" fontSize="9" fontFamily="monospace">
                    Safe Operating Envelope Baseline
                  </text>

                  {/* Render Data Polyline */}
                  {activeHistory.length > 1 && (
                    <polyline
                      fill="none"
                      stroke={activeReading.driftStage === 'OPTIMAL' ? '#14b8a6' : '#f59e0b'}
                      strokeWidth="2.5"
                      points={activeHistory.map((pt, idx) => {
                        const x = (idx / (activeHistory.length - 1)) * 100;
                        // Map values between range
                        const val = selectedTag === 'GA-1201A' ? pt.customParam : pt.vibration;
                        const min = selectedTag === 'GA-1201A' ? 1.4 : 1.0;
                        const max = selectedTag === 'GA-1201A' ? 2.3 : 10.0;
                        const normalized = Math.max(0, Math.min(1, (val - min) / (max - min)));
                        // Inverse Y coordinate
                        const y = 110 - normalized * 90;
                        return `${x}%,${y}`;
                      }).join(' ')}
                    />
                  )}
                </svg>
              </div>
            </div>

            {/* Knowledge Graph Correlator: Links Drift Directly to OPL, Interlock, and WO Precedent */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    DataOpsGraph Root Cause Precedents & Pre-Incident Mitigation
                  </h4>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-500/40 font-mono">
                  ISO 14224 Correlated
                </span>
              </div>

              {activeReading.driftStage !== 'OPTIMAL' ? (
                <div className="space-y-3 text-xs">
                  <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-3.5 space-y-1.5">
                    <span className="text-amber-400 font-bold block text-[11px]">
                      Predicted Risk: Premature Tripping of Interlock {activeEquipment.interlockSequence}
                    </span>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Continuous telemetry degradation indicates restricted API Plan 11 circulation flow. Left unattended, seal face temperatures will reach 85°C, triggering <strong className="text-rose-300">TSHH-1201</strong> and auto-starting standby pump GA-1201B.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Prescribed Tacit OPL Rule */}
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-teal-300">
                        <span>Associated Veteran Heuristic (OPL)</span>
                        <span className="font-mono text-[10px]">OPL-GA-1201A-01</span>
                      </div>
                      <p className="text-slate-300 text-xs italic">
                        "If Plan 11 dP dips below 1.7 bar, crack the orifice bleed valve for 20 seconds to dislodge particulate fines before seal faces flash."
                      </p>
                    </div>

                    {/* Historical WO Precedent */}
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
                        <span>Failure Memory Case Match</span>
                        <span className="font-mono text-[10px]">WO-240012</span>
                      </div>
                      <p className="text-slate-300 text-xs">
                        Identical drift occurred in July 2024. Prompt cleaning of the seal flush orifice averted a 21-hour unplanned outage.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={handleAvertDrift}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Apply Heuristic Flush Protocol (Normalize)</span>
                    </button>

                    <button
                      onClick={() => onOpenExecutionChecklist && onOpenExecutionChecklist(activeEquipment.tag)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-medium border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Launch Execution Guard Checklist</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h5 className="text-sm font-bold text-white">
                    Asset Operating in Stable Thermal & Pressure Equilibrium
                  </h5>
                  <p className="text-xs text-slate-400 max-w-lg mx-auto">
                    All DCS telemetry points for {activeEquipment.tag} comply with OEM Datasheet ({activeEquipment.datasheetDoc}) tolerances. Predictive drift monitoring active in background.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
