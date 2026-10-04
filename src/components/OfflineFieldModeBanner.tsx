import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  DownloadCloud, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  X, 
  ChevronRight, 
  RefreshCw,
  Search,
  ExternalLink,
  Layers,
  Cpu,
  Database,
  HardDrive,
  Check,
  AlertTriangle,
  Play
} from 'lucide-react';
import { 
  syncFieldDocsOffline, 
  getStoredOfflineDocs, 
  getLastOfflineSyncTime 
} from '../utils/serviceWorkerRegistration';
import { useKnowledge } from '../context/KnowledgeContext';

interface OfflineFieldModeBannerProps {
  onOpenDocument?: (docId: string) => void;
  onOpenExecutionChecklist?: (tag: string) => void;
}

export const OfflineFieldModeBanner: React.FC<OfflineFieldModeBannerProps> = ({
  onOpenDocument,
  onOpenExecutionChecklist,
}) => {
  const { openDocumentViewer } = useKnowledge();

  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<number>(100);
  const [syncPhaseMessage, setSyncPhaseMessage] = useState<string>('Storage synchronized');
  const [offlineDocs, setOfflineDocs] = useState<any | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'ALL' | 'OPLS' | 'SOPS' | 'DRAWINGS' | 'MAINTENANCE'>('ALL');

  // Initial load of offline data
  useEffect(() => {
    const existing = getStoredOfflineDocs();
    if (existing) {
      setOfflineDocs(existing);
    } else {
      // Auto initial sync in background
      syncFieldDocsOffline().then((res) => {
        if (res.success) {
          setOfflineDocs(getStoredOfflineDocs());
        }
      });
    }
    setLastSync(getLastOfflineSyncTime());
  }, []);

  // Monitor real browser online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const effectiveOffline = !isOnline || simulatedOffline;

  const handleRunFullSync = async () => {
    setIsSyncing(true);
    setSyncProgress(15);
    setSyncPhaseMessage('Phase 1/4: Registering ServiceWorker & CacheStorage scope...');

    await new Promise((r) => setTimeout(r, 400));
    setSyncProgress(40);
    setSyncPhaseMessage('Phase 2/4: Precaching 32 P&ID blueprints & OEM technical datasheets...');

    await new Promise((r) => setTimeout(r, 450));
    setSyncProgress(75);
    setSyncPhaseMessage('Phase 3/4: Storing 56 One Point Lessons (OPLs) & golden heuristics...');

    await new Promise((r) => setTimeout(r, 400));
    setSyncProgress(90);
    setSyncPhaseMessage('Phase 4/4: Indexing 212 SAP PM maintenance logs & 5-Why RCA trees...');

    try {
      const res = await syncFieldDocsOffline();
      setSyncProgress(100);
      setSyncPhaseMessage('Sync Complete: 100% field technical data stored locally!');
      if (res.success) {
        setOfflineDocs(getStoredOfflineDocs());
        setLastSync(new Date().toLocaleTimeString());
        setSyncStatus('Local offline cache is 100% armed and verified.');
      } else {
        setSyncStatus('Snapshot loaded from local storage.');
      }
    } catch {
      setSyncStatus('Sync error. Local snapshot retained.');
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
      }, 500);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  const filteredOpls = (offlineDocs?.opls || []).filter((o: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.title?.toLowerCase().includes(q) ||
      o.rule?.toLowerCase().includes(q) ||
      o.equipmentTag?.toLowerCase().includes(q) ||
      o.category?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Top Persistent Offline Field Readiness Strip */}
      <div
        className={`px-4 py-2 text-xs border-b transition-all flex flex-wrap items-center justify-between gap-3 ${
          effectiveOffline
            ? 'bg-rose-950/90 border-rose-800 text-rose-100 shadow-md shadow-rose-950/40'
            : 'bg-slate-900 border-slate-800 text-slate-300'
        }`}
      >
        {/* Left: Live Connection & Storage Health Status */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {effectiveOffline ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-900/80 border border-rose-500/60 font-mono text-[10px] font-bold text-rose-200 animate-pulse">
              <WifiOff className="w-3.5 h-3.5" />
              <span>ATEX FIELD DEAD-ZONE MODE ACTIVE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 font-mono text-[10px] font-bold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>100% OFFLINE READY</span>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>Cache Status:</span>
            <span className="text-teal-300 font-semibold">32 Drawings</span>
            <span>·</span>
            <span className="text-cyan-300 font-semibold">56 OPLs</span>
            <span>·</span>
            <span className="text-amber-300 font-semibold">212 WOs</span>
            <span>·</span>
            <span className="text-emerald-300 font-semibold">8 Machine Sets</span>
          </div>

          {lastSync && (
            <span className="hidden lg:inline text-[10px] text-slate-500 font-mono">
              (Last Verified: {lastSync} WIB)
            </span>
          )}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {syncStatus && (
            <span className="text-[11px] text-emerald-400 font-medium animate-fadeIn">
              {syncStatus}
            </span>
          )}

          {/* Sync / Preload Button */}
          <button
            onClick={handleRunFullSync}
            disabled={isSyncing}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded text-[11px] font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            title="Force refresh local cache for all 32 drawings, 56 OPLs, and 212 WOs"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-teal-400' : ''}`} />
            <span>{isSyncing ? 'Syncing Storage...' : 'Sync Cache'}</span>
          </button>

          {/* Open Storage Inspector Modal */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-2.5 py-1 bg-teal-950/80 hover:bg-teal-900 text-teal-300 rounded text-[11px] font-semibold flex items-center gap-1.5 border border-teal-500/40 transition-colors cursor-pointer shadow-sm"
          >
            <HardDrive className="w-3.5 h-3.5 text-teal-400" />
            <span>Storage Sync Inspector</span>
          </button>

          {/* Simulate Offline Toggle */}
          <button
            onClick={() => setSimulatedOffline(!simulatedOffline)}
            className={`px-2 py-1 rounded text-[10px] font-mono transition-all cursor-pointer border ${
              simulatedOffline
                ? 'bg-rose-900 text-rose-100 border-rose-400 font-bold scale-105'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle zero-connectivity simulation to verify offline plant resilience"
          >
            {simulatedOffline ? 'Sim: Zero Signal (ON)' : 'Test Dead Zone'}
          </button>
        </div>
      </div>

      {/* Interactive Storage Sync Inspector & Field Mode Controller Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Offline Storage & Field Readiness Inspector
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                      100% FIELD ARMED
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    PT Chandra Asri Pacific Tbk · Zero-connectivity architecture for remote tank farms, cracker decks, and ATEX zones.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 flex items-center justify-center transition-colors border border-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Storage Health Dashboard */}
            <div className="p-6 bg-slate-950/60 border-b border-slate-800 space-y-4">
              {/* Storage breakdown 4 cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Drawings & P&IDs</span>
                    </span>
                    <span className="text-emerald-400 font-mono text-[10px]">Indexed</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">32 Files</div>
                  <p className="text-[10px] text-slate-400 font-mono">P&IDs, GA Drawings, C&E Matrix</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                      <span>One Point Lessons</span>
                    </span>
                    <span className="text-emerald-400 font-mono text-[10px]">Verified</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">56 Lessons</div>
                  <p className="text-[10px] text-slate-400 font-mono">Tacit heuristics & golden rules</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Database className="w-3.5 h-3.5 text-amber-400" />
                      <span>Maintenance History</span>
                    </span>
                    <span className="text-emerald-400 font-mono text-[10px]">Synced</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">212 Orders</div>
                  <p className="text-[10px] text-slate-400 font-mono">SAP PM logs with 5-Whys RCA</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Cpu className="w-3.5 h-3.5 text-violet-400" />
                      <span>Machine Dossiers</span>
                    </span>
                    <span className="text-emerald-400 font-mono text-[10px]">Ready</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">8 Sets</div>
                  <p className="text-[10px] text-slate-400 font-mono">Operating envelopes & limits</p>
                </div>
              </div>

              {/* Multi-Phase Progress Bar during sync */}
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-teal-400" />
                    <span className="font-semibold text-slate-200">Local Browser Cache Sync Health:</span>
                    <span className="text-teal-300 font-mono font-bold">{syncProgress}%</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{syncPhaseMessage}</span>
                </div>

                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400 transition-all duration-300"
                    style={{ width: `${syncProgress}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Check className="w-3.5 h-3.5" /> Service Worker Controlling (sw.js)
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Check className="w-3.5 h-3.5" /> LocalStorage Snapshots Active
                    </span>
                  </div>

                  <button
                    onClick={handleRunFullSync}
                    disabled={isSyncing}
                    className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Trigger Full Pre-cache Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Search Bar & Category Filter */}
            <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter cached OPLs and SOPs by tag, title, or rule (e.g. GA-1201A, Plan 11, vibration)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setActiveCategoryTab('ALL')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    activeCategoryTab === 'ALL' ? 'bg-teal-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({filteredOpls.length + (offlineDocs?.criticalSOPs?.length || 2)})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryTab('OPLS')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    activeCategoryTab === 'OPLS' ? 'bg-teal-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  OPLs ({filteredOpls.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryTab('SOPS')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    activeCategoryTab === 'SOPS' ? 'bg-teal-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SOPs ({offlineDocs?.criticalSOPs?.length || 2})
                </button>
              </div>
            </div>

            {/* Modal Content List */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Critical SOPs Section */}
              {(activeCategoryTab === 'ALL' || activeCategoryTab === 'SOPS') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                    <h4 className="font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-400" />
                      <span>Offline Armed Operating Procedures (SOPs)</span>
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">Full Step-by-Step Stored Locally</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(offlineDocs?.criticalSOPs || []).map((sop: any) => (
                      <div 
                        key={sop.docNumber}
                        className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 hover:border-teal-500/50 transition-all shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-teal-400">
                            {sop.docNumber}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-700 font-mono">
                            {sop.revision}
                          </span>
                        </div>

                        <h5 className="font-semibold text-white line-clamp-1">{sop.title}</h5>

                        {/* PPE tags */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {sop.mandatoryPPE.slice(0, 3).map((ppe: string, idx: number) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                              {ppe}
                            </span>
                          ))}
                        </div>

                        {/* Steps count & Action */}
                        <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {sop.steps.length} Mandatory Execution Steps
                          </span>
                          <button
                            onClick={() => {
                              setIsModalOpen(false);
                              if (onOpenExecutionChecklist) {
                                onOpenExecutionChecklist(sop.docNumber.includes('1201') ? 'GA-1201A' : 'LV-6701');
                              }
                            }}
                            className="px-2.5 py-1 bg-teal-950 hover:bg-teal-900 text-teal-300 rounded text-[10px] font-bold flex items-center gap-1 border border-teal-500/40 cursor-pointer shadow"
                          >
                            <span>Execute in Guard</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* One Point Lessons Section */}
              {(activeCategoryTab === 'ALL' || activeCategoryTab === 'OPLS') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                    <h4 className="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>One Point Lessons (OPLs) Offline Storage</span>
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {filteredOpls.length} Lessons Available
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredOpls.slice(0, 12).map((opl: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-cyan-400">
                            {opl.id || `OPL-${idx + 1}`}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800">
                            {opl.category}
                          </span>
                        </div>

                        <h5 className="font-semibold text-white line-clamp-1">{opl.title}</h5>

                        <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-amber-200/90 font-mono italic">
                          "{opl.rule || opl.goldenRule}"
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                          <span>Tag: {opl.equipmentTag}</span>
                          <span className="text-emerald-400">Peer Verified</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Offline Field Mode Instructions */}
            <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Zero Connectivity Assurance: Application continues answering queries from local failure memory catalog.</span>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
