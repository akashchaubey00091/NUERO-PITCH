import React from 'react';
import {
  ArrowRight,
  BarChart3,
  Compass,
  Grid,
  Layers,
  Maximize2,
  Shield,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { MatchSummary, Player, TacticalPhaseEvent, Team } from '../../types/football';

interface TeamAnalyticsProps {
  matchSummary: MatchSummary;
  homeTeam: Team;
  awayTeam: Team;
  players: Player[];
  tacticalPhases: TacticalPhaseEvent[];
  isDark: boolean;
}

export const TeamAnalytics: React.FC<TeamAnalyticsProps> = ({
  matchSummary,
  homeTeam,
  awayTeam,
  players,
  tacticalPhases,
  isDark,
}) => {
  const homePlayers = players.filter((p) => p.teamId === 'home');
  const awayPlayers = players.filter((p) => p.teamId === 'away');

  const calcTeamLoad = (squad: Player[]) => {
    const totalDist = Number(squad.reduce((s, p) => s + p.metrics.totalDistanceKm, 0).toFixed(1));
    const hsr = squad.reduce((s, p) => s + p.metrics.hsrDistanceM, 0);
    const sprint = squad.reduce((s, p) => s + p.metrics.sprintDistanceM, 0);
    const decels = squad.reduce((s, p) => s + p.metrics.highDecelsCount, 0);
    const avgPower = Number((squad.reduce((s, p) => s + p.metrics.metabolicPowerWkg, 0) / squad.length).toFixed(1));
    return { totalDist, hsr, sprint, decels, avgPower };
  };

  const homeLoad = calcTeamLoad(homePlayers);
  const awayLoad = calcTeamLoad(awayPlayers);

  const pitchThirds = [
    { third: 'Defensive Third (0 - 35m)', homePct: 42, awayPct: 58 },
    { third: 'Middle Third (35 - 70m)', homePct: 61, awayPct: 39 },
    { third: 'Attacking Third (70 - 105m)', homePct: 66, awayPct: 34 },
  ];

  return (
    <div className="space-y-4">
      {/* Side-by-Side Team Shape & Geometry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Home Team */}
        <div className={`p-5 rounded-lg border shadow-xs ${
          isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
        }`}>
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-[#0284c7] flex items-center justify-center text-white font-black text-sm font-mono shadow-xs">
                MCI
              </div>
              <div>
                <h3 className="font-black text-xl font-['Barlow_Condensed',sans-serif] uppercase tracking-wide text-slate-950">
                  {homeTeam.name}
                </h3>
                <span className="text-xs text-slate-700 font-bold font-mono">FORMATION: {homeTeam.formation}</span>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs text-slate-700 font-bold block uppercase">POSSESSION</span>
              <span className="text-2xl font-black text-sky-700">{homeTeam.possessionPct}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono tabular-nums font-bold">
            <div className={`p-3 rounded border ${isDark ? 'bg-[#0b0c10] border-[#1a1c24]' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-600 block font-sans font-bold">TEAM LENGTH</span>
              <span className="text-lg font-black text-slate-950">{homeTeam.lengthM} meters</span>
              <span className="text-[10px] text-slate-600 block">Deepest CB to Forward</span>
            </div>

            <div className={`p-3 rounded border ${isDark ? 'bg-[#0b0c10] border-[#1a1c24]' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-600 block font-sans font-bold">TEAM WIDTH</span>
              <span className="text-lg font-black text-slate-950">{homeTeam.widthM} meters</span>
              <span className="text-[10px] text-slate-600 block">Flank to Flank spread</span>
            </div>

            <div className={`p-3 rounded border ${isDark ? 'bg-[#0b0c10] border-[#1a1c24]' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-600 block font-sans font-bold">CONVEX HULL AREA</span>
              <span className="text-lg font-black text-sky-700">{homeTeam.convexHullAreaM2} m²</span>
              <span className="text-[10px] text-slate-600 block">Pitch Footprint</span>
            </div>

            <div className={`p-3 rounded border ${isDark ? 'bg-[#0b0c10] border-[#1a1c24]' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-600 block font-sans font-bold">DEFENSIVE LINE</span>
              <span className="text-lg font-black text-emerald-700">{homeTeam.defensiveLineHeightM} m</span>
              <span className="text-[10px] text-slate-600 block">From own goal line</span>
            </div>
          </div>

          <div className="mt-3.5 pt-3.5 border-t border-slate-200 flex justify-between text-xs font-mono font-bold">
            <span className="text-slate-700">PRESSING INTENSITY (PPDA):</span>
            <span className="font-black text-emerald-700">{homeTeam.ppda} passes</span>
          </div>
        </div>

        {/* Away Team */}
        <div className={`p-5 rounded-lg border shadow-xs ${
          isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
        }`}>
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-[#dc2626] flex items-center justify-center text-white font-black text-sm font-mono shadow-xs">
                ARS
              </div>
              <div>
                <h3 className="font-black text-xl font-['Barlow_Condensed',sans-serif] uppercase tracking-wide text-slate-950">
                  {awayTeam.name}
                </h3>
                <span className="text-xs text-slate-700 font-bold font-mono">FORMATION: {awayTeam.formation}</span>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs text-slate-700 font-bold block uppercase">POSSESSION</span>
              <span className="text-2xl font-black text-red-700">{awayTeam.possessionPct}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono tabular-nums font-bold">
            <div className={`p-3 rounded border ${isDark ? 'bg-[#0b0c10] border-[#1a1c24]' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-600 block font-sans font-bold">TEAM LENGTH</span>
              <span className="text-lg font-black text-slate-950">{awayTeam.lengthM} meters</span>
              <span className="text-[10px] text-slate-600 block">Deepest CB to Forward</span>
            </div>

            <div className={`p-3 rounded border ${isDark ? 'bg-[#0b0c10] border-[#1a1c24]' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-600 block font-sans font-bold">TEAM WIDTH</span>
              <span className="text-lg font-black text-slate-950">{awayTeam.widthM} meters</span>
              <span className="text-[10px] text-slate-600 block">Flank to Flank spread</span>
            </div>

            <div className={`p-3 rounded border ${isDark ? 'bg-[#0b0c10] border-[#1a1c24]' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-600 block font-sans font-bold">CONVEX HULL AREA</span>
              <span className="text-lg font-black text-red-700">{awayTeam.convexHullAreaM2} m²</span>
              <span className="text-[10px] text-slate-600 block">Pitch Footprint</span>
            </div>

            <div className={`p-3 rounded border ${isDark ? 'bg-[#0b0c10] border-[#1a1c24]' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-600 block font-sans font-bold">DEFENSIVE LINE</span>
              <span className="text-lg font-black text-amber-700">{awayTeam.defensiveLineHeightM} m</span>
              <span className="text-[10px] text-slate-600 block">From own goal line</span>
            </div>
          </div>

          <div className="mt-3.5 pt-3.5 border-t border-slate-200 flex justify-between text-xs font-mono font-bold">
            <span className="text-slate-700">PRESSING INTENSITY (PPDA):</span>
            <span className="font-black text-amber-700">{awayTeam.ppda} passes</span>
          </div>
        </div>
      </div>

      {/* Spatial Control */}
      <div className={`p-5 rounded-lg border shadow-xs ${
        isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
      }`}>
        <h4 className="font-mono text-xs uppercase tracking-wider font-black text-slate-800 mb-3 flex items-center gap-2">
          <Grid className="w-4 h-4 text-emerald-700" />
          <span>SPATIAL PITCH DOMINANCE (FERNÁNDEZ &amp; BORNN MODEL)</span>
        </h4>

        <div className="space-y-3 font-mono font-bold">
          {pitchThirds.map((pt, idx) => (
            <div key={idx} className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-900 font-extrabold">{pt.third}</span>
                <span className="tabular-nums">
                  <span className="text-sky-700 font-black">MCI {pt.homePct}%</span> · <span className="text-red-700 font-black">ARS {pt.awayPct}%</span>
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded overflow-hidden flex">
                <div className="bg-[#0284c7] h-full" style={{ width: `${pt.homePct}%` }} />
                <div className="bg-[#dc2626] h-full" style={{ width: `${pt.awayPct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aggregate Team Physical Load */}
      <div className={`p-5 rounded-lg border shadow-xs ${
        isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
      }`}>
        <h4 className="font-mono text-xs uppercase tracking-wider font-black text-slate-800 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-700" />
          <span>AGGREGATE SQUAD MECHANICAL WORKLOAD COMPARISON</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono font-bold tabular-nums">
            <thead>
              <tr className="border-b border-slate-200 text-slate-700 font-black">
                <th className="py-2.5 px-3 font-sans">PHYSICAL METRIC</th>
                <th className="py-2.5 px-3 text-sky-800">MANCHESTER CITY (HOME)</th>
                <th className="py-2.5 px-3 text-red-800">ARSENAL (AWAY)</th>
                <th className="py-2.5 px-3 font-sans">DELTA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-950">
              <tr>
                <td className="py-2.5 px-3 font-sans font-extrabold">Total Distance Covered</td>
                <td className="py-2.5 px-3 font-black">{homeLoad.totalDist} km</td>
                <td className="py-2.5 px-3 font-black">{awayLoad.totalDist} km</td>
                <td className="py-2.5 px-3 text-emerald-700 font-black">+{Number((homeLoad.totalDist - awayLoad.totalDist).toFixed(1))} km</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-extrabold">High-Speed Running (19.8 - 25.2 km/h)</td>
                <td className="py-2.5 px-3 font-black">{homeLoad.hsr} m</td>
                <td className="py-2.5 px-3 font-black">{awayLoad.hsr} m</td>
                <td className="py-2.5 px-3 text-sky-700 font-black">+{homeLoad.hsr - awayLoad.hsr} m</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-extrabold">Sprinting Distance (&gt; 25.2 km/h)</td>
                <td className="py-2.5 px-3 font-black">{homeLoad.sprint} m</td>
                <td className="py-2.5 px-3 font-black">{awayLoad.sprint} m</td>
                <td className="py-2.5 px-3 text-red-700 font-black">{homeLoad.sprint - awayLoad.sprint} m</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-extrabold">High Decelerations (&lt; -4.0 m/s²)</td>
                <td className="py-2.5 px-3 font-black text-amber-700">{homeLoad.decels} instances</td>
                <td className="py-2.5 px-3 font-black text-amber-700">{awayLoad.decels} instances</td>
                <td className="py-2.5 px-3 text-slate-700">High Eccentric Strain</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-extrabold">Average Squad Metabolic Power</td>
                <td className="py-2.5 px-3 font-black">{homeLoad.avgPower} W/kg</td>
                <td className="py-2.5 px-3 font-black">{awayLoad.avgPower} W/kg</td>
                <td className="py-2.5 px-3 text-emerald-700 font-black">+{Number((homeLoad.avgPower - awayLoad.avgPower).toFixed(1))} W/kg</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tactical Timeline */}
      <div className={`p-5 rounded-lg border shadow-xs ${
        isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
      }`}>
        <h4 className="font-mono text-xs uppercase tracking-wider font-black text-slate-800 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-700" />
          <span>TACTICAL PHASES &amp; SPATIAL PROGRESSION</span>
        </h4>

        <div className="space-y-2.5">
          {tacticalPhases.map((phase, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded border text-xs ${
                isDark ? 'bg-[#0b0c10] border-[#1a1c24]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5 font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-black text-emerald-700 text-sm">{phase.minute}</span>
                  <span className="text-slate-950 font-black uppercase">{phase.phase}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span>MCI: <strong className="text-sky-800">{phase.homeShape}</strong></span>
                  <span>·</span>
                  <span>ARS: <strong className="text-red-800">{phase.awayShape}</strong></span>
                </div>
              </div>
              <p className="text-slate-800 font-bold leading-relaxed">{phase.tacticalInsight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
