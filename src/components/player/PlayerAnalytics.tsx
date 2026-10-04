import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  CheckCircle,
  Clock,
  Compass,
  Flame,
  Gauge,
  HeartPulse,
  Info,
  Layers,
  Search,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { Player, RiskSignal, Team } from '../../types/football';

interface PlayerAnalyticsProps {
  players: Player[];
  selectedPlayerId: string | null;
  onSelectPlayer: (id: string | null) => void;
  riskSignals: RiskSignal[];
  homeTeam: Team;
  awayTeam: Team;
  isDark: boolean;
}

export const PlayerAnalytics: React.FC<PlayerAnalyticsProps> = ({
  players,
  selectedPlayerId,
  onSelectPlayer,
  riskSignals,
  homeTeam,
  awayTeam,
  isDark,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState<'all' | 'home' | 'away'>('all');
  const [posFilter, setPosFilter] = useState<string>('all');

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.number.toString().includes(searchTerm);
      const matchTeam = teamFilter === 'all' || p.teamId === teamFilter;
      const matchPos = posFilter === 'all' || (
        posFilter === 'DEF' && ['CB', 'LB', 'RB'].includes(p.position) ||
        posFilter === 'MID' && ['DM', 'CM', 'AM'].includes(p.position) ||
        posFilter === 'FWD' && ['LW', 'RW', 'CF'].includes(p.position) ||
        posFilter === 'GK' && p.position === 'GK'
      );
      return matchSearch && matchTeam && matchPos;
    });
  }, [players, searchTerm, teamFilter, posFilter]);

  const activePlayer = players.find((p) => p.id === selectedPlayerId) || players[0];
  const playerRisks = riskSignals.filter((r) => r.playerId === activePlayer.id);

  const m = activePlayer.metrics;
  const totalMeters = m.totalDistanceKm * 1000;
  const walkMeters = Math.round(totalMeters * 0.38);
  const jogMeters = Math.round(totalMeters * 0.34);
  const runMeters = Math.round(totalMeters * 0.16);
  const hsrMeters = m.hsrDistanceM;
  const sprintMeters = m.sprintDistanceM;

  const velocityZones = [
    { label: 'Zone 1: Walking (< 7.2 km/h)', meters: walkMeters, pct: ((walkMeters / totalMeters) * 100).toFixed(1), color: '#64748b' },
    { label: 'Zone 2: Jogging (7.2 - 14.4 km/h)', meters: jogMeters, pct: ((jogMeters / totalMeters) * 100).toFixed(1), color: '#0284c7' },
    { label: 'Zone 3: Running (14.4 - 19.8 km/h)', meters: runMeters, pct: ((runMeters / totalMeters) * 100).toFixed(1), color: '#059669' },
    { label: 'Zone 4: High Speed (19.8 - 25.2 km/h)', meters: hsrMeters, pct: ((hsrMeters / totalMeters) * 100).toFixed(1), color: '#d97706' },
    { label: 'Zone 5: Sprinting (> 25.2 km/h)', meters: sprintMeters, pct: ((sprintMeters / totalMeters) * 100).toFixed(1), color: '#dc2626' },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className={`p-3.5 rounded-lg border shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs ${
        isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
      }`}>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by player name or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-3 py-1.5 rounded border text-xs font-bold outline-none transition-colors ${
              isDark
                ? 'bg-[#090b0e] border-[#242833] text-[#ececed] focus:border-[#00d26a]'
                : 'bg-slate-50 border-slate-300 text-slate-950 focus:border-emerald-600'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 font-mono font-bold">
          <div className="flex items-center gap-1">
            {(['all', 'home', 'away'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTeamFilter(t)}
                className={`px-3 py-1.5 rounded text-xs font-extrabold uppercase transition-colors cursor-pointer ${
                  teamFilter === t
                    ? isDark
                      ? 'bg-[#252a37] text-white border border-[#3b4255]'
                      : 'bg-slate-900 text-white shadow-xs'
                    : isDark ? 'text-[#8c919b] hover:text-white' : 'text-slate-700 hover:text-black hover:bg-slate-100'
                }`}
              >
                {t === 'all' ? 'ALL SQUADS' : t === 'home' ? 'MAN CITY' : 'ARSENAL'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 border-l pl-2 border-slate-300">
            {['all', 'GK', 'DEF', 'MID', 'FWD'].map((pos) => (
              <button
                key={pos}
                onClick={() => setPosFilter(pos)}
                className={`px-2.5 py-1 rounded text-xs font-extrabold transition-colors cursor-pointer ${
                  posFilter === pos
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isDark ? 'text-[#8c919b] hover:text-white' : 'text-slate-700 hover:text-black hover:bg-slate-100'
                }`}
              >
                {pos.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Roster & Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: Squad Sheet */}
        <div className={`p-3.5 rounded-lg border shadow-xs max-h-[720px] overflow-y-auto space-y-1.5 ${
          isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
        }`}>
          <div className="text-xs font-mono font-black text-slate-800 uppercase tracking-wider mb-2 px-1">
            MATCH SQUAD ({filteredPlayers.length})
          </div>

          {filteredPlayers.map((p) => {
            const isSelected = p.id === activePlayer.id;
            const isHome = p.teamId === 'home';
            const hasRisk = riskSignals.some((r) => r.playerId === p.id);

            return (
              <div
                key={p.id}
                onClick={() => onSelectPlayer(p.id)}
                className={`p-2.5 rounded border cursor-pointer transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-slate-950 font-bold'
                    : isDark
                    ? 'border-[#1a1c24] hover:border-[#2c3140] bg-[#0b0c10]'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/80 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded flex items-center justify-center font-black text-white text-xs font-mono ${
                    isHome ? 'bg-[#0284c7]' : 'bg-[#dc2626]'
                  }`}>
                    {p.number}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs">{p.name}</span>
                      {hasRisk && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-600 font-bold font-mono">
                      {p.position} · {isHome ? 'MCI' : 'ARS'}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] tabular-nums">
                  <span className="font-black block">{p.metrics.totalDistanceKm} km</span>
                  <span className={`block text-[10px] font-bold ${
                    p.metrics.acwr > 1.45 ? 'text-amber-700' : 'text-slate-600'
                  }`}>
                    ACWR {p.metrics.acwr}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Active Player Dossier */}
        <div className="lg:col-span-3 space-y-4">
          {/* Header Banner */}
          <div className={`p-5 rounded-lg border shadow-xs ${
            isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-white text-3xl font-black font-mono shadow-xs ${
                  activePlayer.teamId === 'home' ? 'bg-[#0284c7]' : 'bg-[#dc2626]'
                }`}>
                  {activePlayer.number}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-3xl font-black font-['Barlow_Condensed',sans-serif] uppercase tracking-wide text-slate-950">
                      {activePlayer.name}
                    </h2>
                    <span className={`text-xs font-mono px-2.5 py-0.5 rounded font-black uppercase ${
                      activePlayer.teamId === 'home'
                        ? 'bg-sky-50 text-sky-800 border border-sky-300'
                        : 'bg-red-50 text-red-800 border border-red-300'
                    }`}>
                      {activePlayer.teamName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-700 font-bold mt-1 font-mono">
                    <span>POS: <strong className="text-slate-950 font-black">{activePlayer.position}</strong></span>
                    <span>·</span>
                    <span>CV TRACKING: <strong className="text-emerald-700 font-black">{(activePlayer.metrics.trackingConfidence * 100).toFixed(1)}%</strong></span>
                    <span>·</span>
                    <span>WORKLOAD: <strong className={
                      activePlayer.metrics.acwr > 1.45 ? 'text-amber-700 font-black' : 'text-emerald-700 font-black'
                    }>{activePlayer.metrics.workloadStatus.toUpperCase()}</strong></span>
                  </div>
                </div>
              </div>

              <div className="text-right font-mono tabular-nums">
                <span className="text-[10px] text-slate-700 font-bold block uppercase">INSTANT VELOCITY</span>
                <span className="text-3xl font-black text-emerald-700">{activePlayer.speedKmh} km/h</span>
                <span className="text-[11px] text-slate-700 font-bold block">PEAK MATCH: {m.topSpeedKmh} km/h</span>
              </div>
            </div>
          </div>

          {/* Physical KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`p-4 rounded-lg border shadow-xs ${
              isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
            }`}>
              <div className="flex items-center justify-between text-xs text-slate-700 font-bold font-mono mb-1">
                <span>TOTAL DISTANCE</span>
                <Activity className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-3xl font-black font-mono tabular-nums text-slate-950">{m.totalDistanceKm} km</div>
              <span className="text-[10px] text-slate-600 font-bold font-mono">94 mins played</span>
            </div>

            <div className={`p-4 rounded-lg border shadow-xs ${
              isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
            }`}>
              <div className="flex items-center justify-between text-xs text-slate-700 font-bold font-mono mb-1">
                <span>HIGH SPEED RUNNING</span>
                <Flame className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-black font-mono tabular-nums text-slate-950">{m.hsrDistanceM} m</div>
              <span className="text-[10px] text-slate-600 font-bold font-mono">19.8 - 25.2 km/h</span>
            </div>

            <div className={`p-4 rounded-lg border shadow-xs ${
              isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
            }`}>
              <div className="flex items-center justify-between text-xs text-slate-700 font-bold font-mono mb-1">
                <span>SPRINT DISTANCE</span>
                <Zap className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-3xl font-black font-mono tabular-nums text-slate-950">{m.sprintDistanceM} m</div>
              <span className="text-[10px] text-slate-600 font-bold font-mono">&gt; 25.2 km/h</span>
            </div>

            <div className={`p-4 rounded-lg border shadow-xs ${
              isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
            }`}>
              <div className="flex items-center justify-between text-xs text-slate-700 font-bold font-mono mb-1">
                <span>METABOLIC POWER</span>
                <HeartPulse className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black font-mono tabular-nums text-slate-950">{m.metabolicPowerWkg} W/kg</div>
              <span className="text-[10px] text-slate-600 font-bold font-mono">Osgnach Model</span>
            </div>
          </div>

          {/* Strain & Asymmetry */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className={`p-4 rounded-lg border shadow-xs ${
              isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
            }`}>
              <div className="flex items-center justify-between mb-2 font-mono text-xs">
                <span className="font-extrabold flex items-center gap-1.5 text-slate-800">
                  <Gauge className="w-4 h-4 text-emerald-600" />
                  <span>ACWR RATIO</span>
                </span>
                <span className={`font-black text-sm ${
                  m.acwr > 1.45 ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  {m.acwr}
                </span>
              </div>

              <div className="w-full bg-slate-200 h-2.5 rounded overflow-hidden flex my-2">
                <div className="bg-sky-500 h-full w-[40%]" />
                <div className="bg-emerald-600 h-full w-[35%]" />
                <div className="bg-amber-500 h-full w-[25%]" />
              </div>

              <div className="flex justify-between text-[10px] font-mono font-bold text-slate-600 mb-2">
                <span>0.80</span>
                <span>1.00</span>
                <span>1.30</span>
                <span>1.50+</span>
              </div>

              <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
                {m.acwr > 1.45
                  ? 'Acute load exceeds 28-day chronic baseline by >45%. Targeted monitoring recommended.'
                  : 'Workload lies within optimal athletic conditioning zone (0.85 - 1.30 ACWR).'}
              </p>
            </div>

            <div className={`p-4 rounded-lg border shadow-xs ${
              isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
            }`}>
              <div className="flex items-center justify-between mb-2 font-mono text-xs">
                <span className="font-extrabold flex items-center gap-1.5 text-slate-800">
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                  <span>BRAKING DECELS</span>
                </span>
                <span className="font-black text-sm text-slate-950">{m.decelsCount} Total</span>
              </div>

              <div className="space-y-1.5 mt-2 font-mono text-xs font-bold tabular-nums">
                <div className="flex justify-between">
                  <span className="text-slate-600 text-[11px]">Accels (&gt;3.0 m/s²)</span>
                  <span className="font-black text-emerald-700">{m.accelsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 text-[11px]">Decels (&lt; -3.0 m/s²)</span>
                  <span className="font-black text-amber-700">{m.decelsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 text-[11px]">High Decels (&lt; -4.0 m/s²)</span>
                  <span className={`font-black ${
                    m.highDecelsCount > 15 ? 'text-red-700' : 'text-slate-950'
                  }`}>
                    {m.highDecelsCount}
                  </span>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border shadow-xs ${
              isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
            }`}>
              <div className="flex items-center justify-between mb-2 font-mono text-xs">
                <span className="font-extrabold flex items-center gap-1.5 text-slate-800">
                  <Compass className="w-4 h-4 text-sky-600" />
                  <span>ASYMMETRY BIAS</span>
                </span>
                <span className={`font-black text-sm ${
                  m.asymmetryIndexPct > 10 ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  {m.asymmetryIndexPct}%
                </span>
              </div>

              <div className="space-y-1.5 mt-2 font-mono text-xs font-bold tabular-nums">
                <div className="flex justify-between">
                  <span className="text-slate-600 text-[11px]">Cutting Bias</span>
                  <span className="font-black text-slate-950">{m.asymmetryIndexPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 text-[11px]">Speed Decay</span>
                  <span className={`font-black ${
                    m.fatigueIndexPct > 8 ? 'text-amber-700' : 'text-slate-950'
                  }`}>
                    -{m.fatigueIndexPct}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Velocity Distribution */}
          <div className={`p-4 rounded-lg border shadow-xs ${
            isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
          }`}>
            <h4 className="font-mono text-xs uppercase tracking-wider font-black text-slate-800 mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-700" />
              <span>VELOCITY ZONE DISTRIBUTION (FIFA CLASSIFICATION)</span>
            </h4>

            <div className="space-y-2.5">
              {velocityZones.map((z, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono font-bold tabular-nums text-slate-950">
                    <span>{z.label}</span>
                    <span className="text-slate-700">{z.meters} m ({z.pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all"
                      style={{ width: `${z.pct}%`, backgroundColor: z.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Dossier */}
          {playerRisks.length > 0 && (
            <div className={`p-4 rounded-lg border border-amber-300 shadow-xs ${
              isDark ? 'bg-[#291404]/30' : 'bg-amber-50/80'
            }`}>
              <div className="flex items-center gap-2 text-amber-900 font-black text-sm mb-2 font-mono">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>OBSERVED MOVEMENT RISK SIGNALS ({playerRisks.length})</span>
              </div>

              <div className="space-y-3">
                {playerRisks.map((risk) => (
                  <div key={risk.id} className="text-xs space-y-1.5 border-t border-amber-200 pt-2 first:border-0 first:pt-0">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-950">{risk.title}</span>
                      <span className="font-mono text-[10px] uppercase font-black text-amber-900 px-2 py-0.5 rounded border border-amber-300 bg-white">
                        {risk.severity} Risk
                      </span>
                    </div>

                    <p className="text-slate-800 font-bold">{risk.contextDescription}</p>

                    <div className="p-3 rounded bg-white border border-slate-300 text-xs font-mono text-slate-900">
                      <span className="text-amber-800 block font-black">Trigger: {risk.metricTrigger}</span>
                      <span className="text-slate-700 block mt-1 font-bold">Literature: {risk.literatureCitation}</span>
                      <span className="text-emerald-800 block mt-1 font-black">Protocol: {risk.mitigationProtocol}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
