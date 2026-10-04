/**
 * NeuroPitch Football Analytics Platform
 * Academic Sports Science & Computer Vision Domain Models
 */

export type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'DM' | 'CM' | 'AM' | 'LW' | 'RW' | 'CF';

export type TeamId = 'home' | 'away';

export type RiskSeverity = 'low' | 'medium' | 'elevated';

export interface PlayerMetrics {
  totalDistanceKm: number;
  hsrDistanceM: number; // High Speed Running (19.8 - 25.2 km/h)
  sprintDistanceM: number; // Sprinting (> 25.2 km/h)
  topSpeedKmh: number;
  metabolicPowerWkg: number; // Osgnach & di Prampero model (W/kg)
  accelsCount: number; // > 3.0 m/s²
  decelsCount: number; // < -3.0 m/s²
  highDecelsCount: number; // < -4.0 m/s² (high eccentric strain)
  acwr: number; // Acute-to-Chronic Workload Ratio
  asymmetryIndexPct: number; // Left vs Right COD asymmetry %
  fatigueIndexPct: number; // Sprint speed decay from 1st to 2nd half
  trackingConfidence: number; // Computer vision detection confidence (0 - 1)
  workloadStatus: 'optimal' | 'moderate' | 'elevated_risk' | 'underloaded';
}

export interface Player {
  id: string;
  number: number;
  name: string;
  position: Position;
  teamId: TeamId;
  teamName: string;
  metrics: PlayerMetrics;
  historicalLoads: number[]; // 28-day chronic load series
  currentX: number; // Pitch X: 0 to 105 meters
  currentY: number; // Pitch Y: 0 to 68 meters
  vx: number; // velocity x (m/s)
  vy: number; // velocity y (m/s)
  speedKmh: number;
  jerseyColor: string;
}

export interface Team {
  id: TeamId;
  name: string;
  shortName: string;
  formation: string; // e.g., '4-3-3', '4-2-3-1'
  primaryColor: string;
  secondaryColor: string;
  centroid: { x: number; y: number };
  widthM: number;
  lengthM: number;
  convexHullAreaM2: number;
  compactnessIndex: number; // Area / Length
  possessionPct: number;
  pitchControlPct: number;
  defensiveLineHeightM: number; // Distance from own goal line
  ppda: number; // Passes Allowed Per Defensive Action
}

export interface PlayerFrameData {
  id: string;
  teamId: TeamId;
  number: number;
  x: number; // 0 - 105m
  y: number; // 0 - 68m
  vx: number;
  vy: number;
  speed: number; // km/h
  confidence: number;
  bbox?: [number, number, number, number]; // [x, y, w, h] normalized in broadcast frame
}

export interface TrackingFrame {
  frameIndex: number;
  timestampSeconds: number;
  ball: {
    x: number;
    y: number;
    z: number;
    speedKmh: number;
  };
  players: PlayerFrameData[];
  tacticalPhase: string;
  possessionTeamId: TeamId;
  homeCentroid: { x: number; y: number };
  awayCentroid: { x: number; y: number };
}

export interface RiskSignal {
  id: string;
  playerId: string;
  playerName: string;
  playerNumber: number;
  teamId: TeamId;
  category: 'workload_spike' | 'eccentric_decel_fatigue' | 'movement_asymmetry' | 'high_intensity_density' | 'repeated_sprint_strain';
  severity: RiskSeverity;
  title: string;
  metricTrigger: string;
  contextDescription: string;
  scientificRationale: string;
  literatureCitation: string;
  mitigationProtocol: string;
}

export interface MatchSummary {
  id: string;
  title: string;
  competition: string;
  date: string;
  venue: string;
  score: {
    home: number;
    away: number;
  };
  homeTeam: Team;
  awayTeam: Team;
  durationMinutes: number;
  totalPlayersDetected: number;
  meanTrackingConfidence: number;
  homographyReprojectionErrorM: number;
}

export interface TacticalPhaseEvent {
  minute: string;
  phase: string;
  homeShape: string;
  awayShape: string;
  dominantTeamId: TeamId;
  pitchThird: 'defensive' | 'middle' | 'attacking';
  tacticalInsight: string;
}

export interface CustomDomainConfig {
  domain: string;
  isVerified: boolean;
  cnameRecord: string;
  aRecord: string;
  sslActive: boolean;
  lastChecked: string;
}

export interface AppSettings {
  darkMode: boolean;
  offlineMode: boolean;
  domainConfig: CustomDomainConfig;
  cvConfidenceThreshold: number;
  acwrSpikeThreshold: number;
  highDecelThreshold: number;
}
