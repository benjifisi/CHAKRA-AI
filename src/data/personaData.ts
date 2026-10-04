export type PersonaLens = 'FIELD_OPERATOR' | 'MONITORING_SAFETY';

export interface PersonaConfig {
  id: PersonaLens;
  name: string;
  roleTitle: string;
  department: string;
  badgeLabel: string;
  badgeColorClass: string;
  activeBorderClass: string;
  accentBgClass: string;
  iconName: 'HardHat' | 'ShieldCheck';
  operationalFocus: string;
  recommendedTab: 'qa' | 'dataops' | 'pid' | 'rca' | 'opl' | 'guard' | 'ingest';
  recommendedTabs: ('qa' | 'dataops' | 'pid' | 'rca' | 'opl' | 'guard' | 'ingest')[];
  keyKPIs: {
    label: string;
    value: string;
    hint: string;
  }[];
  suggestedQueries: {
    q: string;
    tag: string;
    category: string;
  }[];
}

export const PERSONA_CONFIGS: Record<PersonaLens, PersonaConfig> = {
  FIELD_OPERATOR: {
    id: 'FIELD_OPERATOR',
    name: 'Field Operation',
    roleTitle: 'Field Operator & Outside Specialist (OSBL/ISBL)',
    department: 'Operations & Field Execution Function',
    badgeLabel: 'FIELD OPERATION LENS',
    badgeColorClass: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
    activeBorderClass: 'border-amber-400 ring-2 ring-amber-500/40',
    accentBgClass: 'from-amber-950/30 to-slate-900',
    iconName: 'HardHat',
    operationalFocus: 'Lineup execution, interlock permissives, casing venting, procedure verification, and glove-friendly voice assistance.',
    recommendedTab: 'guard',
    recommendedTabs: ['qa', 'guard', 'opl'],
    keyKPIs: [
      { label: 'Start Permissives', value: 'Strict Check', hint: 'Zero unverified lineup' },
      { label: 'Voice Input Mode', value: 'GLOVE ACTIVE', hint: 'Hands-free on site' },
      { label: 'Execution Safety', value: 'Step-by-Step', hint: 'Mandatory sign-offs' },
    ],
    suggestedQueries: [
      {
        q: 'What is the startup sequence, seal flush Plan 11 dP requirement, and venting time for Hexane Feed Pump GA-1201A?',
        tag: 'GA-1201A',
        category: 'Field Startup Lineup',
      },
      {
        q: 'How to safely crack open the casing high-point bleeder valve on GA-1201A into closed slop drain to prevent mechanical seal vapor locking?',
        tag: 'GA-1201A',
        category: 'Venting & Priming',
      },
      {
        q: 'What are the lube oil permissives, anti-surge valve testing rules, and dry gas seal buffer requirements for Recycle Gas Compressor KC-4501?',
        tag: 'KC-4501',
        category: 'Rotating Machinery Start',
      },
      {
        q: 'What are the water boot draining protocols and low-level trip interlocks (LSLL-8901) for Reflux Accumulator FA-8901?',
        tag: 'FA-8901',
        category: 'Static Vessel Draining',
      },
    ],
  },

  MONITORING_SAFETY: {
    id: 'MONITORING_SAFETY',
    name: 'Monitoring & Safety',
    roleTitle: 'Plant Monitoring & Process Safety Specialist',
    department: 'Asset Integrity, Reliability & Process Safety',
    badgeLabel: 'MONITORING & SAFETY LENS',
    badgeColorClass: 'bg-teal-950/80 text-teal-300 border-teal-500/50',
    activeBorderClass: 'border-teal-400 ring-2 ring-teal-500/40',
    accentBgClass: 'from-teal-950/30 to-slate-900',
    iconName: 'ShieldCheck',
    operationalFocus: 'Industrial Data Ops knowledge graph, P&ID Digital Twin live telemetry, Failure Memory & RCA 5-Whys, and Technical Document Ingestion.',
    recommendedTab: 'dataops',
    recommendedTabs: ['dataops', 'pid', 'rca', 'ingest'],
    keyKPIs: [
      { label: 'Telemetry Health', value: '8 Machine Sets', hint: 'Live DCS & P&ID Digital Twin' },
      { label: 'Failure Memory', value: '212 WOs Grounded', hint: 'ISO 14224 root cause analysis' },
      { label: 'Document Ingestion', value: 'Automated EDMS', hint: 'PDF & drawing entity extraction' },
    ],
    suggestedQueries: [
      {
        q: 'What are the historical failure root causes, ISO 14224 failure modes, and MTBF for Hexane Feed Pump GA-1201A in the maintenance logs?',
        tag: 'GA-1201A',
        category: 'Failure Memory & RCA',
      },
      {
        q: 'What are the live DCS telemetry drift flags, vibration spectrum limits (VSHH-4501), and lube oil interlocks for Compressor KC-4501?',
        tag: 'KC-4501',
        category: 'Live DCS Telemetry',
      },
      {
        q: 'How does the Industrial Data Ops graph join equipment tags between P&IDs, equipment datasheets, and maintenance work orders?',
        tag: 'GA-1201A',
        category: 'Industrial Data Ops',
      },
      {
        q: 'What is the automated entity extraction schema for ingesting new SOP revisions, P&ID revisions, and OEM datasheets?',
        tag: 'PLANT-DATA-OPS',
        category: 'Document Ingestion',
      },
    ],
  },
};
