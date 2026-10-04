import React from 'react';
import { EquipmentTag } from '../data/plantData';

interface MachineVectorOverlayProps {
  setNumber: number;
  tag: string;
  name: string;
  interlockSequence: string;
  telemetry: {
    dischargePress: number;
    suctionPress?: number;
    vibration: number;
    temp: number;
    flow: number;
    sealDP?: number;
    status: 'NORMAL' | 'WARNING' | 'TRIP';
  };
}

export const MachineVectorOverlay: React.FC<MachineVectorOverlayProps> = ({
  setNumber,
  tag,
  name,
  interlockSequence,
  telemetry,
}) => {
  const isNormal = telemetry.status === 'NORMAL';
  const statusColor = isNormal ? '#10b981' : telemetry.vibration > 4.5 ? '#f43f5e' : '#f59e0b';
  const strokeColor = isNormal ? '#14b8a6' : '#f43f5e';

  // Shared SVG definitions (markers, grid, gradients)
  const sharedDefs = (
    <defs>
      <pattern id="twinGrid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(51, 65, 85, 0.25)" strokeWidth="0.5" />
      </pattern>
      <marker id="arrow-teal" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#14b8a6" />
      </marker>
      <marker id="arrow-cyan" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
      </marker>
      <marker id="arrow-amber" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
      </marker>
      <linearGradient id="fluidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0d9488" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
      </linearGradient>
    </defs>
  );

  // Common Header & Safety Banner
  const renderHeader = (subtitle: string) => (
    <g>
      <rect width="800" height="440" fill="url(#twinGrid)" />
      
      {/* Title & Set Code */}
      <rect x="20" y="16" width="220" height="34" rx="6" fill="#090d16" stroke="#334155" strokeWidth="1" />
      <circle cx="34" cy="33" r="5" fill={statusColor} className="animate-pulse" />
      <text x="46" y="32" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
        SET 0{setNumber} · {tag}
      </text>
      <text x="46" y="44" fill="#94a3b8" fontSize="8" fontFamily="monospace">
        {subtitle}
      </text>

      {/* Safety Instrumented System (SIS) Banner */}
      <g>
        <rect x="560" y="16" width="220" height="42" rx="6" fill="#090d16" stroke="#1e293b" strokeWidth="1.5" />
        <text x="670" y="33" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="bold" fontFamily="monospace">
          SIS INTERLOCK {interlockSequence}
        </text>
        <text x="670" y="48" textAnchor="middle" fill={statusColor} fontSize="9" fontWeight="bold" fontFamily="monospace">
          STATUS: {telemetry.status === 'NORMAL' ? 'HEALTHY / ARMED' : 'ALARM ACTIVE'}
        </text>
      </g>
    </g>
  );

  // -------------------------------------------------------------
  // SET 1: GA-1201A (Hexane Feed Pump - Centrifugal Pump & Seal Flush)
  // -------------------------------------------------------------
  if (setNumber === 1 || tag === 'GA-1201A') {
    return (
      <svg viewBox="0 0 800 440" className="w-full h-auto select-none text-slate-200">
        {sharedDefs}
        {renderHeader('CENTRIFUGAL FEED PUMP & API PLAN 11')}

        {/* Suction Line */}
        <path d="M 30 240 L 220 240" stroke="#14b8a6" strokeWidth="4" fill="none" />
        <text x="35" y="230" fill="#94a3b8" fontSize="9" fontFamily="monospace">HEXANE SUCTION STREAM</text>

        {/* Suction Valve XV-1201 */}
        <g transform="translate(110, 240)">
          <path d="M -12 -10 L 0 0 L -12 10 Z M 12 -10 L 0 0 L 12 10 Z" fill="#0f172a" stroke="#14b8a6" strokeWidth="2" />
          <circle cx="0" cy="0" r="3" fill="#10b981" />
          <text x="0" y="-14" textAnchor="middle" fill="#38bdf8" fontSize="8" fontFamily="monospace">XV-1201</text>
          <text x="0" y="24" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">ZSO: 100%</text>
        </g>

        {/* Suction Pressure Transmitter PSLL-1201 */}
        <g transform="translate(170, 240)">
          <line x1="0" y1="0" x2="0" y2="-50" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="0" cy="-60" r="14" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="0" y="-57" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">PSLL</text>
          <rect x="-35" y="-90" width="70" height="18" rx="3" fill="#090d16" stroke="#334155" />
          <text x="0" y="-78" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
            {telemetry.suctionPress || 1.8} barg
          </text>
        </g>

        {/* Centrifugal Pump Casing */}
        <g transform="translate(260, 240)">
          <circle cx="0" cy="0" r="42" fill="#0f172a" stroke={strokeColor} strokeWidth="3.5" />
          <path d="M 0 -42 L 35 -42 L 35 0" stroke={strokeColor} strokeWidth="3.5" fill="none" />
          {/* Impeller Symbol */}
          <path d="M -15 -15 L 15 15 M -15 15 L 15 -15 M 0 -22 L 0 22 M -22 0 L 22 0" stroke="#0d9488" strokeWidth="2" />
          <circle cx="0" cy="0" r="8" fill="#14b8a6" />

          {/* Motor Driver */}
          <rect x="70" y="-24" width="70" height="48" rx="5" fill="#090d16" stroke="#64748b" strokeWidth="2" />
          <line x1="42" y1="0" x2="70" y2="0" stroke="#94a3b8" strokeWidth="5" />
          <text x="105" y="4" textAnchor="middle" fill="#e2e8f0" fontSize="9" fontWeight="bold" fontFamily="monospace">MOTOR</text>
          <text x="105" y="15" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">37 kW</text>

          <text x="0" y="55" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="monospace">GA-1201A</text>
        </g>

        {/* Plan 11 Seal Flush Loop (Recirculation from discharge to seal chamber) */}
        <g>
          <path d="M 295 198 L 295 140 L 240 140 L 240 215" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 2" fill="none" />
          <text x="268" y="132" textAnchor="middle" fill="#06b6d4" fontSize="8" fontFamily="monospace">API PLAN 11 FLUSH</text>

          {/* PDI-1201 Transmitter */}
          <g transform="translate(268, 140)">
            <circle cx="0" cy="-22" r="14" fill="#090d16" stroke={telemetry.sealDP && telemetry.sealDP < 1.5 ? '#f43f5e' : '#06b6d4'} strokeWidth="1.5" />
            <text x="0" y="-19" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">PDI</text>
            <rect x="-35" y="-52" width="70" height="18" rx="3" fill="#090d16" stroke="#334155" />
            <text x="0" y="-40" textAnchor="middle" fill={telemetry.sealDP && telemetry.sealDP < 1.5 ? '#fb7185' : '#06b6d4'} fontSize="9" fontWeight="bold" fontFamily="monospace">
              {telemetry.sealDP || 2.1} bar
            </text>
          </g>
        </g>

        {/* Discharge Line & Check Valve */}
        <path d="M 295 198 L 295 100 L 760 100" stroke="#14b8a6" strokeWidth="4" fill="none" markerEnd="url(#arrow-teal)" />
        <text x="640" y="90" fill="#94a3b8" fontSize="9" fontFamily="monospace">TO POLYMER REACTOR DC-3401A</text>

        {/* Discharge Check Valve */}
        <g transform="translate(360, 100)">
          <path d="M -12 -8 L 0 0 L -12 8 Z" fill="#0f172a" stroke="#14b8a6" strokeWidth="1.5" />
          <line x1="0" y1="-10" x2="0" y2="10" stroke="#14b8a6" strokeWidth="2" />
        </g>

        {/* Discharge Pressure Transmitter PT-1201 */}
        <g transform="translate(430, 100)">
          <line x1="0" y1="0" x2="0" y2="-35" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="0" cy="-45" r="14" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="0" y="-42" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">PT</text>
          <rect x="-35" y="-75" width="70" height="18" rx="3" fill="#090d16" stroke="#334155" />
          <text x="0" y="-63" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
            {telemetry.dischargePress} barg
          </text>
        </g>

        {/* Minimum Flow Recirculation FV-1201 Line */}
        <path d="M 520 100 L 520 320 L 110 320 L 110 252" stroke="#64748b" strokeWidth="2.5" strokeDasharray="5 3" fill="none" markerEnd="url(#arrow-teal)" />
        <text x="320" y="335" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          MINIMUM FLOW RECIRCULATION LINE (9.0 m³/h CONTINUOUS)
        </text>

        {/* Recirculation Valve FV-1201 */}
        <g transform="translate(520, 210)">
          <path d="M -10 -10 L 0 0 L -10 10 Z M 10 -10 L 0 0 L 10 10 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="18" y="4" fill="#38bdf8" fontSize="8" fontFamily="monospace">FV-1201</text>
        </g>

        {/* Bearing Vibration & Temp Nodes */}
        <g transform="translate(260, 310)">
          <line x1="0" y1="-28" x2="0" y2="0" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="-25" cy="15" r="14" fill="#090d16" stroke={telemetry.vibration > 4.5 ? '#f43f5e' : '#2dd4bf'} strokeWidth="1.5" />
          <text x="-25" y="18" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">VT</text>
          <rect x="-65" y="35" width="80" height="18" rx="3" fill="#090d16" stroke="#334155" />
          <text x="-25" y="47" textAnchor="middle" fill={telemetry.vibration > 4.5 ? '#fb7185' : '#2dd4bf'} fontSize="9" fontWeight="bold" fontFamily="monospace">
            {telemetry.vibration} mm/s
          </text>

          <circle cx="25" cy="15" r="14" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="25" y="18" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">TT</text>
          <rect x="0" y="35" width="70" height="18" rx="3" fill="#090d16" stroke="#334155" />
          <text x="35" y="47" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
            {telemetry.temp} °C
          </text>
        </g>
      </svg>
    );
  }

  // -------------------------------------------------------------
  // SET 2: YD-2301 (Polymer Fluid Bed Dryer - Fluidized Bed & Blower)
  // -------------------------------------------------------------
  if (setNumber === 2 || tag === 'YD-2301') {
    return (
      <svg viewBox="0 0 800 440" className="w-full h-auto select-none text-slate-200">
        {sharedDefs}
        {renderHeader('FLUIDIZED BED POLYMER DRYING CHAMBER')}

        {/* Wet Polymer Inlet Feed from Top Left */}
        <path d="M 80 80 L 220 80 L 220 140" stroke="#f59e0b" strokeWidth="4" fill="none" markerEnd="url(#arrow-amber)" />
        <text x="80" y="70" fill="#f59e0b" fontSize="9" fontFamily="monospace">WET POLYMER POWDER FEED</text>

        {/* Fluidized Bed Dryer Chamber */}
        <g transform="translate(200, 130)">
          {/* Main Drying Vessel */}
          <rect x="0" y="0" width="300" height="190" rx="8" fill="#0f172a" stroke={strokeColor} strokeWidth="3" />
          
          {/* Perforated Gas Distributor Grid Plate */}
          <line x1="0" y1="140" x2="300" y2="140" stroke="#64748b" strokeWidth="3" strokeDasharray="5 3" />
          <text x="150" y="152" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">DISTRIBUTOR GRID PLATE</text>

          {/* Fluidized Powder Bed (Animated bubbling particles) */}
          <rect x="4" y="60" width="292" height="78" fill="url(#fluidGrad)" />
          <circle cx="50" cy="90" r="3" fill="#fef08a" className="animate-ping" />
          <circle cx="120" cy="110" r="4" fill="#fef08a" />
          <circle cx="180" cy="80" r="3" fill="#fef08a" className="animate-ping" />
          <circle cx="240" cy="100" r="4" fill="#fef08a" />

          {/* Asset Label */}
          <text x="150" y="35" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="monospace">
            YD-2301 · POLYMER DRYER
          </text>
          <text x="150" y="50" textAnchor="middle" fill="#38bdf8" fontSize="9" fontFamily="monospace">
            BED TEMP: {telemetry.temp} °C (LIMIT: 95.0 °C)
          </text>
        </g>

        {/* Hot Nitrogen Circulation Stream (Bottom Plenum) */}
        <path d="M 50 310 L 200 310" stroke="#06b6d4" strokeWidth="4" fill="none" markerEnd="url(#arrow-cyan)" />
        <text x="50" y="300" fill="#06b6d4" fontSize="9" fontFamily="monospace">HOT N2 DRYING GAS (EA-2302)</text>

        {/* Dry Polymer Discharge Rotary Valve at Bottom Right */}
        <path d="M 500 240 L 640 240 L 640 340" stroke="#10b981" strokeWidth="4" fill="none" markerEnd="url(#arrow-teal)" />
        <text x="645" y="235" fill="#10b981" fontSize="9" fontFamily="monospace">DRY LLDPE TO SILOS</text>

        {/* Rotary Air-Lock Star Feeder */}
        <g transform="translate(560, 240)">
          <circle cx="0" cy="0" r="18" fill="#090d16" stroke="#10b981" strokeWidth="2" />
          <line x1="-12" y1="-12" x2="12" y2="12" stroke="#10b981" strokeWidth="1.5" />
          <line x1="-12" y1="12" x2="12" y2="-12" stroke="#10b981" strokeWidth="1.5" />
          <text x="0" y="-24" textAnchor="middle" fill="#10b981" fontSize="8" fontFamily="monospace">RF-2305</text>
        </g>

        {/* Overhead Vapor to Cyclone Separator */}
        <path d="M 350 130 L 350 70 L 620 70" stroke="#94a3b8" strokeWidth="3" strokeDasharray="4 2" fill="none" markerEnd="url(#arrow-teal)" />
        
        {/* Cyclone Separator */}
        <g transform="translate(660, 70)">
          <path d="M -20 -15 L 20 -15 L 15 25 L 0 45 L -15 25 Z" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
          <text x="0" y="60" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">CYCLONE FA-2303</text>
        </g>

        {/* O2 Safety Analyzer ASHH-2307 */}
        <g transform="translate(380, 50)">
          <circle cx="0" cy="0" r="14" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="0" y="3" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">AI</text>
          <rect x="-40" y="-30" width="80" height="18" rx="3" fill="#090d16" stroke="#334155" />
          <text x="0" y="-18" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace">
            O2: 0.15% (MAX 0.5%)
          </text>
        </g>
      </svg>
    );
  }

  // -------------------------------------------------------------
  // SET 3: DC-3401A (Catalyst Reduction Reactor - Jacketed Agitated)
  // -------------------------------------------------------------
  if (setNumber === 3 || tag === 'DC-3401A') {
    return (
      <svg viewBox="0 0 800 440" className="w-full h-auto select-none text-slate-200">
        {sharedDefs}
        {renderHeader('CATALYST REDUCTION JACKETED REACTOR & AGITATOR')}

        {/* Vertical Reactor Vessel */}
        <g transform="translate(320, 100)">
          {/* External Cooling / Heating Jacket */}
          <path d="M -30 40 L -30 220 A 30 30 0 0 0 170 220 L 170 40" fill="none" stroke="#0ea5e9" strokeWidth="12" opacity="0.4" />
          <text x="200" y="140" fill="#0ea5e9" fontSize="8" fontFamily="monospace">THERMAL JACKET</text>

          {/* Main Vessel Body */}
          <rect x="-15" y="20" width="170" height="200" rx="20" fill="#0f172a" stroke={strokeColor} strokeWidth="3" />

          {/* Agitator Motor at Top */}
          <rect x="50" y="-40" width="40" height="35" rx="4" fill="#090d16" stroke="#94a3b8" strokeWidth="2" />
          <text x="70" y="-18" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontWeight="bold">M</text>

          {/* Agitator Shaft & Dual Impellers */}
          <line x1="70" y1="-5" x2="70" y2="185" stroke="#94a3b8" strokeWidth="4" />
          {/* Upper Turbine */}
          <path d="M 40 100 L 100 100 M 40 95 L 45 105 M 100 95 L 95 105" stroke="#38bdf8" strokeWidth="3" />
          {/* Lower Turbine */}
          <path d="M 40 160 L 100 160 M 40 155 L 45 165 M 100 155 L 95 165" stroke="#38bdf8" strokeWidth="3" />

          {/* Vessel Label */}
          <text x="70" y="50" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="monospace">
            DC-3401A
          </text>
          <text x="70" y="65" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
            REDUCTION REACTOR
          </text>
        </g>

        {/* Hydrogen Feed Line with Emergency Kill Valve XV-3402 */}
        <g transform="translate(60, 140)">
          <path d="M 0 0 L 245 0" stroke="#f43f5e" strokeWidth="4" fill="none" markerEnd="url(#arrow-amber)" />
          <text x="10" y="-10" fill="#f43f5e" fontSize="9" fontWeight="bold" fontFamily="monospace">H2 REDUCTION FEED</text>

          {/* Emergency Kill Valve */}
          <g transform="translate(140, 0)">
            <path d="M -12 -10 L 0 0 L -12 10 Z M 12 -10 L 0 0 L 12 10 Z" fill="#0f172a" stroke="#f43f5e" strokeWidth="2" />
            <circle cx="0" cy="-18" r="8" fill="#f43f5e" />
            <text x="0" y="-15" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold">ESD</text>
            <text x="0" y="24" textAnchor="middle" fill="#f43f5e" fontSize="8" fontFamily="monospace">XV-3402 (KILL)</text>
          </g>
        </g>

        {/* Multipoint Thermocouple Array TI-3401 */}
        <g transform="translate(540, 160)">
          <line x1="-70" y1="40" x2="0" y2="40" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="15" cy="40" r="14" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="15" y="43" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">TI</text>
          <rect x="-10" y="65" width="85" height="18" rx="3" fill="#090d16" stroke="#334155" />
          <text x="32" y="77" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
            {telemetry.temp} °C
          </text>
        </g>

        {/* Bottom Product Discharge Line */}
        <path d="M 390 320 L 390 380 L 680 380" stroke="#10b981" strokeWidth="4" fill="none" markerEnd="url(#arrow-teal)" />
        <text x="430" y="370" fill="#10b981" fontSize="9" fontFamily="monospace">ACTIVATED CATALYST SLURRY</text>
      </svg>
    );
  }

  // -------------------------------------------------------------
  // SET 4: KC-4501 (Recycle Gas Compressor - Multistage Reciprocating)
  // -------------------------------------------------------------
  if (setNumber === 4 || tag === 'KC-4501') {
    return (
      <svg viewBox="0 0 800 440" className="w-full h-auto select-none text-slate-200">
        {sharedDefs}
        {renderHeader('RECIPROCATING COMPRESSOR & ANTI-SURGE SYSTEM')}

        {/* Suction Knock-Out Drum FA-4510 */}
        <g transform="translate(100, 150)">
          <rect x="0" y="0" width="80" height="160" rx="30" fill="#0f172a" stroke="#64748b" strokeWidth="2.5" />
          <line x1="0" y1="50" x2="80" y2="50" stroke="#64748b" strokeWidth="2" strokeDasharray="3 2" />
          <text x="40" y="42" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">DEMISTER</text>
          <text x="40" y="90" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="monospace">FA-4510</text>
          <text x="40" y="105" textAnchor="middle" fill="#38bdf8" fontSize="7" fontFamily="monospace">KO DRUM</text>
        </g>

        {/* Gas Inlet into Drum */}
        <path d="M 30 190 L 100 190" stroke="#06b6d4" strokeWidth="4" fill="none" markerEnd="url(#arrow-cyan)" />

        {/* Vapor from Drum into Compressor */}
        <path d="M 140 150 L 140 110 L 300 110 L 300 180 L 340 180" stroke="#06b6d4" strokeWidth="4" fill="none" />

        {/* Reciprocating Compressor Block */}
        <g transform="translate(340, 160)">
          {/* Frame */}
          <rect x="0" y="0" width="130" height="100" rx="8" fill="#0f172a" stroke={strokeColor} strokeWidth="3" />
          {/* Dual Cylinder Heads */}
          <rect x="20" y="-25" width="35" height="25" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          <rect x="75" y="-25" width="35" height="25" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          
          <text x="65" y="45" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="monospace">KC-4501</text>
          <text x="65" y="60" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">RECIP COMPRESSOR</text>

          {/* Motor Driver */}
          <rect x="150" y="15" width="70" height="70" rx="6" fill="#090d16" stroke="#64748b" strokeWidth="2" />
          <line x1="130" y1="50" x2="150" y2="50" stroke="#94a3b8" strokeWidth="6" />
          <text x="185" y="52" textAnchor="middle" fill="#e2e8f0" fontSize="9" fontWeight="bold">450 kW</text>
        </g>

        {/* Anti-Surge / Recycle Spillback Loop */}
        <path d="M 520 120 L 520 60 L 220 60 L 220 110" stroke="#f59e0b" strokeWidth="3" strokeDasharray="5 3" fill="none" markerEnd="url(#arrow-amber)" />
        <text x="370" y="50" textAnchor="middle" fill="#f59e0b" fontSize="8" fontFamily="monospace">
          ANTI-SURGE RECYCLE BYPASS LINE (FCV-4504)
        </text>

        {/* Anti-Surge Valve */}
        <g transform="translate(370, 60)">
          <path d="M -10 -8 L 0 0 L -10 8 Z M 10 -8 L 0 0 L 10 8 Z" fill="#090d16" stroke="#f59e0b" strokeWidth="1.5" />
        </g>

        {/* Compressor Discharge Line to Aftercooler EA-4502 */}
        <path d="M 470 180 L 640 180" stroke="#06b6d4" strokeWidth="4" fill="none" markerEnd="url(#arrow-cyan)" />
        <text x="660" y="175" fill="#06b6d4" fontSize="9" fontFamily="monospace">TO REACTION LOOP</text>

        {/* Crosshead Vibration Monitor VSHH-4505 */}
        <g transform="translate(405, 300)">
          <line x1="0" y1="-40" x2="0" y2="0" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="0" cy="15" r="14" fill="#090d16" stroke={telemetry.vibration > 4.5 ? '#f43f5e' : '#2dd4bf'} strokeWidth="1.5" />
          <text x="0" y="18" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">VSHH</text>
          <rect x="-45" y="35" width="90" height="18" rx="3" fill="#090d16" stroke="#334155" />
          <text x="0" y="47" textAnchor="middle" fill={telemetry.vibration > 4.5 ? '#fb7185' : '#2dd4bf'} fontSize="9" fontWeight="bold" fontFamily="monospace">
            {telemetry.vibration} mm/s
          </text>
        </g>
      </svg>
    );
  }

  // -------------------------------------------------------------
  // SET 5: EA-5601 (Solvent Heater - Shell & Tube Heat Exchanger)
  // -------------------------------------------------------------
  if (setNumber === 5 || tag === 'EA-5601') {
    return (
      <svg viewBox="0 0 800 440" className="w-full h-auto select-none text-slate-200">
        {sharedDefs}
        {renderHeader('SHELL & TUBE PROCESS HEAT EXCHANGER')}

        {/* Shell-and-Tube Exchanger Body */}
        <g transform="translate(240, 140)">
          {/* Main Shell */}
          <rect x="0" y="0" width="320" height="140" rx="30" fill="#0f172a" stroke={strokeColor} strokeWidth="3" />
          
          {/* Internal Tube Bundle & Baffles */}
          <line x1="50" y1="30" x2="270" y2="30" stroke="#06b6d4" strokeWidth="2" />
          <line x1="50" y1="60" x2="270" y2="60" stroke="#06b6d4" strokeWidth="2" />
          <line x1="50" y1="90" x2="270" y2="90" stroke="#06b6d4" strokeWidth="2" />
          <line x1="50" y1="120" x2="270" y2="120" stroke="#06b6d4" strokeWidth="2" />
          
          {/* Segmental Baffles */}
          <line x1="100" y1="10" x2="100" y2="100" stroke="#64748b" strokeWidth="2.5" />
          <line x1="160" y1="40" x2="160" y2="130" stroke="#64748b" strokeWidth="2.5" />
          <line x1="220" y1="10" x2="220" y2="100" stroke="#64748b" strokeWidth="2.5" />

          {/* Asset Label */}
          <text x="160" y="-15" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="monospace">
            EA-5601 · SOLVENT HEATER
          </text>
        </g>

        {/* Tube Side: Solvent In (Bottom Left) */}
        <path d="M 60 250 L 240 250" stroke="#06b6d4" strokeWidth="4" fill="none" markerEnd="url(#arrow-cyan)" />
        <text x="60" y="240" fill="#06b6d4" fontSize="9" fontFamily="monospace">HEXANE SOLVENT IN (35°C)</text>

        {/* Tube Side: Solvent Out (Top Right) */}
        <path d="M 560 170 L 740 170" stroke="#14b8a6" strokeWidth="4" fill="none" markerEnd="url(#arrow-teal)" />
        <text x="600" y="160" fill="#14b8a6" fontSize="9" fontFamily="monospace">HEATED SOLVENT (78°C)</text>

        {/* Shell Side: 16 barg Steam In (Top Left) */}
        <path d="M 330 60 L 330 140" stroke="#f59e0b" strokeWidth="4" fill="none" markerEnd="url(#arrow-amber)" />
        <text x="340" y="55" fill="#f59e0b" fontSize="9" fontFamily="monospace">16 barg STEAM SUPPLY (TCV-5601)</text>

        {/* Shell Side: Condensate Out (Bottom Right) */}
        <path d="M 470 280 L 470 360 L 620 360" stroke="#94a3b8" strokeWidth="3" fill="none" markerEnd="url(#arrow-teal)" />
        <text x="480" y="355" fill="#94a3b8" fontSize="8" fontFamily="monospace">STEAM CONDENSATE POT</text>

        {/* Outlet Temperature Transmitter TT-5601 */}
        <g transform="translate(640, 170)">
          <line x1="0" y1="0" x2="0" y2="-45" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="0" cy="-55" r="14" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="0" y="-52" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">TT</text>
          <rect x="-35" y="-85" width="70" height="18" rx="3" fill="#090d16" stroke="#334155" />
          <text x="0" y="-73" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
            {telemetry.temp} °C
          </text>
        </g>
      </svg>
    );
  }

  // -------------------------------------------------------------
  // SET 6: LV-6701 (Separator Level Control Valve - Globe Body & Positioner)
  // -------------------------------------------------------------
  if (setNumber === 6 || tag === 'LV-6701') {
    return (
      <svg viewBox="0 0 800 440" className="w-full h-auto select-none text-slate-200">
        {sharedDefs}
        {renderHeader('GLOBE LEVEL CONTROL VALVE STATION & BYPASS')}

        {/* Main Process Line */}
        <path d="M 40 220 L 760 220" stroke="#14b8a6" strokeWidth="4" fill="none" markerEnd="url(#arrow-teal)" />
        <text x="45" y="210" fill="#94a3b8" fontSize="9" fontFamily="monospace">HYDROCARBON CONDENSATE STREAM</text>

        {/* Upstream Block Valve */}
        <g transform="translate(180, 220)">
          <path d="M -12 -10 L 0 0 L -12 10 Z M 12 -10 L 0 0 L 12 10 Z" fill="#0f172a" stroke="#14b8a6" strokeWidth="2" />
          <text x="0" y="22" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">GATE V-1</text>
        </g>

        {/* Downstream Block Valve */}
        <g transform="translate(600, 220)">
          <path d="M -12 -10 L 0 0 L -12 10 Z M 12 -10 L 0 0 L 12 10 Z" fill="#0f172a" stroke="#14b8a6" strokeWidth="2" />
          <text x="0" y="22" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">GATE V-2</text>
        </g>

        {/* Central Globe Control Valve LV-6701 */}
        <g transform="translate(390, 220)">
          {/* Globe Body */}
          <path d="M -22 -16 L 0 0 L -22 16 Z M 22 -16 L 0 0 L 22 16 Z" fill="#0f172a" stroke={strokeColor} strokeWidth="3" />
          
          {/* Valve Stem & Diaphragm Actuator */}
          <line x1="0" y1="0" x2="0" y2="-65" stroke="#94a3b8" strokeWidth="4" />
          <ellipse cx="0" cy="-75" rx="35" ry="16" fill="#090d16" stroke="#38bdf8" strokeWidth="2.5" />
          
          {/* Positioner DVC6200 Box */}
          <rect x="18" y="-55" width="30" height="24" rx="3" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1" />
          <text x="33" y="-40" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold">DVC</text>

          {/* Valve Tag */}
          <text x="0" y="32" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="monospace">
            LV-6701
          </text>
          <text x="0" y="44" textAnchor="middle" fill="#38bdf8" fontSize="8" fontFamily="monospace">
            TRAVEL: 52% OPEN
          </text>
        </g>

        {/* Full-Flow Manual Bypass Line HV-6701 */}
        <path d="M 180 220 L 180 100 L 600 100 L 600 220" stroke="#64748b" strokeWidth="2.5" strokeDasharray="5 3" fill="none" />
        <text x="390" y="90" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          MANUAL BYPASS MANIFOLD (HV-6701 GLOBE)
        </text>

        {/* Bypass Valve HV-6701 */}
        <g transform="translate(390, 100)">
          <path d="M -12 -10 L 0 0 L -12 10 Z M 12 -10 L 0 0 L 12 10 Z" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
          <text x="0" y="-14" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">HV-6701 (CLOSED)</text>
        </g>

        {/* Upstream Level Transmitter LT-6701 Input */}
        <g transform="translate(280, 220)">
          <line x1="0" y1="0" x2="0" y2="70" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="0" cy="85" r="14" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="0" y="88" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">LT</text>
          <rect x="-35" y="105" width="70" height="18" rx="3" fill="#090d16" stroke="#334155" />
          <text x="0" y="117" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
            LT: 54.2%
          </text>
        </g>
      </svg>
    );
  }

  // -------------------------------------------------------------
  // SET 7: CT-7801 (Cooling Tower Cell Fan - Axial Fan & Basin)
  // -------------------------------------------------------------
  if (setNumber === 7 || tag === 'CT-7801') {
    return (
      <svg viewBox="0 0 800 440" className="w-full h-auto select-none text-slate-200">
        {sharedDefs}
        {renderHeader('INDUCED DRAFT COOLING TOWER FAN & GEARBOX')}

        {/* Cooling Tower Shroud Structure */}
        <g transform="translate(250, 80)">
          {/* Venturi Fan Shroud */}
          <path d="M 30 50 L 50 10 L 250 10 L 270 50" fill="none" stroke="#64748b" strokeWidth="3" />
          
          {/* Axial Fan Blades (Rotating Graphic) */}
          <g transform="translate(150, 30)">
            <ellipse cx="0" cy="0" rx="90" ry="14" fill="#0f172a" stroke={strokeColor} strokeWidth="2.5" />
            <line x1="-80" y1="0" x2="80" y2="0" stroke="#38bdf8" strokeWidth="4" />
            <circle cx="0" cy="0" r="14" fill="#38bdf8" />
            <text x="0" y="4" textAnchor="middle" fill="#090d16" fontSize="8" fontWeight="bold">FAN</text>
          </g>

          {/* Right-Angle Gearbox */}
          <rect x="135" y="55" width="30" height="30" rx="3" fill="#090d16" stroke="#38bdf8" strokeWidth="2" />
          <text x="150" y="73" textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="bold">GB</text>

          {/* Motor Mounted on Torque Tube */}
          <rect x="20" y="52" width="60" height="36" rx="4" fill="#090d16" stroke="#94a3b8" strokeWidth="2" />
          <line x1="80" y1="70" x2="135" y2="70" stroke="#94a3b8" strokeWidth="5" />
          <text x="50" y="74" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontWeight="bold">75 kW</text>

          {/* PVC Film Splash Fill / Packing */}
          <rect x="20" y="110" width="260" height="90" fill="#0f172a" stroke="#334155" strokeWidth="2" strokeDasharray="4 2" />
          <text x="150" y="155" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">PVC FILM FILL & DRIFT ELIMINATOR</text>

          {/* Cold Water Basin (Bottom) */}
          <rect x="0" y="210" width="300" height="40" fill="url(#fluidGrad)" stroke="#06b6d4" strokeWidth="2" />
          <text x="150" y="235" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">
            COLD WATER BASIN
          </text>
        </g>

        {/* Gearbox Vibration Sensor VSHH-7802 */}
        <g transform="translate(480, 140)">
          <line x1="-80" y1="0" x2="0" y2="0" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="15" cy="0" r="14" fill="#090d16" stroke={telemetry.vibration > 4.5 ? '#f43f5e' : '#2dd4bf'} strokeWidth="1.5" />
          <text x="15" y="3" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">VSHH</text>
          <rect x="-35" y="20" width="100" height="18" rx="3" fill="#090d16" stroke="#334155" />
          <text x="15" y="32" textAnchor="middle" fill={telemetry.vibration > 4.5 ? '#fb7185' : '#2dd4bf'} fontSize="9" fontWeight="bold" fontFamily="monospace">
            {telemetry.vibration} mm/s (TRIP 4.5)
          </text>
        </g>

        {/* Circulating Water Outlet to Plant Header */}
        <path d="M 550 310 L 740 310" stroke="#06b6d4" strokeWidth="4" fill="none" markerEnd="url(#arrow-cyan)" />
        <text x="560" y="300" fill="#06b6d4" fontSize="9" fontFamily="monospace">COLD WATER TO CRACKER TRAIN</text>
      </svg>
    );
  }

  // -------------------------------------------------------------
  // SET 8: FA-8901 (Reflux Accumulator Drum - Horizontal 3-Phase Separator)
  // -------------------------------------------------------------
  return (
    <svg viewBox="0 0 800 440" className="w-full h-auto select-none text-slate-200">
      {sharedDefs}
      {renderHeader('HORIZONTAL REFLUX ACCUMULATOR & WATER BOOT')}

      {/* Condensed Overhead Inlet from Column Condenser */}
      <path d="M 80 100 L 220 100 L 220 140" stroke="#06b6d4" strokeWidth="4" fill="none" markerEnd="url(#arrow-cyan)" />
      <text x="80" y="90" fill="#06b6d4" fontSize="9" fontFamily="monospace">CONDENSER MIXED PHASE INLET</text>

      {/* Horizontal Separator Drum Body */}
      <g transform="translate(200, 140)">
        {/* Horizontal Vessel with Ellipsoidal Heads */}
        <rect x="0" y="0" width="340" height="130" rx="40" fill="#0f172a" stroke={strokeColor} strokeWidth="3" />
        
        {/* Liquid Hydrocarbon Level */}
        <path d="M 2 70 L 338 70 L 338 128 L 2 128 Z" fill="url(#fluidGrad)" opacity="0.6" />
        <line x1="2" y1="70" x2="338" y2="70" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" />

        {/* Demister Wire Mesh Pad at Top */}
        <rect x="230" y="5" width="60" height="20" fill="#334155" stroke="#64748b" strokeWidth="1" strokeDasharray="2 1" />
        <text x="260" y="18" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">DEMISTER</text>

        {/* Bottom Water Boot Leg */}
        <rect x="240" y="128" width="50" height="80" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
        <rect x="242" y="165" width="46" height="40" fill="#0284c7" opacity="0.8" />
        <text x="265" y="195" textAnchor="middle" fill="#e0f2fe" fontSize="7" fontWeight="bold">WATER BOOT</text>

        {/* Vessel Name Label */}
        <text x="140" y="45" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="monospace">
          FA-8901
        </text>
        <text x="140" y="60" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          REFLUX ACCUMULATOR
        </text>
      </g>

      {/* Hydrocarbon Liquid Draw-Off Line to Reflux Pump */}
      <path d="M 320 270 L 320 350 L 740 350" stroke="#10b981" strokeWidth="4" fill="none" markerEnd="url(#arrow-teal)" />
      <text x="340" y="340" fill="#10b981" fontSize="9" fontFamily="monospace">HYDROCARBON DRAW TO REFLUX PUMP GA-8902</text>

      {/* Water Boot Interface Drain Line */}
      <path d="M 465 348 L 465 390 L 680 390" stroke="#0284c7" strokeWidth="3" fill="none" markerEnd="url(#arrow-cyan)" />
      <text x="480" y="385" fill="#0284c7" fontSize="8" fontFamily="monospace">SOUR WATER TO OWS (LV-8903)</text>

      {/* Hydrocarbon Level Transmitter Bridle LT-8901 */}
      <g transform="translate(140, 200)">
        <line x1="60" y1="-20" x2="0" y2="-20" stroke="#64748b" strokeWidth="1" />
        <line x1="60" y1="40" x2="0" y2="40" stroke="#64748b" strokeWidth="1" />
        <line x1="0" y1="-30" x2="0" y2="50" stroke="#38bdf8" strokeWidth="3" />
        
        <circle cx="-25" cy="10" r="14" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="-25" y="13" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">LT</text>
        <rect x="-65" y="30" width="80" height="18" rx="3" fill="#090d16" stroke="#334155" />
        <text x="-25" y="42" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
          LT: 58.2%
        </text>
      </g>

      {/* Top Dry Vapor Line with N2 Blanketing PCV-8905 */}
      <path d="M 460 140 L 460 70 L 740 70" stroke="#94a3b8" strokeWidth="3" fill="none" markerEnd="url(#arrow-teal)" />
      <text x="500" y="60" fill="#94a3b8" fontSize="8" fontFamily="monospace">OVERHEAD VAPOR RETURN / N2 BLANKETING</text>
    </svg>
  );
};
