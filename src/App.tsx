/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PLANT_UNITS, PlantUnit } from './data/plantData';
import { KnowledgeProvider, useKnowledge } from './context/KnowledgeContext';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { QAAssistant } from './components/QAAssistant';
import { DataOpsGraph } from './components/DataOpsGraph';
import { PIDDigitalTwin } from './components/PIDDigitalTwin';
import { FailureMemoryRCA } from './components/FailureMemoryRCA';
import { OPLStudio } from './components/OPLStudio';
import { ExecutionGuard } from './components/ExecutionGuard';
import { DocumentIngestor } from './components/DocumentIngestor';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { OfflineFieldModeBanner } from './components/OfflineFieldModeBanner';
import { PersonaLensSelector } from './components/PersonaLensSelector';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { 
  Building2, 
  ShieldCheck, 
  HelpCircle, 
  Layers, 
  Network, 
  CheckCircle2,
  FileCheck2,
  ExternalLink,
  Cpu
} from 'lucide-react';

function AppContent() {
  const { selectedUnit, setSelectedUnit, setActivePersona } = useKnowledge();
  const [activeTab, setActiveTab] = useState<ActiveTab>('qa');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const [preselectedTag, setPreselectedTag] = useState<string>('P-101B');
  const [targetPidTag, setTargetPidTag] = useState<string | null>(null);
  const [preselectedSopId, setPreselectedSopId] = useState<string>('sop-lld-1201');
  const [highlightedStepNumber, setHighlightedStepNumber] = useState<number | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setActiveTab('qa');
    }
  };

  const handleOpenExecutionChecklist = (tag: string) => {
    setPreselectedTag(tag);
    setHighlightedStepNumber(null);
    setActiveTab('guard');
  };

  const handleNavigateToSopStep = (sopId: string, stepNumber: number) => {
    setPreselectedSopId(sopId);
    setHighlightedStepNumber(stepNumber);
    setActiveTab('guard');
  };

  const handleNavigateToPid = (tag: string) => {
    setTargetPidTag(tag);
    setActiveTab('pid');
  };

  const handleNavigateToQa = (query: string, tag?: string) => {
    setSearchQuery(query);
    if (tag) setPreselectedTag(tag);
    setActiveTab('qa');
  };

  const handleNavigateToRca = (tag: string) => {
    setPreselectedTag(tag);
    setActiveTab('rca');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      {/* Top Header */}
      <Header
        selectedUnit={selectedUnit}
        onSelectUnit={setSelectedUnit}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onOpenDocument={(docId) => setViewingDocId(docId)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Cross-Functional Persona Lens Strip (Case 1 Improvement) */}
      <PersonaLensSelector
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Offline Field Mode & Critical Docs Precache Strip */}
      <OfflineFieldModeBanner
        onOpenDocument={(docId) => setViewingDocId(docId)}
        onOpenExecutionChecklist={handleOpenExecutionChecklist}
      />

      {/* Main Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'qa' && (
          <QAAssistant
            selectedUnit={selectedUnit}
            searchQuery={searchQuery}
            onSelectEquipmentTag={(tag) => {
              setPreselectedTag(tag);
              setActiveTab('dataops');
            }}
            onOpenDocument={(docId) => setViewingDocId(docId)}
          />
        )}

        {activeTab === 'dataops' && (
          <DataOpsGraph
            selectedUnit={selectedUnit}
            onOpenDocument={(docId) => setViewingDocId(docId)}
            onOpenExecutionChecklist={handleOpenExecutionChecklist}
            onNavigateToQa={handleNavigateToQa}
            onNavigateToPid={handleNavigateToPid}
            onNavigateToRca={handleNavigateToRca}
          />
        )}

        {activeTab === 'pid' && (
          <PIDDigitalTwin
            selectedUnit={selectedUnit}
            targetTag={targetPidTag}
            onOpenDocument={(docId) => setViewingDocId(docId)}
            onSelectTag={(tag) => {
              setPreselectedTag(tag);
            }}
            onNavigateToSopStep={handleNavigateToSopStep}
          />
        )}

        {activeTab === 'rca' && (
          <FailureMemoryRCA
            selectedUnit={selectedUnit}
            onOpenDocument={(docId) => setViewingDocId(docId)}
            onNavigateToSopStep={handleNavigateToSopStep}
            onNavigateToPid={handleNavigateToPid}
          />
        )}

        {activeTab === 'opl' && (
          <OPLStudio
            selectedUnit={selectedUnit}
          />
        )}

        {activeTab === 'guard' && (
          <ExecutionGuard
            selectedUnit={selectedUnit}
            preselectedTag={preselectedTag}
            preselectedSopId={preselectedSopId}
            highlightedStepNumber={highlightedStepNumber}
            onOpenDocument={(docId) => setViewingDocId(docId)}
            onNavigateToPid={handleNavigateToPid}
          />
        )}

        {activeTab === 'ingest' && (
          <DocumentIngestor />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 px-4 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md overflow-hidden border border-teal-400/60 shrink-0 bg-slate-950 flex items-center justify-center p-0.5">
              <img 
                src="/mascots/mascot-hero-avatar.png" 
                alt="CHAKRA AI Mascot" 
                className="w-full h-full object-contain" 
              />
            </div>
            <span className="font-semibold text-slate-300">
              CHAKRA AI
            </span>
            <span className="text-slate-600">·</span>
            <span>Chandra Asri Knowledge & Reliability Assistant</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Integrated Systems: EDMS · AIMS · DCS · SAP PM · OPL Studio</span>
            <span>·</span>
            <span>PSM Level 4 Certified</span>
          </div>
        </div>
      </footer>

      {/* Floating CHAKRA AI Mascot Copilot Widget */}
      <aside 
        aria-label="CHAKRA AI Quick Copilot"
        className="fixed bottom-6 right-6 z-40 flex items-center group select-none"
      >
        <div className="mr-3 hidden md:flex flex-col items-end opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-x-2 group-hover:translate-x-0">
          <div className="bg-slate-900/95 border border-teal-500/50 shadow-2xl rounded-xl px-3.5 py-2.5 text-right backdrop-blur-md">
            <p className="text-xs font-bold text-white flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              <span>CHAKRA AI Copilot</span>
            </p>
            <p className="text-[11px] text-teal-300 font-medium">Plant Mascot & Grounded Assistant</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Click to Open Q&A · Press Cmd+K</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveTab('qa');
          }}
          className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-teal-400/90 bg-gradient-to-b from-teal-900/50 to-slate-950 shadow-2xl shadow-teal-500/40 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center group-hover:ring-4 group-hover:ring-teal-500/30 p-1"
          title="CHAKRA AI Mascot · Click to consult Plant Copilot"
          aria-label="Open CHAKRA AI Assistant"
        >
          <img 
            src="/mascots/mascot-flying-copilot.png" 
            alt="CHAKRA AI Mascot" 
            className="w-full h-full object-contain" 
          />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" title="CHAKRA AI Ready"></span>
        </button>
      </aside>

      {/* Cmd+K Global Command Palette (Item 3 Improvement) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateToTab={(tab) => setActiveTab(tab)}
        onSelectTag={(tag) => {
          setPreselectedTag(tag);
          setTargetPidTag(tag);
        }}
        onSelectPersona={(persona) => {
          setActivePersona(persona);
        }}
        onAskAi={(query) => {
          setSearchQuery(query);
          setActiveTab('qa');
        }}
      />

      {/* Controlled Document Viewer Drawer / Modal */}
      <DocumentViewerModal
        documentId={viewingDocId}
        onClose={() => setViewingDocId(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <KnowledgeProvider>
      <AppContent />
    </KnowledgeProvider>
  );
}
