import React, { useState } from 'react';
import { useKnowledge } from '../context/KnowledgeContext';
import { PersonaLens, PERSONA_CONFIGS } from '../data/personaData';
import { ActiveTab } from './Navigation';
import { 
  HardHat, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Target
} from 'lucide-react';

interface PersonaLensSelectorProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const PersonaLensSelector: React.FC<PersonaLensSelectorProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { activePersona, setActivePersona, activePersonaConfig } = useKnowledge();
  const [navNotification, setNavNotification] = useState<string | null>(null);

  const personas: { 
    id: PersonaLens; 
    label: string; 
    icon: any; 
    shortDesc: string;
    targetTabLabel: string;
    accentColor: string;
    borderActive: string;
    bgActive: string;
  }[] = [
    {
      id: 'FIELD_OPERATOR',
      label: 'Field Operation',
      icon: HardHat,
      shortDesc: 'Lineups & Voice',
      targetTabLabel: 'Execution Guard & Voice Q&A',
      accentColor: 'text-amber-300',
      borderActive: 'border-amber-400 ring-2 ring-amber-500/40',
      bgActive: 'bg-amber-950/80',
    },
    {
      id: 'MONITORING_SAFETY',
      label: 'Monitoring & Safety',
      icon: ShieldCheck,
      shortDesc: 'DataOps, Digital Twin, RCA & Ingest',
      targetTabLabel: 'Data Ops & P&ID Digital Twin',
      accentColor: 'text-teal-300',
      borderActive: 'border-teal-400 ring-2 ring-teal-500/40',
      bgActive: 'bg-teal-950/80',
    },
  ];

  const handleSelectPersona = (pId: PersonaLens) => {
    setActivePersona(pId);
    const targetConfig = PERSONA_CONFIGS[pId];
    
    // Immediate Auto-Routing to role's primary workspace
    if (targetConfig) {
      onTabChange(targetConfig.recommendedTab);
      setNavNotification(`Switched persona to ${targetConfig.name} → Auto-routed to ${targetConfig.recommendedTab.toUpperCase()} workspace.`);
      setTimeout(() => setNavNotification(null), 3500);
    }
  };

  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case 'HardHat':
        return <HardHat className="w-4 h-4 text-amber-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-teal-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-teal-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 transition-all select-none">
      {/* Main Persona Command Dock */}
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Left: 2 Role Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-300 mr-1 uppercase tracking-wider">
              <Target className="w-3.5 h-3.5 text-teal-400" />
              <span>Persona Lens:</span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 min-w-[320px] sm:min-w-[420px]">
              {personas.map((p) => {
                const isSelected = activePersona === p.id;
                const mascotImg = p.id === 'FIELD_OPERATOR' 
                  ? '/mascots/mascot-field-operator.png' 
                  : '/mascots/mascot-engineer-safety.png';

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPersona(p.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                      isSelected
                        ? `${p.bgActive} ${p.borderActive} ${p.accentColor} shadow-md scale-[1.01]`
                        : 'bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                    title={`Activate ${p.label} role view (auto-routes to ${p.targetTabLabel})`}
                  >
                    <div className="w-6 h-6 rounded-md overflow-hidden bg-slate-900 border border-slate-700/60 shrink-0 flex items-center justify-center p-0.5">
                      <img 
                        src={mascotImg} 
                        alt={p.label} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate leading-tight font-bold">{p.label}</div>
                      <div className="text-[10px] opacity-75 font-mono truncate">{p.shortDesc}</div>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0 ml-1"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Active Mission & Immediate Auto-Route Confirmation */}
          <div className="flex items-center gap-3 flex-wrap text-xs">
            {navNotification ? (
              <div className="px-3 py-1.5 rounded-lg bg-teal-950 border border-teal-500/50 text-teal-200 text-xs font-medium flex items-center gap-2 animate-fadeIn shadow-md">
                <Zap className="w-3.5 h-3.5 text-teal-400 animate-bounce" />
                <span>{navNotification}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <div className="shrink-0 flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-teal-400/60 bg-slate-900 flex items-center justify-center">
                    <img 
                      src={activePersona === 'FIELD_OPERATOR' ? '/mascots/mascot-field-operator.png' : '/mascots/mascot-engineer-safety.png'} 
                      alt="CHAKRA AI Mascot" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  {getPersonaIcon(activePersonaConfig.iconName)}
                </div>
                <div className="text-[11px] max-w-sm sm:max-w-md truncate">
                  <span className="font-bold text-white mr-1.5">
                    {activePersonaConfig.name}:
                  </span>
                  <span className="text-slate-400">
                    {activePersonaConfig.operationalFocus}
                  </span>
                </div>
              </div>
            )}

            {/* Quick KPI pills for active persona */}
            <div className="hidden xl:flex items-center gap-1.5 font-mono text-[10px]">
              {activePersonaConfig.keyKPIs.map((kpi, idx) => (
                <div 
                  key={idx} 
                  className="px-2 py-1 rounded bg-slate-950 border border-slate-800 flex items-center gap-1"
                  title={kpi.hint}
                >
                  <span className="text-slate-400">{kpi.label}:</span>
                  <span className="font-bold text-teal-300">{kpi.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
