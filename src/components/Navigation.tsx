import React, { useRef, useState, useEffect } from 'react';
import { useKnowledge } from '../context/KnowledgeContext';
import { 
  MessageSquareCode, 
  Network, 
  Layers, 
  AlertOctagon, 
  Sparkles, 
  CheckCircle2, 
  FileUp,
  ChevronLeft,
  ChevronRight,
  Star,
  Filter
} from 'lucide-react';

export type ActiveTab = 'qa' | 'dataops' | 'pid' | 'rca' | 'opl' | 'guard' | 'ingest';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { activePersonaConfig } = useKnowledge();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [filterMode, setFilterMode] = useState<'ROLE_CORE' | 'ALL'>('ALL');

  const tabs = [
    {
      id: 'qa' as ActiveTab,
      label: 'Q&A & Semantic Search',
      icon: MessageSquareCode,
      badge: 'CHAKRA AI',
      description: 'Traceable natural language assistant'
    },
    {
      id: 'dataops' as ActiveTab,
      label: 'Industrial Data Ops',
      icon: Network,
      badge: 'Knowledge Graph',
      description: 'Connected SOPs, P&IDs & AIMS'
    },
    {
      id: 'pid' as ActiveTab,
      label: 'P&ID & Digital Twin',
      icon: Layers,
      badge: 'Live DCS',
      description: 'Schematic tag telemetry'
    },
    {
      id: 'rca' as ActiveTab,
      label: 'Failure Memory & RCA',
      icon: AlertOctagon,
      badge: 'STAR & 5-Whys',
      description: 'Past incidents & lessons learned'
    },
    {
      id: 'opl' as ActiveTab,
      label: 'Tacit Knowledge & OPL',
      icon: Sparkles,
      badge: '56 Lessons',
      description: 'One Point Lessons studio'
    },
    {
      id: 'guard' as ActiveTab,
      label: 'Execution Guard',
      icon: CheckCircle2,
      badge: 'Zero-Improper',
      description: 'Verified step-by-step checklist'
    },
    {
      id: 'ingest' as ActiveTab,
      label: 'Document Ingestion',
      icon: FileUp,
      badge: '8 Machine Sets',
      description: 'Convert scattered technical docs'
    },
  ];

  const updateScrollState = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, []);

  // Auto-scroll active tab into view
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector<HTMLElement>('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeTab]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(updateScrollState, 350);
    }
  };

  // Convert vertical mouse wheel into horizontal scroll
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current && e.deltaY !== 0) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
      updateScrollState();
    }
  };

  const visibleTabs = filterMode === 'ROLE_CORE'
    ? tabs.filter((t) => activePersonaConfig.recommendedTabs.includes(t.id))
    : tabs;

  return (
    <nav className="bg-slate-900/95 border-b border-slate-800 px-3 relative select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between relative py-1.5 gap-2">
        {/* Left Scroll Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => handleScroll('left')}
            aria-label="Scroll navigation left"
            className="absolute left-0 z-20 h-9 w-7 bg-gradient-to-r from-slate-900 via-slate-900 to-transparent flex items-center justify-start text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center shadow-md">
              <ChevronLeft className="w-3.5 h-3.5" />
            </div>
          </button>
        )}

        {/* Scrollable Tabs Track */}
        <div
          ref={scrollContainerRef}
          onScroll={updateScrollState}
          onWheel={handleWheel}
          className="flex-1 flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-slate-700/60 hover:scrollbar-thumb-teal-500/60 scrollbar-track-transparent scroll-smooth px-1"
        >
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isPersonaRecommended = activePersonaConfig.recommendedTabs.includes(tab.id);
            const isPersonaPrimary = activePersonaConfig.recommendedTab === tab.id;

            return (
              <button
                key={tab.id}
                data-active={isActive}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border shrink-0 cursor-pointer relative ${
                  isActive
                    ? 'bg-teal-950/90 border-teal-500/60 text-teal-200 shadow-sm shadow-teal-950'
                    : isPersonaPrimary
                    ? 'bg-slate-850 border-teal-600/40 text-slate-200 hover:border-teal-500/60'
                    : 'bg-slate-800/40 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 hover:border-slate-700/60'
                }`}
              >
                {tab.id === 'qa' ? (
                  <div className="w-4 h-4 rounded-full overflow-hidden border border-teal-400 shrink-0 shadow-xs bg-slate-900 flex items-center justify-center">
                    <img 
                      src="/mascots/mascot-hero-avatar.png" 
                      alt="CHAKRA AI Mascot" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                ) : (
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-teal-400' : isPersonaPrimary ? 'text-teal-300' : 'text-slate-400'}`} />
                )}
                <span className="leading-tight">{tab.label}</span>

                {/* Persona Lens Primary Indicator */}
                {isPersonaPrimary && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" title="Recommended for active persona"></span>
                )}

                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0 flex items-center gap-1 ${
                    isActive
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : isPersonaRecommended
                      ? 'bg-teal-950/50 text-teal-300/90 border border-teal-800/50'
                      : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                  }`}
                >
                  {tab.id === 'qa' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                  )}
                  <span>{tab.badge}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Controls: Role Core Toggle */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => {
              const nextMode = filterMode === 'ROLE_CORE' ? 'ALL' : 'ROLE_CORE';
              setFilterMode(nextMode);
              if (nextMode === 'ROLE_CORE' && !activePersonaConfig.recommendedTabs.includes(activeTab)) {
                onTabChange(activePersonaConfig.recommendedTab);
              }
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              filterMode === 'ROLE_CORE'
                ? 'bg-teal-950 text-teal-300 border-teal-500/50 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Filter tabs to active role priority views vs all 7 plant views"
          >
            <Filter className="w-3 h-3 text-teal-400" />
            <span>{filterMode === 'ROLE_CORE' ? `${activePersonaConfig.name} (${activePersonaConfig.recommendedTabs.length})` : 'All 7 Views'}</span>
          </button>
        </div>

        {/* Right Scroll Arrow */}
        {canScrollRight && (
          <button
            onClick={() => handleScroll('right')}
            aria-label="Scroll navigation right"
            className="absolute right-0 z-20 h-9 w-7 bg-gradient-to-l from-slate-900 via-slate-900 to-transparent flex items-center justify-end text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center shadow-md">
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>
        )}
      </div>
    </nav>
  );
};
