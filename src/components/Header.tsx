import React from 'react';
import { PLANT_UNITS, PlantUnit } from '../data/plantData';
import { 
  Building2, 
  Activity, 
  ShieldCheck, 
  FileText, 
  Search, 
  Cpu, 
  AlertTriangle,
  Clock
} from 'lucide-react';

interface HeaderProps {
  selectedUnit: PlantUnit;
  onSelectUnit: (unit: PlantUnit) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
  onOpenDocument?: (docId: string) => void;
  onOpenCommandPalette?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedUnit,
  onSelectUnit,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onOpenCommandPalette,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl backdrop-blur-md bg-opacity-95">
      {/* Top Banner: CHAKRA Plant Intelligence Context */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-cyan-950 border-b border-teal-900/40 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>CHAKRA</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-medium">
            Chandra Asri Knowledge & Reliability Assistant (AI-Powered Plant Integration)
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Shift 1 (07:00 - 15:00 WIB) · Cilegon & Ciwandan Complex</span>
          </span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PSM Level 4 Compliance Active</span>
          </span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div 
            className="relative group cursor-pointer" 
            onClick={() => onOpenCommandPalette && onOpenCommandPalette()} 
            title="CHAKRA AI Mascot · Official Plant Copilot (Click to open Command Palette)"
          >
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-b from-teal-900/50 to-slate-900 border-2 border-teal-400/80 shadow-lg shadow-teal-500/25 flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:border-teal-300 p-0.5">
              <img 
                src="/mascots/mascot-hero-avatar.png" 
                alt="CHAKRA AI Mascot" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" title="Mascot Online"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                <span>CHAKRA AI</span>
                <span className="text-xs font-mono font-medium px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  ONLINE
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Chandra Asri Knowledge & Reliability Assistant · PT Chandra Asri Pacific Tbk
            </p>
          </div>
        </div>

        {/* Search Bar with Cmd+K Quick Trigger */}
        <div className="flex-1 max-w-md">
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tags (GA-1201A, KC-4501), SOPs, P&IDs, failure RCA..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => onOpenCommandPalette && onOpenCommandPalette()}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-24 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400 transition-all cursor-pointer"
            />
            
            <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
              {onOpenCommandPalette && (
                <button
                  type="button"
                  onClick={onOpenCommandPalette}
                  className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-400 hover:text-white cursor-pointer"
                  title="Open Command Palette (Cmd+K / Ctrl+K)"
                >
                  <span>⌘K</span>
                </button>
              )}
              <button
                type="button"
                onClick={onSearchSubmit}
                className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-[11px] font-medium transition-colors shadow cursor-pointer"
              >
                Ask AI
              </button>
            </div>
          </div>
        </div>

        {/* Active Plant Facility Status Badge */}
        <div className="flex items-center gap-2.5 bg-slate-950/90 border border-slate-700/80 px-3.5 py-1.5 rounded-lg shadow-inner">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100">
              <span>LLDPE Plant Complex</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                ONLINE
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              8 Machine Sets · 212 WOs · 56 OPLs
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
