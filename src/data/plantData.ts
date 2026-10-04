import { CALIBER_56_OPLS } from './caliberRealData';

export interface PlantUnit {
  id: string;
  name: string;
  code: string;
  location: string;
  capacity: string;
  description: string;
  status: "OPTIMAL" | "ADVISORY" | "MAINTENANCE";
  activeAlerts: number;
}

export interface EquipmentTag {
  tag: string;
  name: string;
  unitId: string;
  setNumber: number;
  category: "Rotating Equipment" | "Static Equipment" | "Instrumentation & Control" | "Rotating Machinery" | "Static / Rotating Assembly";
  criticality: string;
  pidDrawing: string;
  datasheetDoc: string;
  gaDrawing?: string;
  interlockDoc?: string;
  plotPlanDoc?: string;
  interlockSequence?: string;
  sopDocs: string[];
  fluidService: string;
  keyInterlocks: string[];
  operatingLimits: {
    dischargePressure?: { normal: string; tripHigh: string; tripLow?: string; unit: string };
    suctionPressure?: { normal: string; tripLow?: string; unit: string };
    temperature?: { normal: string; tripHigh: string; unit: string };
    bedTemperature?: { normal: string; tripHigh: string; unit: string };
    vibration?: { normal: string; tripHigh: string; unit: string };
    crossheadVibration?: { normal: string; tripHigh: string; unit: string };
    fanVibration?: { normal: string; tripHigh: string; unit: string };
    flowRate?: { normal: string; minContinuous: string; unit: string };
    sealFlushDP?: { normal: string; tripLow: string; unit: string };
    [key: string]: any;
  };
  aimsData: {
    corrosionAllowanceMm: number;
    measuredWallThicknessMm: number;
    minimumAllowedWallMm: number;
    corrosionRateMmPerYear: number;
    remainingLifeYears: number;
    lastInspectionDate: string;
    nextInspectionDue: string;
    inspectionType: string;
    status: "Satisfactory" | "Action Required" | "Critical Review";
  };
  liveDCS: {
    dischargePressure: number;
    suctionPressure?: number;
    temperature: number;
    flow: number;
    vibration?: number;
    sealDP?: number;
    status: "NORMAL" | "WARNING" | "ALERT";
  };
  maintenanceStats: {
    totalRecords: number;
    breakdownCount: number;
    totalCostIDR: number;
    totalDowntimeHours: number;
    lastMaintenance: string;
    mtbfHours: number;
  };
  tacitTipsCount: number;
}

export interface SOPDocument {
  id: string;
  docNumber: string;
  title: string;
  unitId: string;
  revision: string;
  status: "APPROVED & ACTIVE" | "UNDER MOC REVIEW" | "SUPERSEDED";
  effectiveDate: string;
  reviewDate: string;
  approvedBy: string;
  targetEquipment: string[];
  executionRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  mandatoryPPE: string[];
  permitsRequired: string[];
  summary: string;
  steps: {
    stepNumber: number;
    phase: "Pre-Execution Checks" | "Execution & Line-up" | "Verification & Tuning" | "Handover & Normalization";
    action: string;
    cautionNote?: string;
    interlockRequirement?: string;
    isMandatorySignoff: boolean;
  }[];
  tacitAdditions: string[];
}

export interface IncidentRCA {
  id: string;
  incidentNumber: string;
  title: string;
  unitId: string;
  equipmentTag: string;
  date: string;
  severity: "Catastrophic" | "Major Loss" | "Moderate" | "Near Miss";
  symptoms: string;
  fiveWhys: {
    whyNumber: number;
    question: string;
    answer: string;
  }[];
  rootCauseCategory: "Improper Procedure Execution" | "Tacit Knowledge Gap" | "Equipment Mechanical Fatigue" | "Sensor Drift";
  rootCauseSummary: string;
  immediateActionTaken: string;
  preventativeActions: string[];
  lessonsLearned: string;
  pidRef: string;
  sopUpdateRef: string;
}

export interface OnePointLesson {
  id: string;
  oplNumber: string;
  title: string;
  unitId: string;
  category: "Safety" | "Basic Operation" | "Troubleshooting" | "Improvement";
  equipmentTag: string;
  authorName: string;
  authorRole: string;
  experienceYears: number;
  publishedDate: string;
  verifiedBy: string;
  goldenRule: string;
  practicalTip: string;
  visualCheckNote: string;
  consequencesOfOmission: string;
  upvotes: number;
  verificationStatus?: 'VERIFIED' | 'PENDING_REVIEW' | 'REJECTED';
  verifierRole?: string;
  verifiedAt?: string;
  verifierComment?: string;
  safetyScore?: number;
  mocRequired?: boolean;
}

export const PLANT_UNITS: PlantUnit[] = [
  {
    id: "unit-lldpe",
    name: "LLDPE Unit (Linear Low Density Polyethylene)",
    code: "LLDPE",
    location: "Chandra Asri Polyethylene Complex, Cilegon",
    capacity: "400 KTA LLDPE Polymer Resins",
    description: "Hosts the 8 Critical Machine Sets: Feed Prep GA-1201A, Dryer YD-2301, Reactor DC-3401A, Compressor KC-4501, Heater EA-5601, Valve LV-6701, Fan CT-7801, and Drum FA-8901.",
    status: "OPTIMAL",
    activeAlerts: 1,
  },
  {
    id: "unit-olefins",
    name: "Olefins Cracker Complex",
    code: "OLE",
    location: "Chandra Asri Plant 1, Cilegon",
    capacity: "900 KTA Ethylene / 490 KTA Propylene",
    description: "Pyrolysis furnaces, quench trains, cracked gas compression, and fractionation.",
    status: "OPTIMAL",
    activeAlerts: 0,
  },
  {
    id: "unit-pp",
    name: "Polypropylene (PP) Plant",
    code: "PP",
    location: "Chandra Asri Plant 1, Cilegon",
    capacity: "590 KTA Polypropylene",
    description: "Homopolymer and impact copolymer production trains.",
    status: "OPTIMAL",
    activeAlerts: 0,
  },
  {
    id: "unit-bd",
    name: "Butadiene Extraction Plant",
    code: "BD",
    location: "Chandra Asri Plant 1, Cilegon",
    capacity: "137 KTA Butadiene",
    description: "Acetonitrile (ACN) extractive distillation system.",
    status: "OPTIMAL",
    activeAlerts: 0,
  }
];

export const EQUIPMENT_DATABASE: EquipmentTag[] = [
  {
    tag: "GA-1201A",
    name: "HEXANE FEED PUMP",
    unitId: "unit-lldpe",
    setNumber: 1,
    category: "Rotating Equipment",
    criticality: "HIGH CRITICAL",
    pidDrawing: "PID_Set_01.png",
    datasheetDoc: "Equipment Datasheet - GA-1201A.pdf",
    gaDrawing: "Equipment GA Drawing - GA-1201A.pdf",
    interlockDoc: "Interlock Logic Diagram - GA-1201A.pdf",
    plotPlanDoc: "Plot Plan - GA-1201A.pdf",
    interlockSequence: "SEQ-1201",
    sopDocs: ["CAP-SOP-LLD-1201", "CAP-SOP-GEN-018"],
    fluidService: "Hexane Feed Solvent (SG 0.66 @ 35°C)",
    keyInterlocks: [
      "PSLL-1201: Suction Pressure Low-Low (0.5 barg Trip)",
      "PDI-1201: Plan 11+62 Seal Flush dP > 1.5 bar (Start Permissive)",
      "ZSO-1201: Suction Valve XV-1201 100% Open (Start Permissive)",
      "TSHH-1201: Bearing Temperature High-High Trip",
      "VSHH-1201: Bearing Vibration High-High Trip",
      "FSLL-1201: Discharge Low-Low Flow Trip (9 m3/h, min flow FV-1201 opens)"
    ],
    operatingLimits: {
      dischargePressure: { normal: "18.5", tripHigh: "24.0", unit: "barg" },
      suctionPressure: { normal: "1.8", tripLow: "0.5", unit: "barg" },
      temperature: { normal: "35.0", tripHigh: "85.0", unit: "°C" },
      vibration: { normal: "1.8", tripHigh: "4.5", unit: "mm/s RMS" },
      flowRate: { normal: "24.0", minContinuous: "9.0", unit: "m³/h" },
      sealFlushDP: { normal: "2.1", tripLow: "1.5", unit: "bar" }
    },
    aimsData: {
      corrosionAllowanceMm: 3.0,
      measuredWallThicknessMm: 12.8,
      minimumAllowedWallMm: 9.5,
      corrosionRateMmPerYear: 0.06,
      remainingLifeYears: 24.5,
      lastInspectionDate: "2024-08-14",
      nextInspectionDue: "2027-08-14",
      inspectionType: "API 510 Ultrasonic Thickness Grid",
      status: "Satisfactory"
    },
    liveDCS: {
      dischargePressure: 18.6,
      suctionPressure: 1.9,
      temperature: 36.2,
      flow: 23.8,
      vibration: 1.9,
      status: "NORMAL"
    },
    maintenanceStats: {
      totalRecords: 26,
      breakdownCount: 1,
      totalCostIDR: 29794000,
      totalDowntimeHours: 6.5,
      lastMaintenance: "2025-11-16",
      mtbfHours: 8760
    },
    tacitTipsCount: 7
  },
  {
    tag: "YD-2301",
    name: "POLYMER FLUID BED DRYER",
    unitId: "unit-lldpe",
    setNumber: 2,
    category: "Static / Rotating Assembly",
    criticality: "HIGH CRITICAL",
    pidDrawing: "P&ID_Set_02.png",
    datasheetDoc: "Equipment Datasheet - YD-2301.pdf",
    gaDrawing: "Equipment GA Drawing - YD-2301.pdf",
    interlockDoc: "Interlock Logic Diagram - YD-2301.pdf",
    plotPlanDoc: "Plot Plan - YD-2301.pdf",
    interlockSequence: "SEQ-2301 / SEQ-5500",
    sopDocs: ["CAP-SOP-LLD-2301"],
    fluidService: "Polymer Powder with N2 Inert Carrier Gas",
    keyInterlocks: [
      "PSL-2306: Gearbox Lube Oil Pressure OK (Trip on Low)",
      "ASHH-2307: O2 Analyzer Inerting Level < 100 ppm (Start Permissive)",
      "TSHH-2301: Bed Temperature High-High Trip",
      "Kadant Rotary Joint API Plan 11+62 steam seal check",
      "SCM440 Drive Chain & Sprocket lubrication permissive"
    ],
    operatingLimits: {
      bedTemperature: { normal: "78.0", tripHigh: "95.0", unit: "°C" },
      temperature: { normal: "78.0", tripHigh: "95.0", unit: "°C" },
      dischargePressure: { normal: "0.15", tripHigh: "0.45", unit: "barg" },
      flowRate: { normal: "450", minContinuous: "180", unit: "Nm³/h" }
    },
    aimsData: {
      corrosionAllowanceMm: 4.0,
      measuredWallThicknessMm: 16.2,
      minimumAllowedWallMm: 12.0,
      corrosionRateMmPerYear: 0.08,
      remainingLifeYears: 22.0,
      lastInspectionDate: "2024-09-10",
      nextInspectionDue: "2027-09-10",
      inspectionType: "Internal Drum NDT & Trunnion Alignment",
      status: "Satisfactory"
    },
    liveDCS: {
      dischargePressure: 0.15,
      temperature: 79.4,
      flow: 440,
      status: "NORMAL"
    },
    maintenanceStats: {
      totalRecords: 28,
      breakdownCount: 5,
      totalCostIDR: 94728000,
      totalDowntimeHours: 68.5,
      lastMaintenance: "2025-12-10",
      mtbfHours: 1752
    },
    tacitTipsCount: 7
  },
  {
    tag: "DC-3401A",
    name: "CATALYST REDUCTION REACTOR",
    unitId: "unit-lldpe",
    setNumber: 3,
    category: "Static Equipment",
    criticality: "HIGH CRITICAL",
    pidDrawing: "P&ID Set 3.png",
    datasheetDoc: "Equipment Datasheet - DC-3401A.pdf",
    gaDrawing: "Equipment Drawing DC-3401A.pdf",
    interlockDoc: "Interlock Logic Diagram DC-3401A.pdf",
    plotPlanDoc: "Plot Plan DC-3401A.pdf",
    interlockSequence: "SEQ-3401",
    sopDocs: ["CAP-SOP-LLD-3401"],
    fluidService: "Ziegler-Natta Catalyst Slurry with Hydrogen Reduction",
    keyInterlocks: [
      "AI-3401: O2 Freeing Below 100 ppm (Interlock T3, Permissive to start)",
      "Interlock T4: N2 Flow > 150 kg/h to maintain/increase flow on trip",
      "TSHH-3401: Catalyst Bed High-High Temp > 230°C (2oo3 voting Trip)",
      "TIC-17343: Heater EA-3401 Element Over-Temperature Skin TC > 280°C Trip",
      "PSHH-3404: High-High Pressure > 5 barg trips PV-3404 open to vent"
    ],
    operatingLimits: {
      dischargePressure: { normal: "3.2", tripHigh: "5.0", unit: "barg" },
      temperature: { normal: "185.0", tripHigh: "230.0", unit: "°C" },
      flowRate: { normal: "180", minContinuous: "150", unit: "kg/h" }
    },
    aimsData: {
      corrosionAllowanceMm: 4.5,
      measuredWallThicknessMm: 28.4,
      minimumAllowedWallMm: 22.0,
      corrosionRateMmPerYear: 0.05,
      remainingLifeYears: 32.0,
      lastInspectionDate: "2024-05-18",
      nextInspectionDue: "2028-05-18",
      inspectionType: "Reactor Shell Ultrasonic & Multipoint TE Calibration",
      status: "Satisfactory"
    },
    liveDCS: {
      dischargePressure: 3.3,
      temperature: 188.5,
      flow: 182,
      status: "NORMAL"
    },
    maintenanceStats: {
      totalRecords: 27,
      breakdownCount: 5,
      totalCostIDR: 71795000,
      totalDowntimeHours: 60,
      lastMaintenance: "2025-12-07",
      mtbfHours: 1752
    },
    tacitTipsCount: 7
  },
  {
    tag: "KC-4501",
    name: "RECYCLE GAS COMPRESSOR",
    unitId: "unit-lldpe",
    setNumber: 4,
    category: "Rotating Machinery",
    criticality: "HIGH CRITICAL",
    pidDrawing: "P&ID SET 4.png",
    datasheetDoc: "Equipment Datasheet - KC-4501.pdf",
    gaDrawing: "Equipment GA Drawing KC-4501.pdf",
    interlockDoc: "Interlock Logic Diagram KC-4501.pdf",
    plotPlanDoc: "Plot Plan KC-4501.pdf",
    interlockSequence: "SEQ-4501",
    sopDocs: ["CAP-SOP-LLD-4501"],
    fluidService: "Ethylene Recycle Gas with Hydrogen & Hexane Vapors",
    keyInterlocks: [
      "PSLL-4504: Lube Oil Header Pressure Low-Low (Trip motor)",
      "FT-4506: Seal Gas Nitrogen Buffer Pressure DP Permissive",
      "FV-4502: Anti-Surge Recycle Valve (Opens fast on low flow)",
      "VSHH-4505: Crosshead Vibration High-High Trip",
      "LSHH-4510: Suction KO Drum FA-4510 Liquid Level High-High Trip",
      "FSL-4508: Jacket Cooling Water Low Flow Trip"
    ],
    operatingLimits: {
      dischargePressure: { normal: "28.5", tripHigh: "34.0", unit: "barg" },
      suctionPressure: { normal: "2.4", tripLow: "1.0", unit: "barg" },
      temperature: { normal: "92.0", tripHigh: "125.0", unit: "°C" },
      vibration: { normal: "14.0", tripHigh: "28.0", unit: "µm pk-pk" },
      flowRate: { normal: "11400", minContinuous: "4500", unit: "Nm³/h" }
    },
    aimsData: {
      corrosionAllowanceMm: 5.0,
      measuredWallThicknessMm: 38.2,
      minimumAllowedWallMm: 30.0,
      corrosionRateMmPerYear: 0.11,
      remainingLifeYears: 26.0,
      lastInspectionDate: "2024-04-12",
      nextInspectionDue: "2027-04-12",
      inspectionType: "Reciprocating Compressor Cylinder & Crosshead NDT",
      status: "Satisfactory"
    },
    liveDCS: {
      dischargePressure: 28.6,
      suctionPressure: 2.5,
      temperature: 92.4,
      flow: 11400,
      vibration: 15.2,
      status: "NORMAL"
    },
    maintenanceStats: {
      totalRecords: 27,
      breakdownCount: 2,
      totalCostIDR: 50603000,
      totalDowntimeHours: 38,
      lastMaintenance: "2025-12-06",
      mtbfHours: 4380
    },
    tacitTipsCount: 7
  },
  {
    tag: "EA-5601",
    name: "SOLVENT HEATER",
    unitId: "unit-lldpe",
    setNumber: 5,
    category: "Static Equipment",
    criticality: "LOW CRITICAL",
    pidDrawing: "P&ID SET 5.png",
    datasheetDoc: "Equipment Datasheet - EA-5601.pdf",
    gaDrawing: "Equipment GA Drawing EA-5601.pdf",
    interlockDoc: "Interlock Logic Diagram EA-5601.pdf",
    plotPlanDoc: "Plot Plan EA-5601.pdf",
    interlockSequence: "IL-EA-5601",
    sopDocs: ["CAP-SOP-LLD-5601"],
    fluidService: "Hexane Solvent Heated by Medium Pressure Steam",
    keyInterlocks: [
      "PDAH-5605 / PDT-5605: Tube Differential Pressure > 0.7 bar Fouling Alarm",
      "TI-5604: Condensate Steam Trap Assembly Health Check",
      "PSV-5607: Statutory Relief Valve set at 16 barg",
      "TCV-5602 / TV-5602: Steam Temperature Control Valve fail-safe closed"
    ],
    operatingLimits: {
      dischargePressure: { normal: "6.2", tripHigh: "16.0", unit: "barg" },
      temperature: { normal: "145.0", tripHigh: "180.0", unit: "°C" },
      flowRate: { normal: "120", minContinuous: "40", unit: "m³/h" }
    },
    aimsData: {
      corrosionAllowanceMm: 3.5,
      measuredWallThicknessMm: 11.2,
      minimumAllowedWallMm: 8.0,
      corrosionRateMmPerYear: 0.15,
      remainingLifeYears: 12.0,
      lastInspectionDate: "2024-06-20",
      nextInspectionDue: "2026-06-20",
      inspectionType: "Eddy Current Tube Testing (ECT) & IRIS",
      status: "Action Required"
    },
    liveDCS: {
      dischargePressure: 6.2,
      temperature: 147.2,
      flow: 120,
      status: "NORMAL"
    },
    maintenanceStats: {
      totalRecords: 25,
      breakdownCount: 6,
      totalCostIDR: 123580000,
      totalDowntimeHours: 124,
      lastMaintenance: "2025-12-01",
      mtbfHours: 1460
    },
    tacitTipsCount: 7
  },
  {
    tag: "LV-6701",
    name: "SEPARATOR LEVEL CONTROL VALVE",
    unitId: "unit-lldpe",
    setNumber: 6,
    category: "Instrumentation & Control",
    criticality: "LOW CRITICAL",
    pidDrawing: "P&ID SET 6.png",
    datasheetDoc: "Equipment Datasheet - LV-6701.pdf",
    gaDrawing: "Equipment GA Drawing - LV-6701.pdf",
    interlockDoc: "Interlock Logic Diagram - LV-6701.pdf",
    plotPlanDoc: "Plot Plan LV-6701.pdf",
    interlockSequence: "SEQ-6701",
    sopDocs: ["CAP-SOP-LLD-6701"],
    fluidService: "Hexane & Polymer Powder Slurry Level Control",
    keyInterlocks: [
      "LSHH-6710: Separator FA-6710 Level > 85% (1oo2 voting opens LV-6701 fully)",
      "LSLL-6710: Separator FA-6710 Level < 15% (1oo2 voting triggers DCS Alarm)",
      "PSL-6702: Instrument Air Supply < 1.0 barg (Vents actuator fail-closed)",
      "Permissives: PI-6702 > 1.2 barg, DVC6200 healthy, HV-6701 bypass closed"
    ],
    operatingLimits: {
      dischargePressure: { normal: "2.1", tripHigh: "4.5", unit: "barg" },
      temperature: { normal: "42.0", tripHigh: "65.0", unit: "°C" },
      flowRate: { normal: "38.5", minContinuous: "10.0", unit: "m³/h" }
    },
    aimsData: {
      corrosionAllowanceMm: 2.5,
      measuredWallThicknessMm: 9.8,
      minimumAllowedWallMm: 7.0,
      corrosionRateMmPerYear: 0.05,
      remainingLifeYears: 20.0,
      lastInspectionDate: "2024-07-16",
      nextInspectionDue: "2027-07-16",
      inspectionType: "Fisher 667 Actuator Diaphragm & DVC6200 Diagnostics",
      status: "Satisfactory"
    },
    liveDCS: {
      dischargePressure: 2.1,
      temperature: 42.0,
      flow: 38.5,
      status: "NORMAL"
    },
    maintenanceStats: {
      totalRecords: 26,
      breakdownCount: 4,
      totalCostIDR: 72233000,
      totalDowntimeHours: 21,
      lastMaintenance: "2025-12-05",
      mtbfHours: 2190
    },
    tacitTipsCount: 7
  },
  {
    tag: "CT-7801",
    name: "COOLING TOWER CELL FAN",
    unitId: "unit-lldpe",
    setNumber: 7,
    category: "Rotating Machinery",
    criticality: "NON CRITICAL",
    pidDrawing: "P&ID_Set 7.png",
    datasheetDoc: "Equipment Datasheet - CT-7801.pdf",
    gaDrawing: "Equipment GA Drawing - CT-7801.pdf",
    interlockDoc: "Interlock Logic Diagram - CT-7801.pdf",
    plotPlanDoc: "Plot Plan - CT-7801.pdf",
    interlockSequence: "SEQ-7801",
    sopDocs: ["CAP-SOP-LLD-7801"],
    fluidService: "Atmospheric Air & Recirculating Industrial Cooling Water",
    keyInterlocks: [
      "VSHH-7802: Fan Vibration High-High > 9 mm/s (Trips Fan Motor)",
      "TSHH-7802: Gearbox Oil Temp > 90°C (Trips Motor & Annunciates Alarm)",
      "PSL-7807: Gearbox Oil Pressure < 0.8 barg (Trips & Requests Start Spare Cell CT-7802)",
      "MPR-7801: Fan Motor Overload Trip",
      "Start Permissive: Gearbox oil level OK, basin level normal LSL-7804"
    ],
    operatingLimits: {
      fanVibration: { normal: "3.2", tripHigh: "9.0", unit: "mm/s RMS" },
      vibration: { normal: "3.2", tripHigh: "9.0", unit: "mm/s RMS" },
      temperature: { normal: "58.0", tripHigh: "90.0", unit: "°C" },
      dischargePressure: { normal: "1.8", tripHigh: "3.5", unit: "barg" },
      flowRate: { normal: "3200", minContinuous: "1200", unit: "m³/h" }
    },
    aimsData: {
      corrosionAllowanceMm: 3.0,
      measuredWallThicknessMm: 8.5,
      minimumAllowedWallMm: 6.0,
      corrosionRateMmPerYear: 0.12,
      remainingLifeYears: 16.0,
      lastInspectionDate: "2024-08-22",
      nextInspectionDue: "2026-08-22",
      inspectionType: "Gearbox Vibration Spectrum & FRP Blade Pitch NDT",
      status: "Satisfactory"
    },
    liveDCS: {
      dischargePressure: 1.8,
      temperature: 61.2,
      flow: 3200,
      vibration: 3.4,
      status: "NORMAL"
    },
    maintenanceStats: {
      totalRecords: 27,
      breakdownCount: 3,
      totalCostIDR: 53757000,
      totalDowntimeHours: 46,
      lastMaintenance: "2025-11-01",
      mtbfHours: 2920
    },
    tacitTipsCount: 7
  },
  {
    tag: "FA-8901",
    name: "REFLUX ACCUMULATOR DRUM",
    unitId: "unit-lldpe",
    setNumber: 8,
    category: "Static Equipment",
    criticality: "HIGH CRITICAL",
    pidDrawing: "P&ID_Set 8.png",
    datasheetDoc: "Equipment Datasheet - FA-8901.pdf",
    gaDrawing: "Equipment GA Drawing - FA-8901.pdf",
    interlockDoc: "Interlock Logic Diagram - FA-8901.pdf",
    plotPlanDoc: "Plot Plan - FA-8901.pdf",
    interlockSequence: "SEQ-8901 (SIL 1)",
    sopDocs: ["CAP-SOP-LLD-8901"],
    fluidService: "Condensed Fractionated Hexane & Solvent Reflux",
    keyInterlocks: [
      "LSHH-8901: High-High Liquid Level > 85% (Trips Column Feed DA-8910)",
      "LSLL-8901: Low-Low Liquid Level < 15% (Trips Reflux Pumps GA-8920 A/B)",
      "PSHH-8902: High-High Pressure > 8 barg (Opens Flare Vent PCV-8905)",
      "HS-8901: Manual Emergency Stop Pushbutton",
      "HV-8904: Water Boot Draining manual valve inspection"
    ],
    operatingLimits: {
      dischargePressure: { normal: "4.5", tripHigh: "8.0", unit: "barg" },
      temperature: { normal: "65.0", tripHigh: "95.0", unit: "°C" },
      flowRate: { normal: "48.0", minContinuous: "15.0", unit: "m³/h" }
    },
    aimsData: {
      corrosionAllowanceMm: 4.0,
      measuredWallThicknessMm: 18.5,
      minimumAllowedWallMm: 14.0,
      corrosionRateMmPerYear: 0.07,
      remainingLifeYears: 25.0,
      lastInspectionDate: "2024-07-21",
      nextInspectionDue: "2027-07-21",
      inspectionType: "API 510 Ultrasonic Vessel Grid & Water Boot Inspection",
      status: "Satisfactory"
    },
    liveDCS: {
      dischargePressure: 4.6,
      temperature: 67.5,
      flow: 48.0,
      status: "NORMAL"
    },
    maintenanceStats: {
      totalRecords: 25,
      breakdownCount: 5,
      totalCostIDR: 41280000,
      totalDowntimeHours: 70,
      lastMaintenance: "2025-12-09",
      mtbfHours: 1752
    },
    tacitTipsCount: 7
  }
];

export const ONE_POINT_LESSONS: OnePointLesson[] = CALIBER_56_OPLS.map((o, idx) => ({
  id: o.id,
  oplNumber: o.oplNumber,
  title: o.title,
  unitId: "unit-lldpe",
  category: o.category as any,
  equipmentTag: o.tag,
  authorName: idx % 6 === 0 ? "Rudi Hermawan (Field Technician)" : "Chandra Asri LLDPE Area Specialist",
  authorRole: idx % 6 === 0 ? "Shift Field Operator (6 yrs)" : "Senior Process & Reliability Lead (18+ yrs)",
  experienceYears: 18 + (idx % 8),
  publishedDate: "2025-06-15",
  verificationStatus: idx === 1 || idx === 7 ? 'PENDING_REVIEW' : 'VERIFIED',
  verifiedBy: idx === 1 || idx === 7 ? 'Pending Senior Review' : "Wahyu Setiadi, ST (Lead Reliability Specialist)",
  verifierRole: "Lead Reliability & PSM Senior Engineer",
  verifiedAt: idx === 1 || idx === 7 ? undefined : "2025-06-20 14:30 WIB",
  verifierComment: idx === 1 || idx === 7 ? undefined : "Verified against P&ID setpoints and SIS cause-and-effect voting logic. Approved for standard field execution.",
  safetyScore: 5,
  mocRequired: false,
  goldenRule: o.rule,
  practicalTip: `Official plant reliability guideline: ${o.rule} Always cross-reference with active P&ID and interlock cause-and-effect table.`,
  visualCheckNote: "Check field gauge, transmitter calibration tag, and local car-seal status.",
  consequencesOfOmission: "Improper execution triggers automated SIS interlock trip and unplanned downtime.",
  upvotes: 45 + (idx % 25)
}));

export const INCIDENT_RCA_DATABASE: IncidentRCA[] = [
  {
    id: "rca-ga-1201a-01",
    incidentNumber: "WO-240012 (SEQ-1201)",
    title: "Hexane Feed Pump GA-1201A: Seal Flush Plan 11 DP Deficiency",
    unitId: "unit-lldpe",
    equipmentTag: "GA-1201A",
    date: "2024-07-24",
    severity: "Major Loss",
    symptoms: "Differential pressure across seal flush PDI-1201 dipped to 1.1 bar (limit > 1.5 bar). High bearing temperature alarm TSHH-1201 triggered at 82°C.",
    fiveWhys: [
      { whyNumber: 1, question: "Why did GA-1201A trigger high bearing temp?", answer: "Seal flush flow rate was insufficient to remove frictional heat from primary faces." },
      { whyNumber: 2, question: "Why was flush flow insufficient?", answer: "Orifice in the API Plan 11 discharge-to-seal flush tubing was partially fouled." },
      { whyNumber: 3, question: "Why was the orifice fouled?", answer: "Fine particulate carried over from upstream storage tank 12-T-01 after feed receipt." },
      { whyNumber: 4, question: "Why was this not caught before start-up?", answer: "Pre-start checklist omitted differential pressure verification across PDI-1201." },
      { whyNumber: 5, question: "What is the root cause?", answer: "Improper Execution: Start-up procedure lacked digital interlock verification of Plan 11 dP." }
    ],
    rootCauseCategory: "Improper Procedure Execution",
    rootCauseSummary: "Pre-start line-up missed PDI-1201 verification (> 1.5 bar), leading to restricted flush flow, seal overheating, and bearing temperature spike.",
    immediateActionTaken: "Auto-started standby pump GA-1201B; isolated GA-1201A, cleaned Plan 11 flush orifice, renewed mechanical seal soft goods.",
    preventativeActions: [
      "Codify OPL-GA-1201A-01 into mandatory Execution Guard startup checklist.",
      "Add automated permissive logic in DCS (PDI-1201 > 1.5 bar permissive to start).",
      "Inspect suction strainer on 12-T-01 discharge every 3 months."
    ],
    lessonsLearned: "Always confirm bubble-free flush flow and positive differential pressure before energizing motor.",
    pidRef: "PID_Set_01.png",
    sopUpdateRef: "CAP-SOP-LLD-1201 Rev 2.1"
  },
  {
    id: "rca-kc-4501-01",
    incidentNumber: "WO-240087 (SEQ-4501)",
    title: "Recycle Gas Compressor KC-4501: Seal Gas Low Flow & Buffer Instability",
    unitId: "unit-lldpe",
    equipmentTag: "KC-4501",
    date: "2024-06-18",
    severity: "Major Loss",
    symptoms: "Seal gas flow FT-4506 dropped below 10 Nm3/h, nitrogen buffer pressure collapsed, distance piece hydrocarbon detector alarmed.",
    fiveWhys: [
      { whyNumber: 1, question: "Why did distance piece alarm on hydrocarbons?", answer: "Recycle process gas bypassed internal labyrinth and entered distance piece." },
      { whyNumber: 2, question: "Why did process gas bypass labyrinth?", answer: "Nitrogen seal buffer pressure fell below compressor suction pressure." },
      { whyNumber: 3, question: "Why did nitrogen buffer pressure collapse?", answer: "The primary self-actuated N2 pressure regulator diaphragm ruptured." },
      { whyNumber: 4, question: "Why did the diaphragm rupture prematurely?", answer: "Moisture condensation in supply N2 line caused freeze-thaw fatigue during cold ambient night." },
      { whyNumber: 5, question: "What is the root cause?", answer: "Unscheduled moisture carryover and lack of dual-stage regulator blowdown in routine PM." }
    ],
    rootCauseCategory: "Equipment Mechanical Fatigue",
    rootCauseSummary: "N2 buffer regulator diaphragm failure caused loss of positive buffer differential pressure, allowing recycle gas to migrate into distance piece.",
    immediateActionTaken: "Operator activated emergency nitrogen bypass; overhauled regulator; installed heat tracing on N2 supply skid.",
    preventativeActions: [
      "Incorporate daily N2 filter regulator blowdown into shift routine.",
      "Codify OPL-KC-4501-03 (Seal Gas N2 Buffer Management).",
      "Upgrade regulator diaphragm material to reinforced fluoroelastomer."
    ],
    lessonsLearned: "Positive differential pressure across compressor seal buffer is the primary barrier preventing toxic gas emissions.",
    pidRef: "P&ID SET 4.png",
    sopUpdateRef: "CAP-SOP-LLD-4501 Rev 3.0"
  },
  {
    id: "rca-yd-2301-01",
    incidentNumber: "WO-240039 (SEQ-2301)",
    title: "Polymer Fluid Bed Dryer YD-2301: O2 Analyzer Drift & Inerting Failure",
    unitId: "unit-lldpe",
    equipmentTag: "YD-2301",
    date: "2024-08-05",
    severity: "Catastrophic",
    symptoms: "O2 concentration reading fluctuated erratically between 80 ppm and 250 ppm. Dryer startup permissive ASHH-2307 was refused by DCS.",
    fiveWhys: [
      { whyNumber: 1, question: "Why was dryer startup permissive refused?", answer: "DCS detected oxygen concentration exceeding the 100 ppm safety limit." },
      { whyNumber: 2, question: "Why was oxygen reading above 100 ppm?", answer: "Sample line was drawing air through an unseated sampling filter fitting." },
      { whyNumber: 3, question: "Why was the sample fitting unseated?", answer: "Vibration from adjacent powder transfer blower loosened compression ferrule." },
      { whyNumber: 4, question: "Why was this not verified during handover?", answer: "Shift handover relied on verbal confirmation rather than active instrument loop calibration." },
      { whyNumber: 5, question: "What is the root cause?", answer: "Tacit knowledge gap: Operators assumed analyzer cell was faulty without checking sampling integrity." }
    ],
    rootCauseCategory: "Tacit Knowledge Gap",
    rootCauseSummary: "Loose sample line compression fitting entrained ambient air, triggering false high-O2 trip ASHH-2307 and delaying unit startup by 6 hours.",
    immediateActionTaken: "Torqued Swagelok fitting, performed nitrogen leak check, recalibrated sensor on zero gas.",
    preventativeActions: [
      "Add mechanical support bracket to analyzer sample tubing.",
      "Implement OPL-YD-2301-01 (Nitrogen Inerting Before Steam On).",
      "Establish 2-point span gas verification procedure in EDMS."
    ],
    lessonsLearned: "Always inspect physical sampling lines before assuming an electronic analyzer drift has occurred.",
    pidRef: "P&ID_Set_02.png",
    sopUpdateRef: "CAP-SOP-LLD-2301 Rev 1.8"
  },
  {
    id: "rca-dc-3401a-01",
    incidentNumber: "WO-240056 (SEQ-3401)",
    title: "Catalyst Reduction Reactor DC-3401A: Bed Multipoint Thermocouple Failure",
    unitId: "unit-lldpe",
    equipmentTag: "DC-3401A",
    date: "2024-07-08",
    severity: "Major Loss",
    symptoms: "Multipoint thermocouple point 3 read open-circuit (NAN). Reactor high-temp 2oo3 interlock TSHH-3401 went into degraded 1oo2 mode.",
    fiveWhys: [
      { whyNumber: 1, question: "Why did TSHH-3401 trip to degraded voting?", answer: "Channel 3 thermocouple signal wire suffered open circuit." },
      { whyNumber: 2, question: "Why was there an open circuit?", answer: "Thermal cycling during hydrogen reduction exotherm caused fatigue fracture at junction." },
      { whyNumber: 3, question: "Why was thermal cycling excessive?", answer: "H2 flow was ramped in 25 kg/h increments rather than smooth continuous micro-metering." },
      { whyNumber: 4, question: "Why was ramping not smooth?", answer: "New operator unfamiliar with bed thermal inertia attempted manual step adjustments." },
      { whyNumber: 5, question: "What is the root cause?", answer: "Missing Tacit Knowledge: Veteran exotherm control technique was never codified into SOP." }
    ],
    rootCauseCategory: "Tacit Knowledge Gap",
    rootCauseSummary: "Rapid H2 feed ramping induced thermal shock and cracked thermocouple probe point 3, degrading SIS SIL-2 protection logic.",
    immediateActionTaken: "Switched to hot standby; replaced probe point 3 assembly; updated DCS ramping ramp-rate limiter.",
    preventativeActions: [
      "Codify OPL-DC-3401A-04 (Hydrogen Reduction Safety & Exotherm Control).",
      "Lock automatic H2 ramp rate limiter to maximum 5 kg/h per 10 minutes in DCS.",
      "Require dual-engineer sign-off during reduction phase."
    ],
    lessonsLearned: "Bed thermal mass requires slow, continuous reaction propagation to protect internal sensing elements.",
    pidRef: "P&ID Set 3.png",
    sopUpdateRef: "CAP-SOP-LLD-3401 Rev 4.0"
  },
  {
    id: "rca-ea-5601-01",
    incidentNumber: "WO-240111 (IL-EA-5601)",
    title: "Solvent Heater EA-5601: Channel Flange Hexane Weep & Thermal Shock",
    unitId: "unit-lldpe",
    equipmentTag: "EA-5601",
    date: "2024-09-02",
    severity: "Major Loss",
    symptoms: "Hexane solvent vapor detected at channel head flange. Tube differential pressure PDT-5605 rose to 0.72 bar (fouling alarm).",
    fiveWhys: [
      { whyNumber: 1, question: "Why was hexane leaking at channel flange?", answer: "Spiral wound flange gasket suffered localized relaxation." },
      { whyNumber: 2, question: "Why did the gasket relax?", answer: "Sudden admission of full MP steam caused rapid differential thermal expansion." },
      { whyNumber: 3, question: "Why was full steam admitted rapidly?", answer: "Steam bypass valve was opened 100% in 30 seconds to expedite solvent heat-up." },
      { whyNumber: 4, question: "Why was warmup rushed?", answer: "Operator felt pressure to recover solvent rate after upstream filter change." },
      { whyNumber: 5, question: "What is the root cause?", answer: "Improper Execution: Violation of the mandatory 15-minute gradual warmup protocol." }
    ],
    rootCauseCategory: "Improper Procedure Execution",
    rootCauseSummary: "Rapid admission of MP steam without 15-minute warmup caused severe thermal shock, bowing the tube sheet and relaxing the channel gasket.",
    immediateActionTaken: "Isolated steam header; depressurized solvent side; replaced spiral wound SS316 gasket; hydrotested to 24 barg.",
    preventativeActions: [
      "Install motorized slow-opening bypass valve with automated 15-minute ramp sequence.",
      "Codify OPL-EA-5601-04 (Thermal Shock Avoidance on Start-Up).",
      "Torque flange bolts using ultrasonic bolt tension verification."
    ],
    lessonsLearned: "Thermal expansion rates between carbon steel shell and stainless steel tube bundle must be matched via gradual heating.",
    pidRef: "P&ID SET 5.png",
    sopUpdateRef: "CAP-SOP-LLD-5601 Rev 2.0"
  }
];

export const SOP_ARCHIVE: SOPDocument[] = [
  {
    id: "sop-lld-1201",
    docNumber: "CAP-SOP-LLD-1201",
    title: "Hexane Feed Pump GA-1201A/B Startup, Priming & Minimum Flow Operation",
    unitId: "unit-lldpe",
    revision: "Rev 2.1",
    status: "APPROVED & ACTIVE",
    effectiveDate: "2025-01-15",
    reviewDate: "2027-01-15",
    approvedBy: "Wahyu Setiadi (Operations Lead) & Dian Prasetyo (Plant GM)",
    targetEquipment: ["GA-1201A", "GA-1201B", "FV-1201", "XV-1201"],
    executionRisk: "HIGH",
    mandatoryPPE: ["Fire Retardant Nomex Suit", "Safety Helmet with Face Shield", "Chemical Nitrile Gloves", "Multi-Gas Detector (LEL/VOC)", "Hearing Protection"],
    permitsRequired: ["PTW Cold Work #PTW-1201", "Hot Work Standby (if electrical breaker un-racked)"],
    summary: "Complete operational instructions for safely lining up, venting, and starting Hexane Feed Pump GA-1201A. Designed to eliminate vapor locking, cavitation, and seal flush API Plan 11 failures.",
    steps: [
      {
        stepNumber: 1,
        phase: "Pre-Execution Checks",
        action: "Inspect bearing housing oil level. Bullseye sight glass must show 50% clear synthetic ISO VG 46 oil. Verify no water milky emulsion.",
        cautionNote: "Overfilling causes oil foaming and bearing overheating (> 85°C).",
        isMandatorySignoff: true
      },
      {
        stepNumber: 2,
        phase: "Pre-Execution Checks",
        action: "Confirm suction valve XV-1201 is 100% full open with limit switch ZSO-1201 feedback green on DCS console.",
        interlockRequirement: "ZSO-1201 = TRUE (Permissive)",
        isMandatorySignoff: true
      },
      {
        stepNumber: 3,
        phase: "Execution & Line-up",
        action: "Crack open casing high-point bleeder valve into closed slop drain. Vent continuously for minimum 180 seconds until solid liquid stream is verified.",
        cautionNote: "OPL-GA-1201A-06: Vapor pockets trapped in suction eye destroy mechanical seal faces within 10 seconds.",
        isMandatorySignoff: true
      },
      {
        stepNumber: 4,
        phase: "Execution & Line-up",
        action: "Verify API Plan 11 + Plan 62 seal flush differential pressure PDI-1201 is >= 1.5 bar above pump suction pressure.",
        interlockRequirement: "PDI-1201 >= 1.5 bar (Permissive)",
        isMandatorySignoff: true
      },
      {
        stepNumber: 5,
        phase: "Execution & Line-up",
        action: "Verify minimum flow bypass control valve FV-1201 is armed and ready to open if flow drops below 9 m3/h.",
        interlockRequirement: "FSLL-1201 armed",
        isMandatorySignoff: false
      },
      {
        stepNumber: 6,
        phase: "Verification & Tuning",
        action: "Start 30 kW drive motor EQ1000012011. Observe starting current: must settle below 58 Amperes within 3.5 seconds.",
        isMandatorySignoff: true
      },
      {
        stepNumber: 7,
        phase: "Handover & Normalization",
        action: "Confirm discharge pressure PT-1201 reads 18.5 - 20.0 barg and bearing vibration VT-1201 is <= 1.8 mm/s RMS.",
        isMandatorySignoff: true
      }
    ],
    tacitAdditions: [
      "In hot weather (> 34°C), hexane vapor pressure increases. Always purge vent line 1 minute longer.",
      "Check Plan 11 orifice for whistling sound indicating vapor cavitation."
    ]
  },
  {
    id: "sop-lld-2301",
    docNumber: "CAP-SOP-LLD-2301",
    title: "Polymer Fluid Bed Dryer YD-2301 Inerting, Steam Pre-Heat & Fluidization Sequence",
    unitId: "unit-lldpe",
    revision: "Rev 2.0",
    status: "APPROVED & ACTIVE",
    effectiveDate: "2025-02-10",
    reviewDate: "2027-02-10",
    approvedBy: "Dian Prasetyo (Plant GM) & Joko Purnomo (Machinery Specialist)",
    targetEquipment: ["YD-2301", "Kadant Rotary Joint", "FV-2305", "SCM440 Drive"],
    executionRisk: "HIGH",
    mandatoryPPE: ["Nomex Suit", "Particulate Dust Mask (P3/N95)", "Safety Glasses", "Anti-Static Safety Shoes"],
    permitsRequired: ["PTW Hot Work Entry #PTW-2301", "Confined Space Isolation Certificate"],
    summary: "Standard operating sequence for inerting, steam heating, and starting fluidized bed dryer YD-2301. Prevents static discharge dust deflagration and thermal shock on trunnion bearings.",
    steps: [
      {
        stepNumber: 1,
        phase: "Pre-Execution Checks",
        action: "Inspect trunnion support bearings and SCM440 drive chain lubrication reservoir. Confirm ISO VG 220 gear oil level in sight glass.",
        cautionNote: "Dry chain operation causes jerky bed rotation and spalling on drive sprocket teeth.",
        isMandatorySignoff: true
      },
      {
        stepNumber: 2,
        phase: "Pre-Execution Checks",
        action: "Initiate N2 purge cycle and verify oxygen analyzer ASHH-2307 reads < 100 ppm O2 before introducing polymer feed.",
        interlockRequirement: "ASHH-2307 < 100 ppm (Permissive T1)",
        isMandatorySignoff: true
      },
      {
        stepNumber: 3,
        phase: "Execution & Line-up",
        action: "Inspect Kadant rotary steam joint for condensate weep. Confirm seal face nitrogen barrier differential pressure is >= 0.5 bar.",
        interlockRequirement: "Kadant Rotary Seal DP Healthy",
        isMandatorySignoff: true
      },
      {
        stepNumber: 4,
        phase: "Execution & Line-up",
        action: "Start fluidizing gas recirculation blower; confirm minimum bed gas flow rate FT-2301 exceeds 450 Nm3/h.",
        interlockRequirement: "FT-2301 >= 450 Nm3/h (Fluidization Permissive)",
        isMandatorySignoff: true
      },
      {
        stepNumber: 5,
        phase: "Verification & Tuning",
        action: "Gradually admit LP steam to internal heating coils; confirm bed temperature TSHH-2301 stabilizes at 78°C ± 2°C.",
        cautionNote: "Never exceed 95°C bed trip limit to avoid polymer powder melting and screen agglomeration.",
        isMandatorySignoff: true
      }
    ],
    tacitAdditions: [
      "Check trunnion grease collar visually every 2 hours during high-throughput polymer campaigns.",
      "If dryer pressure PDT-2304 rises above 0.25 barg, back-pulse exhaust cyclone filters immediately."
    ]
  },
  {
    id: "sop-lld-3401",
    docNumber: "CAP-SOP-LLD-3401",
    title: "Catalyst Reduction Reactor DC-3401A Inerting, Micro-Metered H2 Ramp & Exotherm Control",
    unitId: "unit-lldpe",
    revision: "Rev 4.0",
    status: "APPROVED & ACTIVE",
    effectiveDate: "2025-01-28",
    reviewDate: "2027-01-28",
    approvedBy: "Wahyu Setiadi (Operations Lead) & PSM Safety Committee",
    targetEquipment: ["DC-3401A", "EA-3401", "PV-3404", "AI-3401"],
    executionRisk: "CRITICAL",
    mandatoryPPE: ["Nomex Arc Flash Suit", "SCBA Standby On-Site", "Multi-Gas Detector (H2/LEL)", "Antistatic Boots"],
    permitsRequired: ["Critical Catalyst Activity Permit #CAP-3401", "Dual Engineer Sign-off"],
    summary: "Ultra-high-criticality operational procedure for catalyst reduction. Mandates O2-freeing verification, controlled H2 micro-metering, and multipoint thermocouple bed thermal management.",
    steps: [
      {
        stepNumber: 1,
        phase: "Pre-Execution Checks",
        action: "Circulate ultra-pure N2 through reactor bed until analyzer AI-3401 confirms oxygen content is strictly below 10 ppm.",
        interlockRequirement: "AI-3401 < 10 ppm (Interlock T3 Permissive)",
        isMandatorySignoff: true
      },
      {
        stepNumber: 2,
        phase: "Pre-Execution Checks",
        action: "Energize electric circulation heater EA-3401. Verify element sheath thermocouples TIC-17343 remain below 280°C limit.",
        interlockRequirement: "TIC-17343 < 280°C",
        isMandatorySignoff: true
      },
      {
        stepNumber: 3,
        phase: "Execution & Line-up",
        action: "Introduce hydrogen reduction feed at controlled micro-metered rate of maximum 5 kg/h per 10 minutes (OPL-DC-3401A-04 compliance).",
        cautionNote: "Rapid H2 introduction creates localized exotherm hot spots that fatigue multipoint thermocouples and crack TE-3401 probes.",
        isMandatorySignoff: true
      },
      {
        stepNumber: 4,
        phase: "Execution & Line-up",
        action: "Track 2oo3 voting multipoint bed temperature TSHH-3401. Ensure reaction front propagates smoothly at 185°C without exceeding 230°C trip boundary.",
        interlockRequirement: "TSHH-3401 (2oo3) < 230°C",
        isMandatorySignoff: true
      },
      {
        stepNumber: 5,
        phase: "Handover & Normalization",
        action: "Hold reduction plateau at 3.2 barg for 120 minutes. Confirm effluent moisture dewpoint analyzer reads below -40°C before catalyst transfer.",
        isMandatorySignoff: true
      }
    ],
    tacitAdditions: [
      "Never override automated H2 ramp limiter in DCS; veteran manual adjustment caused 2024 thermocouple fracture.",
      "Monitor bed radial delta-T: if center vs wall difference exceeds 15°C, trim circulation blower speed."
    ]
  },
  {
    id: "sop-lld-4501",
    docNumber: "CAP-SOP-LLD-4501",
    title: "Recycle Gas Compressor KC-4501 Startup, Lube Oil Priming & Anti-Surge Control",
    unitId: "unit-lldpe",
    revision: "Rev 3.0",
    status: "APPROVED & ACTIVE",
    effectiveDate: "2025-03-20",
    reviewDate: "2027-03-20",
    approvedBy: "Joko Purnomo (Machinery Specialist) & Wahyu Setiadi",
    targetEquipment: ["KC-4501", "FV-4502", "FA-4510", "EA-4502"],
    executionRisk: "CRITICAL",
    mandatoryPPE: ["Sound Attenuating Headset (SNR 35dB)", "Double Eye Protection", "Nomex Suit", "Antistatic Boots"],
    permitsRequired: ["Critical Machinery Start Authorization #CMS-4501"],
    summary: "Operating protocol for the two-stage recycle gas compressor. Enforces lube oil pre-priming, nitrogen seal gas buffer management, and anti-surge valve verification.",
    steps: [
      {
        stepNumber: 1,
        phase: "Pre-Execution Checks",
        action: "Start auxiliary lube oil pump P1. Confirm header pressure stabilizes at >= 2.5 barg on PSLL-4504.",
        interlockRequirement: "PSLL-4504 >= 2.5 barg",
        isMandatorySignoff: true
      },
      {
        stepNumber: 2,
        phase: "Pre-Execution Checks",
        action: "Confirm seal gas N2 buffer flow FT-4506 is >= 15 Nm3/h with positive differential pressure against suction.",
        interlockRequirement: "SEQ-4501 Permissive 2",
        isMandatorySignoff: true
      },
      {
        stepNumber: 3,
        phase: "Execution & Line-up",
        action: "Drain condensate from suction KO drum FA-4510. Level transmitter LT-4510 must read < 10%.",
        cautionNote: "Liquid carryover into cylinder causes immediate valve plate fracture.",
        isMandatorySignoff: true
      },
      {
        stepNumber: 4,
        phase: "Execution & Line-up",
        action: "Verify anti-surge recycle valve FV-4502 is in 100% full open recirculation position before starting motor.",
        isMandatorySignoff: true
      },
      {
        stepNumber: 5,
        phase: "Verification & Tuning",
        action: "Accelerate drive motor; verify crosshead vibration VSHH-4505 stays below 28 µm pk-pk trip threshold (baseline 14 µm).",
        isMandatorySignoff: true
      }
    ],
    tacitAdditions: [
      "Always feel the suction and discharge valve covers by hand during startup; a cold suction valve with hot discharge is normal.",
      "Check distance piece packing vent for hydrocarbon bubbles in visual oil bubbler pot."
    ]
  },
  {
    id: "sop-lld-5601",
    docNumber: "CAP-SOP-LLD-5601",
    title: "Solvent Heater EA-5601 Gradual Steam Admission, Thermal Expansion & Fouling Prevention",
    unitId: "unit-lldpe",
    revision: "Rev 2.0",
    status: "APPROVED & ACTIVE",
    effectiveDate: "2025-02-18",
    reviewDate: "2027-02-18",
    approvedBy: "Wahyu Setiadi (Operations Lead) & Mechanical Integrity Lead",
    targetEquipment: ["EA-5601", "TV-5602", "PDT-5605", "PSV-5607"],
    executionRisk: "MEDIUM",
    mandatoryPPE: ["Nomex Suit", "Thermal Insulated Gloves", "Safety Goggles", "Earplugs"],
    permitsRequired: ["PTW Cold Work #PTW-5601"],
    summary: "Operating procedure for shell-and-tube solvent heater EA-5601. Mandates gradual 15-minute steam admission ramp to prevent tube sheet thermal shock, channel flange relaxation, and hexane leakage.",
    steps: [
      {
        stepNumber: 1,
        phase: "Pre-Execution Checks",
        action: "Establish steady hexane solvent circulation through tube side at minimum 120 m3/h before opening steam side.",
        cautionNote: "Admitting steam to static solvent creates localized boiling, vapor slugging, and severe water hammer.",
        isMandatorySignoff: true
      },
      {
        stepNumber: 2,
        phase: "Pre-Execution Checks",
        action: "Crack open condensate drain bypass valves upstream of steam traps. Purge cold condensate until dry MP steam appears.",
        interlockRequirement: "TI-5604 Steam Trap Health OK",
        isMandatorySignoff: true
      },
      {
        stepNumber: 3,
        phase: "Execution & Line-up",
        action: "Execute mandatory 15-minute gradual warmup ramp on steam bypass valve (maximum heating rate <= 5°C/min per OPL-EA-5601-04).",
        cautionNote: "WO-240111 Root Cause: Opening steam bypass in under 30 seconds relaxed channel flange spiral-wound gasket, causing hexane weep.",
        isMandatorySignoff: true
      },
      {
        stepNumber: 4,
        phase: "Execution & Line-up",
        action: "Verify tube differential pressure transmitter PDT-5605 reads <= 0.35 bar (clean baseline; alarm at 0.70 bar).",
        interlockRequirement: "PDT-5605 < 0.70 bar (No Severe Fouling)",
        isMandatorySignoff: true
      },
      {
        stepNumber: 5,
        phase: "Verification & Tuning",
        action: "Transfer steam temperature control valve TV-5602 to DCS cascade auto mode; verify steady solvent discharge temperature at 145°C.",
        isMandatorySignoff: true
      }
    ],
    tacitAdditions: [
      "Always inspect channel head flange perimeter with portable PID VOC sniffer after full steam temperature is reached.",
      "If PDT-5605 exceeds 0.50 bar, schedule ultrasonic tube cleaning during next mini-shutdown."
    ]
  },
  {
    id: "sop-lld-6701",
    docNumber: "CAP-SOP-LLD-6701",
    title: "Separator Level Control Valve LV-6701 Online Stroke Verification, Air Supply & Interlock Test",
    unitId: "unit-lldpe",
    revision: "Rev 2.2",
    status: "APPROVED & ACTIVE",
    effectiveDate: "2025-01-30",
    reviewDate: "2027-01-30",
    approvedBy: "Dian Prasetyo (Plant GM) & Lead Instrumentation Engineer",
    targetEquipment: ["LV-6701", "FA-6710", "PI-6702", "DVC6200"],
    executionRisk: "MEDIUM",
    mandatoryPPE: ["Nomex Suit", "Safety Glasses", "Chemical Nitrile Gloves", "Hearing Protection"],
    permitsRequired: ["Instrumentation Override Clearance #IOC-6701"],
    summary: "Verification and line-up protocol for Fisher pneumatic control valve LV-6701. Validates instrument air pressure, DVC6200 positioner diagnostics, and safety trip response.",
    steps: [
      {
        stepNumber: 1,
        phase: "Pre-Execution Checks",
        action: "Verify instrument air supply pressure gauge PI-6702 reads >= 1.2 barg. Check for audible air leaks around actuator diaphragm.",
        interlockRequirement: "PI-6702 >= 1.2 barg",
        isMandatorySignoff: true
      },
      {
        stepNumber: 2,
        phase: "Pre-Execution Checks",
        action: "Interrogate Fisher Fieldvue DVC6200 digital valve controller. Verify travel sensor deviation is < 1.0% between DCS output and stem travel.",
        interlockRequirement: "DVC6200 Status Healthy",
        isMandatorySignoff: true
      },
      {
        stepNumber: 3,
        phase: "Execution & Line-up",
        action: "Line up manual upstream and downstream isolation block valves; verify manual bypass equalizer HV-6701 is 100% closed and locked.",
        isMandatorySignoff: true
      },
      {
        stepNumber: 4,
        phase: "Execution & Line-up",
        action: "Perform DCS trip response simulation: confirm valve drives to 100% full open position upon high separator level trip LSHH-6710 in < 2.5 seconds.",
        interlockRequirement: "LSHH-6710 Trip Open Test Passed",
        isMandatorySignoff: true
      },
      {
        stepNumber: 5,
        phase: "Verification & Tuning",
        action: "Inspect PTFE Chevron packing gland live-loading Belleville spring compression for zero solvent weep.",
        isMandatorySignoff: true
      }
    ],
    tacitAdditions: [
      "In humid seasons, drain actuator air filter regulator bowl every shift to prevent moisture freeze in positioner spool valve.",
      "Check stem travel indicator scale alignment after any valve body bolting torque check."
    ]
  },
  {
    id: "sop-lld-7801",
    docNumber: "CAP-SOP-LLD-7801",
    title: "Cooling Tower Cell Fan CT-7801 Pre-Start Clearance, Gearbox Lube & Vibration Protocol",
    unitId: "unit-lldpe",
    revision: "Rev 2.0",
    status: "APPROVED & ACTIVE",
    effectiveDate: "2025-03-05",
    reviewDate: "2027-03-05",
    approvedBy: "Joko Purnomo (Machinery Specialist) & Wahyu Setiadi",
    targetEquipment: ["CT-7801", "VSHH-7802", "TSHH-7802", "CT-7802"],
    executionRisk: "MEDIUM",
    mandatoryPPE: ["Hard Hat with Chin Strap", "Safety Harness (100% Tie-Off)", "Ear Protection (SNR 30dB)", "Slip-Resistant Boots"],
    permitsRequired: ["Working at Height Permit #WAH-7801", "Electrical Lockout / Tagout (LOTO)"],
    summary: "Safety-critical field inspection and startup procedure for cooling tower induced draft cell fan CT-7801. Ensures blade tip clearance, gearbox oil condition, and vibration trip verification.",
    steps: [
      {
        stepNumber: 1,
        phase: "Pre-Execution Checks",
        action: "Verify cooling tower cold water basin level LSL-7804 is normal. Inspect fan shroud drift eliminators for debris.",
        interlockRequirement: "LSL-7804 Normal",
        isMandatorySignoff: true
      },
      {
        stepNumber: 2,
        phase: "Pre-Execution Checks",
        action: "Inspect right-angle reduction gearbox oil level; ensure 60% level with synthetic ISO VG 320 oil. Verify oil pressure switch PSL-7807 healthy.",
        interlockRequirement: "PSL-7807 > 0.8 barg",
        isMandatorySignoff: true
      },
      {
        stepNumber: 3,
        phase: "Execution & Line-up",
        action: "Manually rotate FRP fan blade by hand through 360 degrees. Verify minimum 25 mm uniform radial tip clearance from fan cylinder stack.",
        cautionNote: "Blade tip rubbing against FRP shroud creates static sparks and delaminates blade leading edges.",
        isMandatorySignoff: true
      },
      {
        stepNumber: 4,
        phase: "Execution & Line-up",
        action: "Remove electrical LOTO; start 75 kW fan motor. Verify rotation direction produces upward induced draft exhaust.",
        isMandatorySignoff: true
      },
      {
        stepNumber: 5,
        phase: "Verification & Tuning",
        action: "Confirm overall RMS vibration on VSHH-7802 settles <= 3.2 mm/s RMS (safety trip boundary is 9.0 mm/s).",
        interlockRequirement: "VSHH-7802 < 9.0 mm/s",
        isMandatorySignoff: true
      }
    ],
    tacitAdditions: [
      "Always inspect drive shaft Thomas flexible coupling laminations for fatigue cracks after major wind storms.",
      "Check gearbox temperature TSHH-7802 after 2 hours continuous run; must not exceed 65°C."
    ]
  },
  {
    id: "sop-lld-8901",
    docNumber: "CAP-SOP-LLD-8901",
    title: "Reflux Accumulator Drum FA-8901 Boot Draining, Blanket N2 & Level Interlock Lineup",
    unitId: "unit-lldpe",
    revision: "Rev 2.1",
    status: "APPROVED & ACTIVE",
    effectiveDate: "2025-02-12",
    reviewDate: "2027-02-12",
    approvedBy: "Wahyu Setiadi (Operations Lead) & Dian Prasetyo (Plant GM)",
    targetEquipment: ["FA-8901", "GA-8920A/B", "LT-8901", "PCV-8905"],
    executionRisk: "HIGH",
    mandatoryPPE: ["Nomex Suit", "Safety Glasses with Side Shields", "Nitrile Gloves", "LEL/O2 Portable Gas Detector"],
    permitsRequired: ["PTW Cold Work #PTW-8901"],
    summary: "Operational startup and interface water draining procedure for Reflux Accumulator Drum FA-8901. Prevents water carryover into fractionation column and eliminates pump cavitational trips.",
    steps: [
      {
        stepNumber: 1,
        phase: "Pre-Execution Checks",
        action: "Verify nitrogen blanket pressure control valve maintains vessel vapor space at positive 4.5 barg inert pad.",
        interlockRequirement: "FA-8901 N2 Blanket Active",
        isMandatorySignoff: true
      },
      {
        stepNumber: 2,
        phase: "Pre-Execution Checks",
        action: "Crack open manual water boot drain valve HV-8904 into closed oily water collection header. Drain free water until clear solvent appears.",
        cautionNote: "Water carryover into downstream column reboiler triggers violent steam flashing and tray lifting.",
        isMandatorySignoff: true
      },
      {
        stepNumber: 3,
        phase: "Execution & Line-up",
        action: "Cross-check redundant magnetic level transmitters LT-8901A and LT-8901B on DCS. Verify reading deviation is < 2%.",
        interlockRequirement: "LT-8901A/B Deviation < 2%",
        isMandatorySignoff: true
      },
      {
        stepNumber: 4,
        phase: "Execution & Line-up",
        action: "Confirm liquid level is >= 20% to clear low-low level trip interlock LSLL-8901 before unlatching reflux pump GA-8920A/B start permissive.",
        interlockRequirement: "LSLL-8901 Permissive Cleared (> 20%)",
        isMandatorySignoff: true
      },
      {
        stepNumber: 5,
        phase: "Verification & Tuning",
        action: "Establish steady reflux flow rate of 48.0 m3/h back to column DA-8910; verify discharge pressure stabilizes at 4.5 barg.",
        isMandatorySignoff: true
      }
    ],
    tacitAdditions: [
      "Check gauge glass illuminate lamp every evening; solvent interface is difficult to see under dim ambient lighting.",
      "If flare vent valve PCV-8905 shows continuous flow, inspect seat for polymer powder deposit."
    ]
  }
];
