import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Layers, 
  CheckCircle2, 
  AlertOctagon, 
  Sparkles, 
  FileText, 
  X, 
  ArrowRight, 
  Cpu, 
  Activity,
  HardHat,
  Wrench,
  ShieldCheck,
  ClipboardCheck,
  CornerDownLeft
} from 'lucide-react';
import { ActiveTab } from './Navigation';
import { PersonaLens } from '../data/personaData';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: ActiveTab) => void;
  onSelectTag: (tag: string) => void;
  onSelectPersona?: (persona: PersonaLens) => void;
  onAskAi: (query: string) => void;
}

interface PaletteItem {
  id: string;
  category: 'EQUIPMENT' | 'INSTRUMENT' | 'SOP' | 'OPL' | 'PERSONA';
  title: string;
  subtitle: string;
  tag?: string;
  targetTab: ActiveTab;
  actionText: string;
  icon: any;
  personaId?: PersonaLens;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onSelectTag,
  onSelectPersona,
  onAskAi,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const ALL_ITEMS: PaletteItem[] = [
    // Personas (2 Focused Roles)
    {
      id: 'p-operator',
      category: 'PERSONA',
      title: 'Field Operation Lens',
      subtitle: 'Switch role to startup lineups, casing venting, procedure verification, and hands-free voice assistance',
      targetTab: 'guard',
      actionText: 'Activate Role',
      icon: HardHat,
      personaId: 'FIELD_OPERATOR',
    },
    {
      id: 'p-monitoring-safety',
      category: 'PERSONA',
      title: 'Monitoring & Safety Lens',
      subtitle: 'Switch role to Industrial Data Ops, P&ID Digital Twin, Failure Memory & RCA, and Document Ingestion',
      targetTab: 'dataops',
      actionText: 'Activate Role',
      icon: ShieldCheck,
      personaId: 'MONITORING_SAFETY',
    },

    // 8 Machines
    {
      id: 'eq-ga1201a',
      category: 'EQUIPMENT',
      title: 'GA-1201A · Hexane Feed Pump',
      subtitle: 'Centrifugal pump with API Plan 11+62 seal flush · Set 01 LLDPE Unit',
      tag: 'GA-1201A',
      targetTab: 'pid',
      actionText: 'View P&ID',
      icon: Cpu,
    },
    {
      id: 'eq-yd2301',
      category: 'EQUIPMENT',
      title: 'YD-2301 · Polymer Fluid Bed Dryer',
      subtitle: 'Fluidized drying bed with O2 analyzer trip ASHH-2307 · Set 02',
      tag: 'YD-2301',
      targetTab: 'pid',
      actionText: 'View P&ID',
      icon: Cpu,
    },
    {
      id: 'eq-dc3401a',
      category: 'EQUIPMENT',
      title: 'DC-3401A · Catalyst Reduction Reactor',
      subtitle: 'Agitated autoclave reactor with TEAL catalyst batching · Set 03',
      tag: 'DC-3401A',
      targetTab: 'pid',
      actionText: 'View P&ID',
      icon: Cpu,
    },
    {
      id: 'eq-kc4501',
      category: 'EQUIPMENT',
      title: 'KC-4501 · Recycle Gas Compressor',
      subtitle: 'Centrifugal compressor with anti-surge valve ASV-4501 & DGS buffer · Set 04',
      tag: 'KC-4501',
      targetTab: 'pid',
      actionText: 'View P&ID',
      icon: Cpu,
    },
    {
      id: 'eq-ea5601',
      category: 'EQUIPMENT',
      title: 'EA-5601 · Solvent Heater Exchanger',
      subtitle: 'TEMA BEU Shell & tube heat exchanger · Set 05',
      tag: 'EA-5601',
      targetTab: 'pid',
      actionText: 'View P&ID',
      icon: Cpu,
    },
    {
      id: 'eq-lv6701',
      category: 'EQUIPMENT',
      title: 'LV-6701 · Separator Level Control Valve',
      subtitle: 'Fisher globe valve with cavitation trim and DVC6200 positioner · Set 06',
      tag: 'LV-6701',
      targetTab: 'pid',
      actionText: 'View P&ID',
      icon: Cpu,
    },
    {
      id: 'eq-ct7801',
      category: 'EQUIPMENT',
      title: 'CT-7801 · Cooling Tower Cell Fan',
      subtitle: 'Induced draft cooling tower fan with vibration switch VSHH-7802 · Set 07',
      tag: 'CT-7801',
      targetTab: 'pid',
      actionText: 'View P&ID',
      icon: Cpu,
    },
    {
      id: 'eq-fa8901',
      category: 'EQUIPMENT',
      title: 'FA-8901 · Reflux Accumulator Drum',
      subtitle: 'Horizontal reflux drum with boot water drain & LSLL-8901 interlock · Set 08',
      tag: 'FA-8901',
      targetTab: 'pid',
      actionText: 'View P&ID',
      icon: Cpu,
    },

    // P&ID Instruments & Hotspots
    {
      id: 'ins-xv1201',
      category: 'INSTRUMENT',
      title: 'XV-1201 · Suction Isolation Valve',
      subtitle: '100% Full Open Permissive · Linked to SOP Step 2',
      tag: 'GA-1201A',
      targetTab: 'guard',
      actionText: 'Inspect Step',
      icon: Activity,
    },
    {
      id: 'ins-pdi1201',
      category: 'INSTRUMENT',
      title: 'PDI-1201 · Plan 11 Seal Flush Differential Pressure',
      subtitle: '>= 1.5 bar start permissive boundary · Linked to SOP Step 4',
      tag: 'GA-1201A',
      targetTab: 'guard',
      actionText: 'Inspect Step',
      icon: Activity,
    },
    {
      id: 'ins-ashh2307',
      category: 'INSTRUMENT',
      title: 'ASHH-2307 · Fluid Bed O2 Analyzer Interlock',
      subtitle: 'Trip threshold <= 0.05% O2 in nitrogen envelope · Linked to SIS',
      tag: 'YD-2301',
      targetTab: 'dataops',
      actionText: 'View SIS Logic',
      icon: Activity,
    },

    // Procedures
    {
      id: 'sop-lld1201',
      category: 'SOP',
      title: 'CAP-SOP-LLD-1201 · Hexane Feed Pump Start-up',
      subtitle: '8-step verified procedure with 180s bleed timer & double sign-offs',
      tag: 'GA-1201A',
      targetTab: 'guard',
      actionText: 'Launch Guard',
      icon: FileText,
    },
    {
      id: 'sop-ole042',
      category: 'SOP',
      title: 'CAP-SOP-OLE-042 · Control Valve Cavitation Arrest',
      subtitle: 'Emergency bypass engagement and trim chatter diagnostic protocol',
      tag: 'LV-6701',
      targetTab: 'guard',
      actionText: 'Launch Guard',
      icon: FileText,
    },

    // One Point Lessons
    {
      id: 'opl-2026-004',
      category: 'OPL',
      title: 'OPL-2026-004 · 180-Second Casing Bleed Protocol',
      subtitle: 'Always crack casing high-point bleeder into slop header to avoid seal vapor lock',
      tag: 'GA-1201A',
      targetTab: 'opl',
      actionText: 'Read OPL',
      icon: Sparkles,
    },
    {
      id: 'opl-2026-012',
      category: 'OPL',
      title: 'OPL-2026-012 · High Bearing Temperature TSHH-1201',
      subtitle: 'Never restart pump if bearing housing exceeds 75°C without checking flush dP',
      tag: 'GA-1201A',
      targetTab: 'rca',
      actionText: 'View RCA',
      icon: AlertOctagon,
    },
  ];

  const filteredItems = ALL_ITEMS.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      (item.tag && item.tag.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleSelectItem = (item: PaletteItem) => {
    if (item.category === 'PERSONA' && item.personaId && onSelectPersona) {
      onSelectPersona(item.personaId);
    } else {
      if (item.tag) {
        onSelectTag(item.tag);
      }
      onNavigateToTab(item.targetTab);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelectItem(filteredItems[selectedIndex]);
      } else if (query.trim()) {
        onAskAi(query);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-16 px-4 pb-4 animate-fadeIn select-none">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar with Mascot */}
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-teal-400/60 shrink-0 shadow-sm bg-slate-900 flex items-center justify-center p-0.5">
            <img 
              src="/mascots/mascot-hero-avatar.png" 
              alt="CHAKRA AI Mascot" 
              className="w-full h-full object-contain" 
            />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type machine tag (GA-1201A), instrument (XV-1201), procedure, or role..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-sans"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shrink-0">
              ESC to close
            </span>
          )}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 flex-1 text-xs">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-slate-400">No exact plant tag or document matched "{query}".</p>
              <button
                type="button"
                onClick={() => {
                  onAskAi(query);
                  onClose();
                }}
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-lg font-medium text-xs inline-flex items-center gap-2 cursor-pointer shadow"
              >
                <div className="w-4 h-4 rounded-full overflow-hidden border border-white/60 shrink-0 bg-slate-900 flex items-center justify-center">
                  <img src="/mascots/mascot-pose-thinking.png" alt="CHAKRA AI" className="w-full h-full object-contain" />
                </div>
                <span>Ask CHAKRA AI in Q&A Assistant</span>
              </button>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-950/80 border border-teal-500/60 shadow-md ring-1 ring-teal-500/30'
                      : 'bg-slate-900/40 border border-transparent hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      isSelected ? 'bg-teal-900 border-teal-400 text-teal-200' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {item.title}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-slate-950 text-slate-400 border border-slate-800">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-teal-400 font-medium font-mono">
                      {item.actionText}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-300 translate-x-0.5' : 'text-slate-600'} transition-transform`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <CornerDownLeft className="w-3 h-3 text-teal-400" />
            <span>Instant Plant Navigation Matrix</span>
          </div>
        </div>
      </div>
    </div>
  );
};
