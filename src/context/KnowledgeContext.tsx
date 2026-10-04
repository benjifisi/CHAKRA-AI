import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  EQUIPMENT_DATABASE, 
  EquipmentTag, 
  SOP_ARCHIVE, 
  SOPDocument, 
  INCIDENT_RCA_DATABASE, 
  IncidentRCA, 
  ONE_POINT_LESSONS, 
  OnePointLesson, 
  PLANT_UNITS, 
  PlantUnit 
} from '../data/plantData';
import { 
  CALIBER_MAINTENANCE_RECORDS, 
  CaliberMaintenanceRecord 
} from '../data/caliberRealData';
import { PersonaLens, PersonaConfig, PERSONA_CONFIGS } from '../data/personaData';

export interface MaintenanceRecord {
  id: string;
  equipmentTag: string;
  notificationNo: string;
  orderNo?: string;
  failureDate: string;
  failureMode: string;
  symptom: string;
  rootCause: string;
  correctiveAction: string;
  downtimeHours: number;
  costEstimate?: string;
  severity: 'Catastrophic' | 'Major Loss' | 'Moderate' | 'Near Miss';
}

export interface MachineFolderSet {
  setNumber: number;
  folderName: string;
  equipmentTag: string;
  equipmentName: string;
  unit: string;
  documentsCount: number;
  files: {
    name: string;
    size: number;
    type: string;
    parsedStatus: 'PENDING' | 'INDEXED' | 'PARSING';
    extractedSummary?: string;
  }[];
}

export interface DocumentViewerState {
  isOpen: boolean;
  docId?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  title?: string | null;
  fileType?: string | null;
}

interface KnowledgeContextType {
  selectedUnit: PlantUnit;
  setSelectedUnit: (unit: PlantUnit) => void;
  equipmentList: EquipmentTag[];
  sopList: SOPDocument[];
  incidentList: IncidentRCA[];
  maintenanceRecords: MaintenanceRecord[];
  rawCaliberMaintenance: CaliberMaintenanceRecord[];
  oplList: OnePointLesson[];
  machineFolderSets: MachineFolderSet[];
  
  // Cross-Functional Persona Lens (Case 1 Improvement)
  activePersona: PersonaLens;
  setActivePersona: (p: PersonaLens) => void;
  activePersonaConfig: PersonaConfig;

  // Peer-Verification Workflow for OPLs
  verifyOPL: (id: string, verifierName: string, verifierRole: string, comment: string, safetyScore?: number) => void;
  rejectOPL: (id: string, reason: string) => void;
  addOPL: (newLesson: OnePointLesson) => void;

  // Document Viewer
  viewerState: DocumentViewerState;
  openDocumentViewer: (doc: Partial<DocumentViewerState>) => void;
  closeDocumentViewer: () => void;

  // Importers
  importMaintenanceExcel: (records: MaintenanceRecord[], rawFileName?: string) => void;
  importMachineDocument: (machineSetIdx: number, fileName: string, fileContent: string, fileType: string) => Promise<any>;
  importPptExplanation: (title: string, slidesContent: string) => Promise<any>;
  resetToDefaultDataset: () => void;
  exportKnowledgeDataset: () => void;
}

const LOCAL_STORAGE_KEY = 'CAP_PETROHUB_DATA_V2';

const defaultMachineFolderSets: MachineFolderSet[] = [
  {
    setNumber: 1,
    folderName: 'Set_01_GA-1201A_HEXANE_FEED_PUMP',
    equipmentTag: 'GA-1201A',
    equipmentName: 'HEXANE FEED PUMP',
    unit: 'LLDPE Unit (Area 1200 Feed Preparation)',
    documentsCount: 12,
    files: [
      { name: 'Equipment Datasheet - GA-1201A.pdf', size: 1240000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'API 610 Between-Bearing Centrifugal Pump, 30kW, discharge 18.5 barg.' },
      { name: 'Equipment GA Drawing - GA-1201A.pdf', size: 1850000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'General Arrangement Drawing, foundation bolt layout, nozzle specs.' },
      { name: 'Interlock Logic Diagram - GA-1201A.pdf', size: 980000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Cause & Effect logic SEQ-1201: PSLL-1201, TSHH-1201, VSHH-1201, FSLL-1201.' },
      { name: 'PID_Set_01.png', size: 860781, type: 'png', parsedStatus: 'INDEXED', extractedSummary: 'P&ID Set 1: Feed transfer from 12-T-01, Plan 11+62, min-flow bypass FV-1201.' },
      { name: 'Plot Plan - GA-1201A.pdf', size: 760000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Field elevation +0.00, maintenance laydown area.' },
      { name: 'OPL-GA-1201A-01 - Mechanical_Seal_Flush_API_Plan_11_Verifi.pdf', size: 450000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Plan 11 dP >= 1.5 bar verification.' },
      { name: 'OPL-GA-1201A-02 - Bearing_Oil_Bath_Level_Greasing.pdf', size: 420000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Oil bath bullseye sight glass level at 50%.' },
      { name: 'OPL-GA-1201A-03 - Pump_Motor_Alignment_Check_Laser.pdf', size: 430000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Dual laser shaft alignment under 0.05 mm/100mm.' },
      { name: 'OPL-GA-1201A-04 - Minimum_Flow_Line_Operation_Deadhead_Pro.pdf', size: 440000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Deadhead protection via FV-1201 minimum flow line.' },
      { name: 'OPL-GA-1201A-05 - Cold_Alignment_vs_Hot_Check_for_Hexane_S.pdf', size: 410000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Thermal growth recheck within 30 min of reaching 35°C.' },
      { name: 'OPL-GA-1201A-06 - Start_Up_Priming_Procedure_GA_1201A.pdf', size: 460000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: '180s continuous casing bleeder vent to closed drain.' },
      { name: 'OPL-GA-1201A-07 - Vibration_Trend_Monitoring_Alarm_Respons.pdf', size: 420000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'VSHH-1201 4.5 mm/s trip threshold response.' }
    ],
  },
  {
    setNumber: 2,
    folderName: 'Set_02_YD-2301_POLYMER_FLUID_BED_DRYER',
    equipmentTag: 'YD-2301',
    equipmentName: 'POLYMER FLUID BED DRYER',
    unit: 'LLDPE Unit (Area 2300 Polymer Drying)',
    documentsCount: 12,
    files: [
      { name: 'Equipment Datasheet - YD-2301.pdf', size: 1420000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Polymer fluid bed dryer, N2 purge, Kadant rotary joint, SCM440 chain.' },
      { name: 'Equipment GA Drawing - YD-2301.pdf', size: 1910000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'GA drawing, trunnion bearing rollers, powder inlet/outlet 4".' },
      { name: 'Interlock Logic Diagram - YD-2301.pdf', size: 1050000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'SEQ-2301 / SEQ-5500: PSL-2306, ASHH-2307, TSHH-2301.' },
      { name: 'P&ID_Set_02.png', size: 878953, type: 'png', parsedStatus: 'INDEXED', extractedSummary: 'P&ID Set 2: Dryer with N2 purge, centrifuge GF-2210, fine dust collector.' },
      { name: 'Plot Plan - YD-2301.pdf', size: 820000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Polymer drying building elevation +6.00.' },
      { name: 'OPL-YD-2301-01 - Nitrogen_Inerting_Before_Steam_On.pdf', size: 440000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'O2 < 100 ppm inerting permissive.' },
      { name: 'OPL-YD-2301-02 - Gland_Packing_Replacement_PTFE_4526L.pdf', size: 430000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'PTFE gland packing replacement technique.' },
      { name: 'OPL-YD-2301-03 - Chain_Sprocket_Lubrication_and_Tension_S.pdf', size: 450000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'SCM440 chain tension deflection 10-15mm.' },
      { name: 'OPL-YD-2301-04 - Controlled_Temperature_Ramp_Up_Procedure.pdf', size: 420000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Ramp-up max 1.5°C/min to prevent agglomeration.' },
      { name: 'OPL-YD-2301-05 - Rotary_Joint_Steam_Leak_Handling_Kadant.pdf', size: 460000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Kadant carbon ring wear inspection.' },
      { name: 'OPL-YD-2301-06 - Outlet_Moisture_Control_Retention_Time_M.pdf', size: 430000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Target moisture 0.05% - 0.12%.' },
      { name: 'OPL-YD-2301-07 - Trunnion_Bearing_Inspection_Drum_Float.pdf', size: 440000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Trunnion bearing axial expansion clearance.' }
    ],
  },
  {
    setNumber: 3,
    folderName: 'Set_03_DC-3401A_CATALYST_REDUCTION_REACTOR',
    equipmentTag: 'DC-3401A',
    equipmentName: 'CATALYST REDUCTION REACTOR',
    unit: 'LLDPE Unit (Area 3400 Catalyst Prep)',
    documentsCount: 12,
    files: [
      { name: 'Equipment Datasheet - DC-3401A.pdf', size: 1540000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Reactor shell SA-516 Gr.70, design 5 barg @ 250°C, H2 reduction.' },
      { name: 'Equipment Drawing DC-3401A.pdf', size: 1980000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Internal distribution grid, multipoint thermocouple TE-3401 nozzles.' },
      { name: 'Interlock Logic Diagram DC-3401A.pdf', size: 1120000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'SEQ-3401: AI-3401 O2 < 100 ppm, TSHH-3401 > 230°C 2oo3 voting.' },
      { name: 'P&ID Set 3.png', size: 1113463, type: 'png', parsedStatus: 'INDEXED', extractedSummary: 'P&ID Set 3: H2 injection, heater EA-3401, PSV-3401, analyzer AI-3401.' },
      { name: 'Plot Plan DC-3401A.pdf', size: 840000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Catalyst prep containment bunker.' },
      { name: 'OPL-DC-3401A-01 Reduction_DC_3401A_4_Step_Overview.pdf', size: 450000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Inerting, Heat-up, Reduction, Cooling cycle.' },
      { name: 'OPL-DC-3401A-02 Inerting_O2_Freeing_Below_100_ppm.pdf', size: 430000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Interlock T3 O2 freeing verification.' },
      { name: 'OPL-DC-3401A-03 Heating_Up_Bed_Homogenisation.pdf', size: 420000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Hot N2 recirculation > 150 kg/h.' },
      { name: 'OPL-DC-3401A-04 Hydrogen_Reduction_Safety_Exotherm_Contr.pdf', size: 460000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Exotherm ramp rate control to protect TE-3401.' },
      { name: 'OPL-DC-3401A-05 Cooling_Down_Catalyst_Preservation.pdf', size: 430000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Cooling under dry N2 below 45°C.' },
      { name: 'OPL-DC-3401A-06 Multipoint_Thermocouple_TE_3401_Verifica.pdf', size: 440000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: '8-point thermocouple calibration check.' },
      { name: 'OPL-DC-3401A-07 Manway_Gasket_Box_Up_After_Catalyst_Chan.pdf', size: 420000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Spiral wound SS316 gasket installation.' }
    ],
  },
  {
    setNumber: 4,
    folderName: 'Set_04_KC-4501_RECYCLE_GAS_COMPRESSOR',
    equipmentTag: 'KC-4501',
    equipmentName: 'RECYCLE GAS COMPRESSOR',
    unit: 'LLDPE Unit (Area 4500 Gas Compression)',
    documentsCount: 12,
    files: [
      { name: 'Equipment Datasheet - KC-4501.pdf', size: 1680000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: '2-stage 2-throw reciprocating machine, 28.5 barg discharge, N2 seal gas.' },
      { name: 'Equipment GA Drawing KC-4501.pdf', size: 2150000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Cylinder crosshead assembly, lube oil console P1.' },
      { name: 'Interlock Logic Diagram KC-4501.pdf', size: 1240000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'SEQ-4501: PSLL-4504, VSHH-4505, LSHH-4510, FSL-4508.' },
      { name: 'P&ID SET 4.png', size: 1201350, type: 'png', parsedStatus: 'INDEXED', extractedSummary: 'P&ID Set 4: Recycle compressor, FV-4502 anti-surge, KO drum FA-4510.' },
      { name: 'Plot Plan KC-4501.pdf', size: 890000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Compressor house sound attenuated booth.' },
      { name: 'OPL-KC-4501-01 Lube_Oil_System_Pre_Start_Priming.pdf', size: 450000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Aux oil pump pre-priming >= 2.5 barg.' },
      { name: 'OPL-KC-4501-02 Compressor_Suction_Discharge_Valve_Inspe.pdf', size: 460000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Suction/discharge valve plate spring inspection.' },
      { name: 'OPL-KC-4501-03 Seal_Gas_N2_Buffer_Management.pdf', size: 440000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'N2 buffer flow FT-4506 >= 15 Nm3/h.' },
      { name: 'OPL-KC-4501-04 Anti_Surge_Recycle_Operation.pdf', size: 450000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Anti-surge FV-4502 full open on startup.' },
      { name: 'OPL-KC-4501-05 Crosshead_Vibration_Monitoring_VSHH_4505.pdf', size: 430000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Crosshead vibration 28 µm trip response.' },
      { name: 'OPL-KC-4501-06 Suction_KO_Drum_Draining_FA_4510.pdf', size: 420000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Condensate draining to prevent liquid slugging.' },
      { name: 'OPL-KC-4501-07 Intercooler_EA_4502_Performance_Check.pdf', size: 430000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Intercooler exit gas temp limit 45°C.' }
    ],
  },
  {
    setNumber: 5,
    folderName: 'Set_05_EA-5601_SOLVENT_HEATER',
    equipmentTag: 'EA-5601',
    equipmentName: 'SOLVENT HEATER',
    unit: 'LLDPE Unit (Area 5600 Solvent Recovery)',
    documentsCount: 12,
    files: [
      { name: 'Equipment Datasheet - EA-5601.pdf', size: 1320000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'TEMA shell & tube MP steam solvent heater, design 16 barg.' },
      { name: 'Equipment GA Drawing EA-5601.pdf', size: 1740000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Channel head, bundle removal clearance, steam trap connection.' },
      { name: 'Interlock Logic Diagram EA-5601.pdf', size: 940000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'IL-EA-5601: PDAH-5605 > 0.7 bar fouling alarm, TCV-5602.' },
      { name: 'P&ID SET 5.png', size: 1145355, type: 'png', parsedStatus: 'INDEXED', extractedSummary: 'P&ID Set 5: Hexane from GA-5610, MP steam, steam trap ST-5604, PSV-5607.' },
      { name: 'Plot Plan EA-5601.pdf', size: 780000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Exchanger bay structure elevation +0.00.' },
      { name: 'OPL-EA-5601-01 - Tube_Side_Cleaning_Hydrojetting.pdf', size: 440000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: '700 bar hydrojetting polymer scale removal.' },
      { name: 'OPL-EA-5601-02 - Gasket_Replacement_Flange_Box_Up.pdf', size: 420000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Channel gasket cross-torquing in 4 passes.' },
      { name: 'OPL-EA-5601-03 - Steam_Trap_Health_Check.pdf', size: 430000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'ST-5604 ultrasonic & IR blowout detection.' },
      { name: 'OPL-EA-5601-04 - Thermal_Shock_Avoidance_on_Start_Up.pdf', size: 450000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: '15-minute gradual warmup crack open 10%.' },
      { name: 'OPL-EA-5601-05 - Tube_Leak_Detection_Plugging.pdf', size: 430000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Soap-bubble testing & brass tube plugging.' },
      { name: 'OPL-EA-5601-06 - Fouling_Trend_Cleaning_Schedule_PDT_5605.pdf', size: 440000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Chemical wash triggered when dP > 0.70 bar.' },
      { name: 'OPL-EA-5601-07 - PSV_5607_Testing_Car_Seal_Management.pdf', size: 420000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: '16 barg pop test & car-seal verification.' }
    ],
  },
  {
    setNumber: 6,
    folderName: 'Set_06_LV-6701_SEPARATOR_LEVEL_CONTROL_VALVE',
    equipmentTag: 'LV-6701',
    equipmentName: 'SEPARATOR LEVEL CONTROL VALVE',
    unit: 'LLDPE Unit (Area 6700 Product Separation)',
    documentsCount: 12,
    files: [
      { name: 'Equipment Datasheet - LV-6701.pdf', size: 1280000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Fisher 667 globe valve, DVC6200 positioner, ASME 300#, length 300mm.' },
      { name: 'Equipment GA Drawing - LV-6701.pdf', size: 1650000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Actuator diaphragm chamber, air supply regulator, stroke gauge.' },
      { name: 'Interlock Logic Diagram - LV-6701.pdf', size: 980000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'SEQ-6701: LSHH-6710 > 85% open full, LSLL-6710 < 15% DCS alarm.' },
      { name: 'P&ID SET 6.png', size: 920771, type: 'png', parsedStatus: 'INDEXED', extractedSummary: 'P&ID Set 6: LP separator FA-6710, LV-6701, DVC6200, instrument air PSL-6702.' },
      { name: 'Plot Plan LV-6701.pdf', size: 750000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Separation skid platform.' },
      { name: 'OPL-LV-6701-01 - Control_Valve_Stroke_Calibration_DVC6200.pdf', size: 450000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Fieldvue autocalibration within 0.5%.' },
      { name: 'OPL-LV-6701-02 - Instrument_Air_Supply_Filter_Regulator.pdf', size: 420000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Daily moisture drain, air press 4.2 barg.' },
      { name: 'OPL-LV-6701-03 - Packing_Adjustment_PTFE_V_Ring.pdf', size: 430000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Live-loaded packing spring washer adjustment.' },
      { name: 'OPL-LV-6701-04 - Positioner_Response_Loop_Check.pdf', size: 440000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Dynamic step response under 1.8 seconds.' },
      { name: 'OPL-LV-6701-05 - Manual_Bypass_HV_6701_Operation.pdf', size: 430000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Manual bypass radio protocol with board operator.' },
      { name: 'OPL-LV-6701-06 - Fail_Closed_ESD_Action_Verification.pdf', size: 440000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Air dump emergency close time < 1.2s.' },
      { name: 'OPL-LV-6701-07 - Actuator_Diaphragm_Inspection_Fisher_667.pdf', size: 430000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Elastomer diaphragm flex fatigue checks.' }
    ],
  },
  {
    setNumber: 7,
    folderName: 'Set_07_CT-7801_COOLING_TOWER_CELL_FAN',
    equipmentTag: 'CT-7801',
    equipmentName: 'COOLING TOWER CELL FAN',
    unit: 'LLDPE Unit (Area 7800 Cooling Water)',
    documentsCount: 12,
    files: [
      { name: 'Equipment Datasheet - CT-7801.pdf', size: 1450000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: '55 kW TEFC IP56 fan, 6 FRP blades, composite shaft, ISO VG 220 oil.' },
      { name: 'Equipment GA Drawing - CT-7801.pdf', size: 1890000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Cooling tower stack, fan cowl, gearbox torque arm.' },
      { name: 'Interlock Logic Diagram - CT-7801.pdf', size: 1040000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'SEQ-7801: VSHH-7802 > 9 mm/s, TSHH-7802 > 90°C, PSL-7807 < 0.8 barg.' },
      { name: 'P&ID_Set 7.png', size: 1175538, type: 'png', parsedStatus: 'INDEXED', extractedSummary: 'P&ID Set 7: Cooling cell, fan CT-7801, basin level LSL-7804, spare CT-7802.' },
      { name: 'Plot Plan - CT-7801.pdf', size: 810000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Cooling tower basin & riser header.' },
      { name: 'OPL-CT-7801-01 - Barscreen_Cleaning_Suction_Screen.pdf', size: 430000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Basin screen cleaning to avoid pump starvation.' },
      { name: 'OPL-CT-7801-02 - Gearbox_Oil_Level_Change_ISO_VG_220.pdf', size: 440000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'ISO VG 220 synthetic oil change protocol.' },
      { name: 'OPL-CT-7801-03 - Fan_Blade_Inspection_Balance_FRP.pdf', size: 450000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'FRP blade dynamic balance < 2.5 mm/s.' },
      { name: 'OPL-CT-7801-04 - Circulating_Water_pH_Control_AI_7805.pdf', size: 430000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'pH regulation 7.2 - 7.8 with acid/biocide.' },
      { name: 'OPL-CT-7801-05 - Drift_Eliminator_Fill_Inspection.pdf', size: 420000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'PVC drift eliminator panel alignment.' },
      { name: 'OPL-CT-7801-06 - Gearbox_Vibration_Monitoring_VSHH_7802.pdf', size: 440000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Vibration trip 9.0 mm/s and spare cell start.' },
      { name: 'OPL-CT-7801-07 - Conductivity_Blowdown_Control_AI_7806.pdf', size: 430000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Cycles of concentration (COC) 4.5 blowdown.' }
    ],
  },
  {
    setNumber: 8,
    folderName: 'Set_08_FA-8901_REFLUX_ACCUMULATOR_DRUM',
    equipmentTag: 'FA-8901',
    equipmentName: 'REFLUX ACCUMULATOR DRUM',
    unit: 'LLDPE Unit (Area 8900 Solvent Fractionation)',
    documentsCount: 12,
    files: [
      { name: 'Equipment Datasheet - FA-8901.pdf', size: 1410000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'SA-516 Gr.70 drum, dia 1600mm, vol 9.5 m3, PSV set 10 barg.' },
      { name: 'Equipment GA Drawing - FA-8901.pdf', size: 1820000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Saddle supports, demister pad, water boot nozzle N4.' },
      { name: 'Interlock Logic Diagram - FA-8901.pdf', size: 1020000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'SEQ-8901 (SIL 1): LSHH-8901 > 85%, LSLL-8901 < 15%, PSHH-8902 > 8 barg.' },
      { name: 'P&ID_Set 8.png', size: 1202759, type: 'png', parsedStatus: 'INDEXED', extractedSummary: 'P&ID Set 8: Reflux drum FA-8901, pumps GA-8920A/B, boot valve HV-8904.' },
      { name: 'Plot Plan - FA-8901.pdf', size: 790000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Fractionation column skirt structure.' },
      { name: 'OPL-FA-8901-01 - Level_Gauge_Bridle_Verification_LT_8901.pdf', size: 440000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Weekly electronic vs sight glass cross-check.' },
      { name: 'OPL-FA-8901-02 - PSV_8901_Testing_Car_Seal_Management.pdf', size: 430000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: '10 barg pop set pressure on N2 bench.' },
      { name: 'OPL-FA-8901-03 - Water_Boot_Draining_LT_8903.pdf', size: 450000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Aqueous phase slow drain via HV-8904.' },
      { name: 'OPL-FA-8901-04 - Nitrogen_Blanketing_PCV_8905.pdf', size: 430000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'N2 blanket 3.5 - 5.0 barg vacuum protection.' },
      { name: 'OPL-FA-8901-05 - Reflux_Pump_Low_Level_Protection_LSLL_89.pdf', size: 440000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'LSLL-8901 < 15% reflux pump trip.' },
      { name: 'OPL-FA-8901-06 - Corrosion_Thickness_Inspection.pdf', size: 420000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'API 510 ultrasonic grid on vessel bottom.' },
      { name: 'OPL-FA-8901-07 - Manway_Box_Up_After_Internal_Inspection.pdf', size: 430000, type: 'pdf', parsedStatus: 'INDEXED', extractedSummary: 'Demister inspection & 185 Nm torque pattern.' }
    ],
  },
];

// Convert real maintenance records to MaintenanceRecord format
const defaultMaintenanceRecords: MaintenanceRecord[] = CALIBER_MAINTENANCE_RECORDS.map((r, idx) => ({
  id: r.id || `wo-${idx + 1}`,
  equipmentTag: r.equipmentTag,
  notificationNo: r.notificationNo,
  orderNo: r.woNumber,
  failureDate: r.reportDate.split(' ')[0],
  failureMode: r.problemDescription,
  symptom: r.problemDescription,
  rootCause: r.rootCause,
  correctiveAction: r.correctiveAction,
  downtimeHours: r.downtimeHours,
  costEstimate: `Rp ${r.totalCostIDR.toLocaleString()}`,
  severity: r.downtimeHours > 24 ? 'Major Loss' : r.downtimeHours > 0 ? 'Moderate' : 'Near Miss',
}));

const KnowledgeContext = createContext<KnowledgeContextType | undefined>(undefined);

export const KnowledgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedUnit, setSelectedUnit] = useState<PlantUnit>(PLANT_UNITS[0]);
  const [equipmentList, setEquipmentList] = useState<EquipmentTag[]>(EQUIPMENT_DATABASE);
  const [sopList, setSopList] = useState<SOPDocument[]>(SOP_ARCHIVE);
  const [incidentList, setIncidentList] = useState<IncidentRCA[]>(INCIDENT_RCA_DATABASE);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(defaultMaintenanceRecords);
  const [viewerState, setViewerState] = useState<DocumentViewerState>({ isOpen: false });

  const openDocumentViewer = (doc: Partial<DocumentViewerState>) => {
    setViewerState({
      isOpen: true,
      docId: doc.docId || null,
      fileUrl: doc.fileUrl || null,
      fileName: doc.fileName || null,
      title: doc.title || doc.fileName || 'Technical Document',
      fileType: doc.fileType || (doc.fileUrl?.endsWith('.pdf') ? 'pdf' : doc.fileUrl?.endsWith('.png') ? 'image' : 'sop')
    });
  };

  const closeDocumentViewer = () => {
    setViewerState({ isOpen: false, docId: null, fileUrl: null, fileName: null, title: null, fileType: null });
  };

  const [rawCaliberMaintenance] = useState<CaliberMaintenanceRecord[]>(CALIBER_MAINTENANCE_RECORDS);
  const [oplList, setOplList] = useState<OnePointLesson[]>(ONE_POINT_LESSONS);
  const [machineFolderSets, setMachineFolderSets] = useState<MachineFolderSet[]>(defaultMachineFolderSets);
  const [activePersona, setActivePersona] = useState<PersonaLens>('FIELD_OPERATOR');

  // Load from LocalStorage if previously saved
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.maintenanceRecords) setMaintenanceRecords(parsed.maintenanceRecords);
        if (parsed.machineFolderSets) setMachineFolderSets(parsed.machineFolderSets);
        if (parsed.incidentList) setIncidentList(parsed.incidentList);
      }
    } catch (e) {
      console.warn('Could not read cached knowledge state', e);
    }
  }, []);

  const saveStateToStorage = (updatedRecords: MaintenanceRecord[], updatedSets: MachineFolderSet[], updatedIncidents: IncidentRCA[]) => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          maintenanceRecords: updatedRecords,
          machineFolderSets: updatedSets,
          incidentList: updatedIncidents,
        })
      );
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  };

  // Import Maintenance Records from Excel / CSV
  const importMaintenanceExcel = (records: MaintenanceRecord[], rawFileName?: string) => {
    const existingIds = new Set(maintenanceRecords.map((m) => m.notificationNo || m.id));
    const newRecords = records.filter((r) => !existingIds.has(r.notificationNo || r.id));
    const mergedRecords = [...newRecords, ...maintenanceRecords];

    const newIncidents: IncidentRCA[] = newRecords.map((r, idx) => ({
      id: `rca-import-${Date.now()}-${idx}`,
      incidentNumber: r.notificationNo || `INC-${Date.now().toString().slice(-4)}`,
      title: `${r.equipmentTag}: ${r.failureMode}`,
      unitId: 'unit-lldpe',
      equipmentTag: r.equipmentTag,
      date: r.failureDate || new Date().toISOString().split('T')[0],
      severity: r.severity || 'Major Loss',
      symptoms: r.symptom || 'Abnormal parameter excursion registered in maintenance log.',
      fiveWhys: [
        { whyNumber: 1, question: `Why did ${r.equipmentTag} experience breakdown?`, answer: r.failureMode },
        { whyNumber: 2, question: 'What operational symptom preceded the incident?', answer: r.symptom },
        { whyNumber: 3, question: 'What was the mechanical or process mechanism?', answer: r.rootCause },
        { whyNumber: 4, question: 'Why was this not caught in pre-checks?', answer: 'Improper execution or uncodified tacit knowledge in shift procedure.' },
        { whyNumber: 5, question: 'What is the root cause?', answer: r.rootCause },
      ],
      rootCauseCategory: (r.rootCause || '').toLowerCase().includes('procedure') ? 'Improper Procedure Execution' : 'Equipment Mechanical Fatigue',
      rootCauseSummary: r.rootCause,
      immediateActionTaken: r.correctiveAction,
      preventativeActions: [
        r.correctiveAction,
        `Update active SOP for ${r.equipmentTag} to prevent repeat occurrence.`,
        'Enforce Execution Guard checklist verification before line-up.',
      ],
      lessonsLearned: `Field lesson learned from ${r.equipmentTag} event: ${r.rootCause}`,
      pidRef: 'PID_Set_01.png',
      sopUpdateRef: 'CAP-SOP-LLD-1201',
    }));

    const mergedIncidents = [...newIncidents, ...incidentList];

    setMaintenanceRecords(mergedRecords);
    setIncidentList(mergedIncidents);
    saveStateToStorage(mergedRecords, machineFolderSets, mergedIncidents);
  };

  // Import individual machine document into one of the 8 Folder Sets
  const importMachineDocument = async (
    machineSetIdx: number,
    fileName: string,
    fileContent: string,
    fileType: string
  ) => {
    const updatedSets = [...machineFolderSets];
    const targetSet = updatedSets[machineSetIdx];

    if (!targetSet) return;

    let summary = `Imported technical document (${fileType.toUpperCase()}) for ${targetSet.equipmentTag}`;
    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fileName,
          docType: fileType.toUpperCase(),
          contentText: fileContent.slice(0, 3000),
        }),
      });
      const data = await res.json();
      if (data.extractedData && data.extractedData.executionSteps) {
        summary = `Extracted ${data.extractedData.executionSteps.length} steps, ${data.extractedData.equipmentTags?.length || 1} tags. Risk: ${data.extractedData.riskRating || 'Medium'}`;
      }
    } catch (e) {
      console.warn('AI Ingestion call failed, using heuristic summary', e);
    }

    targetSet.files.unshift({
      name: fileName,
      size: fileContent.length,
      type: fileType,
      parsedStatus: 'INDEXED',
      extractedSummary: summary,
    });
    targetSet.documentsCount = targetSet.files.length;

    setMachineFolderSets(updatedSets);
    saveStateToStorage(maintenanceRecords, updatedSets, incidentList);
    return summary;
  };

  const importPptExplanation = async (title: string, slidesContent: string) => {
    const newOpl: OnePointLesson = {
      id: `opl-ppt-${Date.now()}`,
      oplNumber: `OPL-PPT-${Math.floor(Math.random() * 800 + 100)}`,
      title: `Dataset Architecture: ${title}`,
      unitId: 'unit-lldpe',
      category: 'Improvement',
      equipmentTag: 'PLANT-DATA-OPS',
      authorName: 'Chandra Asri Data Ops Team',
      authorRole: 'Digital Transformation & Plant Reliability',
      experienceYears: 10,
      publishedDate: new Date().toISOString().split('T')[0],
      verifiedBy: 'Central Reliability Committee',
      goldenRule: 'Equipment Tag is the common key connecting P&IDs, SOPs, and Maintenance Logs.',
      practicalTip: slidesContent.slice(0, 400),
      visualCheckNote: 'Verify tag mapping across all 8 machine sets and 211 maintenance records.',
      consequencesOfOmission: 'Fragmented decision making and delayed root cause identification.',
      upvotes: 28,
    };

    setOplList([newOpl, ...oplList]);
    return true;
  };

  const resetToDefaultDataset = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setMaintenanceRecords(defaultMaintenanceRecords);
    setMachineFolderSets(defaultMachineFolderSets);
    setIncidentList(INCIDENT_RCA_DATABASE);
  };

  const exportKnowledgeDataset = () => {
    const dataToExport = {
      timestamp: new Date().toISOString(),
      source: 'Chandra Asri CHAKRA Knowledge Platform',
      equipment: equipmentList,
      maintenanceRecords,
      machineFolderSets,
      sops: sopList,
      incidents: incidentList,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ChandraAsri_CHAKRA_KnowledgeGraph_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const verifyOPL = (id: string, verifierName: string, verifierRole: string, comment: string, safetyScore: number = 5) => {
    setOplList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              verificationStatus: 'VERIFIED',
              verifiedBy: verifierName,
              verifierRole,
              verifiedAt: `${new Date().toLocaleDateString('en-CA')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
              verifierComment: comment,
              safetyScore,
            }
          : item
      )
    );
  };

  const rejectOPL = (id: string, reason: string) => {
    setOplList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              verificationStatus: 'REJECTED',
              verifiedBy: 'Revision Requested by Senior Reviewer',
              verifierComment: reason,
              verifiedAt: `${new Date().toLocaleDateString('en-CA')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
            }
          : item
      )
    );
  };

  const addOPL = (newLesson: OnePointLesson) => {
    setOplList((prev) => [newLesson, ...prev]);
  };

  return (
    <KnowledgeContext.Provider
      value={{
        selectedUnit,
        setSelectedUnit,
        equipmentList,
        sopList,
        incidentList,
        maintenanceRecords,
        rawCaliberMaintenance,
        oplList,
        machineFolderSets,
        activePersona,
        setActivePersona,
        activePersonaConfig: PERSONA_CONFIGS[activePersona],
        verifyOPL,
        rejectOPL,
        addOPL,
        viewerState,
        openDocumentViewer,
        closeDocumentViewer,
        importMaintenanceExcel,
        importMachineDocument,
        importPptExplanation,
        resetToDefaultDataset,
        exportKnowledgeDataset,
      }}
    >
      {children}
    </KnowledgeContext.Provider>
  );
};

export const useKnowledge = () => {
  const context = useContext(KnowledgeContext);
  if (!context) {
    throw new Error("useKnowledge must be used within a KnowledgeProvider");
  }
  return context;
};
