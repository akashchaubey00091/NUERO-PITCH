import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Compass,
  FileText,
  Flame,
  Gauge,
  Layers,
  ShieldAlert,
  TrendingUp,
  Users,
  Video,
  Zap
} from 'lucide-react';
import { MatchSummary, Player, RiskSignal, TacticalPhaseEvent, TrackingFrame } from '../../types/football';
import { TacticalPitch } from '../pitch/TacticalPitch';

interface DashboardOverviewProps {
  matchSummary: MatchSummary;
  players: Player[];
  riskSignals: RiskSignal[];
  tacticalPhases: TacticalPhaseEvent[];
  trackingFrames: TrackingFrame[];
  onNavigateTab: (tab: string) => void;
  onSelectPlayer: (id: string | null) => void;
  isDark: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  matchSummary,
  players,
  riskSignals,
  tacticalPhases,
  trackingFrames,
  onNavigateTab,
  onSelectPlayer,
  isDark,
}) => {
  const topSpeedLeaders = [...players]
    .sort((a, b) => b.metrics.topSpeedKmh - a.metrics.topSpeedKmh)
    .slice(0, 4);

  const topDistanceLeaders = [...players]
    .sort((a, b) => b.metrics.totalDistanceKm - a.metrics.totalDistanceKm)
    .slice(0, 4);

  const topDecelLeaders = [...players]
    .sort((a, b) => b.metrics.highDecelsCount - a.metrics.highDecelsCount)
    .slice(0, 4);

  const elevatedRisks = riskSignals.filter((r) => r.severity === 'elevated');

  return (
    <div className="space-y-4">
      {/* Stadium Match Banner */}
      <div className={`p-5 rounded-lg border shadow-xs ${
        isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-mono text-xs font-bold">
              <span className="text-emerald-700 uppercase font-black">MATCH RECORD</span>
              <span className="text-slate-400">·</span>
              <span className={isDark ? 'text-[#8c919b]' : 'text-slate-800'}>{matchSummary.competition}</span>
              <span className="text-slate-400">·</span>
              <span className={isDark ? 'text-[#8c919b]' : 'text-slate-800'}>{matchSummary.venue}</span>
            </div>

            <div className="flex items-center gap-4 text-3xl font-black font-['Barlow_Condensed',sans-serif] tracking-wide">
              <span className={isDark ? 'text-[#38bdf8]' : 'text-sky-800'}>{matchSummary.homeTeam.name}</span>
              <span className={`font-mono text-2xl px-4 py-1 rounded border font-black ${
                isDark ? 'bg-[#090b0e] border-[#222733] text-white' : 'bg-slate-100 border-slate-300 text-slate-950 shadow-xs'
              }`}>
                {matchSummary.score.home} : {matchSummary.score.away}
              </span>
              <span className={isDark ? 'text-[#ef4444]' : 'text-red-800'}>{matchSummary.awayTeam.name}</span>
            </div>

            <p className={`text-xs font-bold ${isDark ? 'text-[#8c919b]' : 'text-slate-800'}`}>
              Optical Tracking Model: YOLOv8-Foot + ByteTrack · Reprojection RMS Error: {matchSummary.homographyReprojectionErrorM}m · Frame Latency: 33ms
            </p>
          </div>

          {/* Quick Hub Navigation */}
          <div className="flex flex-wrap items-center gap-2 font-black font-mono">
            <button
              onClick={() => onNavigateTab('video')}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase rounded shadow-xs transition-colors cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Video Studio</span>
            </button>

            <button
              onClick={() => onNavigateTab('pitch')}
              className={`flex items-center gap-1.5 px-4 py-2 border text-xs font-black uppercase rounded shadow-xs transition-colors cursor-pointer ${
                isDark
                  ? 'border-[#262b36] bg-[#161922] hover:bg-[#1b1f2b] text-[#d1d5db]'
                  : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-950'
              }`}
            >
              <Compass className="w-4 h-4 text-sky-700" />
              <span>Tactical Board</span>
            </button>

            <button
              onClick={() => onNavigateTab('reports')}
              className={`flex items-center gap-1.5 px-4 py-2 border text-xs font-black uppercase rounded shadow-xs transition-colors cursor-pointer ${
                isDark
                  ? 'border-[#262b36] bg-[#161922] hover:bg-[#1b1f2b] text-[#d1d5db]'
                  : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-950'
              }`}
            >
              <FileText className="w-4 h-4 text-amber-700" />
              <span>Report Brief</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className={`p-3.5 rounded-lg border shadow-xs ${
          isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
        }`}>
          <span className="text-[11px] font-mono font-bold text-slate-700 block uppercase">
            CV CONFIDENCE
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono tabular-nums text-emerald-700">
              {(matchSummary.meanTrackingConfidence * 100).toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-600 font-bold font-mono">mAP</span>
          </div>
          <span className="text-[10px] text-slate-700 font-bold font-mono">22 Players + Ball</span>
        </div>

        <div className={`p-3.5 rounded-lg border shadow-xs ${
          isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
        }`}>
          <span className="text-[11px] font-mono font-bold text-slate-700 block uppercase">
            TOTAL DISTANCE
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono tabular-nums text-slate-950">218.4</span>
            <span className="text-[10px] text-slate-600 font-bold font-mono">km</span>
          </div>
          <span className="text-[10px] text-sky-700 font-black font-mono">MCI: 112.8 · ARS: 105.6</span>
        </div>

        <div className={`p-3.5 rounded-lg border shadow-xs ${
          isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
        }`}>
          <span className="text-[11px] font-mono font-bold text-slate-700 block uppercase">
            HIGH SPEED RUNNING
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono tabular-nums text-slate-950">18.2</span>
            <span className="text-[10px] text-slate-600 font-bold font-mono">km</span>
          </div>
          <span className="text-[10px] text-slate-700 font-bold font-mono">Zone 4 (19.8-25.2 km/h)</span>
        </div>

        <div className={`p-3.5 rounded-lg border shadow-xs ${
          isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
        }`}>
          <span className="text-[11px] font-mono font-bold text-slate-700 block uppercase">
            SPRINT VOLUME
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono tabular-nums text-slate-950">6.4</span>
            <span className="text-[10px] text-slate-600 font-bold font-mono">km</span>
          </div>
          <span className="text-[10px] text-slate-700 font-bold font-mono">Zone 5 (&gt;25.2 km/h)</span>
        </div>

        <div className={`p-3.5 rounded-lg border shadow-xs ${
          isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
        }`}>
          <span className="text-[11px] font-mono font-bold text-slate-700 block uppercase">
            SPATIAL CONTROL
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono tabular-nums text-sky-700">56.4%</span>
            <span className="text-[10px] text-slate-600 font-bold font-mono">MCI</span>
          </div>
          <span className="text-[10px] text-red-700 font-black font-mono">Arsenal: 43.6%</span>
        </div>

        <div className={`p-3.5 rounded-lg border shadow-xs ${
          isDark ? 'bg-[#181512] border-[#382717]' : 'bg-amber-50/80 border-amber-300'
        }`}>
          <span className="text-[11px] font-mono text-amber-900 font-extrabold block uppercase">
            MOVEMENT RISK
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono tabular-nums text-amber-700">
              {elevatedRisks.length}
            </span>
            <span className="text-[10px] text-amber-800 font-bold font-mono">ELEVATED</span>
          </div>
          <span className="text-[10px] text-slate-700 font-bold font-mono">2 Moderate Signals</span>
        </div>
      </div>

      {/* Main Grid: Pitch Console + Movement Risk Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Pitch (2 cols) */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider font-black text-slate-800 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-700" />
              <span>TACTICAL PITCH CONTROL &amp; SPATIAL DOMINANCE</span>
            </h3>

            <button
              onClick={() => onNavigateTab('pitch')}
              className="text-xs text-emerald-800 hover:underline flex items-center gap-1 font-mono font-black"
            >
              <span>EXPAND PITCH STUDIO</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <TacticalPitch
            frames={trackingFrames}
            players={players}
            homeTeam={matchSummary.homeTeam}
            awayTeam={matchSummary.awayTeam}
            selectedPlayerId={null}
            onSelectPlayer={onSelectPlayer}
            isDark={isDark}
          />
        </div>

        {/* Right: Movement Risk Signals (1 col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider font-black text-slate-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>MOVEMENT RISK SCREENING</span>
            </h3>

            <button
              onClick={() => onNavigateTab('risk')}
              className="text-xs text-amber-800 hover:underline flex items-center gap-1 font-mono font-black"
            >
              <span>VIEW DOSSIER ({riskSignals.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {riskSignals.slice(0, 3).map((sig) => (
              <div
                key={sig.id}
                onClick={() => {
                  onSelectPlayer(sig.playerId);
                  onNavigateTab('players');
                }}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all shadow-xs ${
                  isDark
                    ? 'bg-[#12141a] border-[#1e232d] hover:border-[#2f3545]'
                    : 'bg-white border-slate-300 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded flex items-center justify-center font-black text-white text-[10px] font-mono ${
                      sig.teamId === 'home' ? 'bg-[#0284c7]' : 'bg-[#dc2626]'
                    }`}>
                      {sig.playerNumber}
                    </span>
                    <span className="font-extrabold text-xs text-slate-950">{sig.playerName}</span>
                  </div>
                  <span className="text-[10px] font-mono font-black uppercase text-amber-800 px-2 py-0.5 rounded border border-amber-300 bg-amber-50">
                    {sig.severity} Risk
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-900 mb-1">{sig.title}</div>
                <div className="text-[11px] font-mono text-slate-700 font-bold mb-2 truncate">{sig.metricTrigger}</div>

                <div className="text-[11px] text-emerald-800 font-mono font-bold pt-1.5 border-t border-slate-200">
                  {sig.mitigationProtocol}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboards: Bold & Crisp */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Speed */}
        <div className={`p-4 rounded-lg border shadow-xs ${
          isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-mono text-xs uppercase tracking-wider font-black text-slate-800 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-red-600" />
              <span>PEAK VELOCITY (KM/H)</span>
            </h4>
          </div>

          <div className="space-y-2 font-bold">
            {topSpeedLeaders.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectPlayer(p.id);
                  onNavigateTab('players');
                }}
                className={`flex items-center justify-between p-2 rounded border cursor-pointer text-xs font-mono tabular-nums ${
                  isDark ? 'bg-[#0b0c10] border-[#1a1c24]' : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-950'
                }`}
              >
                <div className="flex items-center gap-2 font-sans font-bold">
                  <span className="text-slate-500 font-mono text-xs w-3 font-black">{idx + 1}</span>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-white text-[10px] ${
                    p.teamId === 'home' ? 'bg-[#0284c7]' : 'bg-[#dc2626]'
                  }`}>
                    {p.number}
                  </span>
                  <span className="font-extrabold text-slate-950">{p.name}</span>
                </div>
                <span className="font-black text-emerald-700">{p.metrics.topSpeedKmh}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Highest Workload Distance */}
        <div className={`p-4 rounded-lg border shadow-xs ${
          isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-mono text-xs uppercase tracking-wider font-black text-slate-800 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-sky-600" />
              <span>TOTAL DISTANCE (KM)</span>
            </h4>
          </div>

          <div className="space-y-2 font-bold">
            {topDistanceLeaders.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectPlayer(p.id);
                  onNavigateTab('players');
                }}
                className={`flex items-center justify-between p-2 rounded border cursor-pointer text-xs font-mono tabular-nums ${
                  isDark ? 'bg-[#0b0c10] border-[#1a1c24]' : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-950'
                }`}
              >
                <div className="flex items-center gap-2 font-sans font-bold">
                  <span className="text-slate-500 font-mono text-xs w-3 font-black">{idx + 1}</span>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-white text-[10px] ${
                    p.teamId === 'home' ? 'bg-[#0284c7]' : 'bg-[#dc2626]'
                  }`}>
                    {p.number}
                  </span>
                  <span className="font-extrabold text-slate-950">{p.name}</span>
                </div>
                <span className="font-black text-sky-700">{p.metrics.totalDistanceKm}</span>
              </div>
            ))}
          </div>
        </div>

        {/* High Decelerations */}
        <div className={`p-4 rounded-lg border shadow-xs ${
          isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-mono text-xs uppercase tracking-wider font-black text-slate-800 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-600" />
              <span>HIGH DECELS (&lt; -4.0 M/S²)</span>
            </h4>
          </div>

          <div className="space-y-2 font-bold">
            {topDecelLeaders.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectPlayer(p.id);
                  onNavigateTab('players');
                }}
                className={`flex items-center justify-between p-2 rounded border cursor-pointer text-xs font-mono tabular-nums ${
                  isDark ? 'bg-[#0b0c10] border-[#1a1c24]' : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-950'
                }`}
              >
                <div className="flex items-center gap-2 font-sans font-bold">
                  <span className="text-slate-500 font-mono text-xs w-3 font-black">{idx + 1}</span>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center font-black text-white text-[10px] ${
                    p.teamId === 'home' ? 'bg-[#0284c7]' : 'bg-[#dc2626]'
                  }`}>
                    {p.number}
                  </span>
                  <span className="font-extrabold text-slate-950">{p.name}</span>
                </div>
                <span className="font-black text-amber-700">{p.metrics.highDecelsCount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
