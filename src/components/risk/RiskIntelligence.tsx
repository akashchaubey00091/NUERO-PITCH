import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowDownRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  FileCheck,
  Flame,
  Gauge,
  HelpCircle,
  Info,
  Shield,
  ShieldAlert,
  Sliders,
  TrendingDown,
  Zap
} from 'lucide-react';
import { Player, RiskSeverity, RiskSignal } from '../../types/football';

interface RiskIntelligenceProps {
  players: Player[];
  riskSignals: RiskSignal[];
  onSelectPlayer: (id: string | null) => void;
  isDark: boolean;
}

export const RiskIntelligence: React.FC<RiskIntelligenceProps> = ({
  players,
  riskSignals,
  onSelectPlayer,
  isDark,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [expandedSignalId, setExpandedSignalId] = useState<string | null>(riskSignals[0]?.id || null);

  const filteredSignals = riskSignals.filter((r) => {
    if (filterSeverity === 'all') return true;
    return r.severity === filterSeverity;
  });

  const underloaded = players.filter((p) => p.metrics.acwr < 0.85);
  const optimal = players.filter((p) => p.metrics.acwr >= 0.85 && p.metrics.acwr <= 1.30);
  const moderate = players.filter((p) => p.metrics.acwr > 1.30 && p.metrics.acwr <= 1.45);
  const spike = players.filter((p) => p.metrics.acwr > 1.45);

  const getSeverityBadgeClass = (severity: RiskSeverity) => {
    switch (severity) {
      case 'elevated':
        return isDark
          ? 'bg-[#451a03]/60 text-[#f59e0b] border-[#78350f]'
          : 'bg-amber-100 text-amber-950 border-amber-300 font-black';
      case 'medium':
        return isDark
          ? 'bg-[#3b2d07]/60 text-[#fbbf24] border-[#713f12]'
          : 'bg-yellow-100 text-yellow-950 border-yellow-300 font-black';
      case 'low':
      default:
        return isDark
          ? 'bg-[#181a22] text-[#9ca3af] border-[#2b3140]'
          : 'bg-slate-100 text-slate-900 border-slate-300 font-black';
    }
  };

  return (
    <div className="space-y-4">
      {/* Responsible Academic Scope */}
      <div className={`p-4 rounded-lg border shadow-xs flex items-start gap-3 text-xs ${
        isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
      }`}>
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-black text-slate-950 mb-1 font-mono text-xs uppercase">
            SPORTS SCIENCE OBSERVATIONAL FRAMEWORK &amp; WORKLOAD SCREENING
          </h4>
          <p className="text-slate-700 font-bold leading-relaxed">
            NeuroPitch risk intelligence provides algorithmic kinematic and workload screening based on peer-reviewed sports science models (Gabbett ACWR, Harper eccentric deceleration strain, Bishop asymmetry index). They quantify observable workload exposures to assist performance directors in managing periodization. These indicators do not constitute medical diagnoses and do not predict definitive clinical outcomes.
          </p>
        </div>
      </div>

      {/* ACWR Squad Cohort Distribution */}
      <div className={`p-5 rounded-lg border shadow-xs ${
        isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
      }`}>
        <div className="flex items-center justify-between mb-3 font-mono">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-700" />
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-800">
              ACWR (ACUTE-TO-CHRONIC WORKLOAD RATIO) SQUAD DISTRIBUTION
            </h3>
          </div>
          <span className="text-xs text-slate-700 font-bold">{players.length} ATHLETES EVALUATED</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono tabular-nums font-bold">
          <div className={`p-3.5 rounded border ${
            isDark ? 'bg-[#0b0c10] border-[#1a1c24]' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] text-slate-600 block font-sans font-bold">UNDERPREPARED (&lt; 0.85)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-sky-700">{underloaded.length} Players</span>
              <span className="text-[10px] text-slate-600 font-sans font-bold">Low Stimulus</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-700 truncate font-bold">
              {underloaded.map((p) => `#${p.number} ${p.name.split(' ').pop()}`).join(', ') || 'None'}
            </div>
          </div>

          <div className={`p-3.5 rounded border ${
            isDark ? 'bg-[#0b0c10] border-[#1a1c24]' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] text-slate-600 block font-sans font-bold">OPTIMAL SWEET SPOT (0.85 - 1.30)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-emerald-700">{optimal.length} Players</span>
              <span className="text-[10px] text-emerald-800 font-sans font-bold">Conditioned</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-700 truncate font-bold">
              {optimal.slice(0, 3).map((p) => `#${p.number} ${p.name.split(' ').pop()}`).join(', ')}...
            </div>
          </div>

          <div className={`p-3.5 rounded border ${
            isDark ? 'bg-[#0b0c10] border-[#1a1c24]' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] text-slate-600 block font-sans font-bold">MODERATE WORKLOAD (1.30 - 1.45)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-amber-700">{moderate.length} Players</span>
              <span className="text-[10px] text-amber-800 font-sans font-bold">Elevated</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-700 truncate font-bold">
              {moderate.map((p) => `#${p.number} ${p.name.split(' ').pop()}`).join(', ')}
            </div>
          </div>

          <div className={`p-3.5 rounded border border-amber-300 ${
            isDark ? 'bg-[#291404]/30' : 'bg-amber-50/90'
          }`}>
            <span className="text-[10px] text-amber-900 block font-sans font-black">ACUTE WORKLOAD SPIKE (&gt; 1.45)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-amber-800">{spike.length} Players</span>
              <span className="text-[10px] text-amber-900 font-sans font-black">Priority</span>
            </div>
            <div className="mt-2 text-[10px] text-amber-950 font-black truncate">
              {spike.map((p) => `#${p.number} ${p.name.split(' ').pop()}`).join(', ')}
            </div>
          </div>
        </div>
      </div>

      {/* Signals List */}
      <div className={`p-3.5 rounded-lg border shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs ${
        isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
      }`}>
        <div className="flex items-center gap-2 font-mono">
          <ShieldAlert className="w-4 h-4 text-amber-700" />
          <span className="font-black text-slate-900">ACTIVE SIGNALS ({filteredSignals.length})</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
          <span className="text-slate-700">SEVERITY:</span>
          {(['all', 'elevated', 'medium', 'low'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded capitalize font-black transition-colors cursor-pointer ${
                filterSeverity === sev
                  ? isDark
                    ? 'bg-[#252a37] text-white border border-[#3b4255]'
                    : 'bg-slate-900 text-white shadow-xs'
                  : isDark ? 'text-[#8c919b] hover:text-white' : 'text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
            >
              {sev === 'all' ? 'ALL' : sev.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Signal Cards */}
      <div className="space-y-3">
        {filteredSignals.map((signal) => {
          const isExpanded = expandedSignalId === signal.id;
          const isHome = signal.teamId === 'home';

          return (
            <div
              key={signal.id}
              className={`rounded-lg border shadow-xs transition-all ${
                isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
              }`}
            >
              <div
                onClick={() => setExpandedSignalId(isExpanded ? null : signal.id)}
                className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-md flex items-center justify-center font-black text-white text-xs font-mono shadow-xs ${
                    isHome ? 'bg-[#0284c7]' : 'bg-[#dc2626]'
                  }`}>
                    {signal.playerNumber}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-slate-950">{signal.playerName}</span>
                      <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded border ${getSeverityBadgeClass(signal.severity)}`}>
                        {signal.severity} Risk Indicator
                      </span>
                    </div>
                    <span className="text-xs text-slate-700 font-bold block mt-0.5">{signal.title}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlayer(signal.playerId);
                    }}
                    className={`text-xs px-3 py-1.5 rounded border font-mono font-bold transition-colors cursor-pointer ${
                      isDark
                        ? 'border-[#2b3140] bg-[#161922] hover:bg-[#1f2430] text-[#d1d5db]'
                        : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900 shadow-xs'
                    }`}
                  >
                    View Player Profile
                  </button>

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-700" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-700" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-200 space-y-3.5 text-xs">
                  <div>
                    <span className="text-xs font-mono font-black text-slate-700 block uppercase mb-1">
                      Context &amp; Match Occurrence
                    </span>
                    <p className="text-slate-800 font-bold leading-relaxed">{signal.contextDescription}</p>
                  </div>

                  <div className={`p-3.5 rounded border font-mono ${
                    isDark ? 'bg-[#0b0c10] border-[#1e232d]' : 'bg-slate-50 border-slate-300'
                  }`}>
                    <div className="text-xs text-amber-800 font-black mb-1">
                      Quantitative Metric Trigger:
                    </div>
                    <div className="text-slate-950 font-bold">{signal.metricTrigger}</div>
                  </div>

                  <div className={`p-3.5 rounded border ${
                    isDark ? 'bg-[#0b0c10] border-[#1e232d]' : 'bg-slate-50 border-slate-300'
                  }`}>
                    <div className="flex items-center gap-1.5 text-slate-700 font-black text-xs font-mono uppercase mb-1">
                      <BookOpen className="w-4 h-4 text-sky-700" />
                      <span>Academic Literature Reference</span>
                    </div>
                    <p className="text-slate-800 font-bold leading-relaxed">{signal.scientificRationale}</p>
                    <div className="text-xs font-mono text-sky-800 mt-2 font-black">
                      Citation: {signal.literatureCitation}
                    </div>
                  </div>

                  <div className={`p-3.5 rounded border border-emerald-300 ${
                    isDark ? 'bg-[#064e3b]/20' : 'bg-emerald-50/90'
                  }`}>
                    <div className="flex items-center gap-1.5 text-emerald-800 font-black text-xs font-mono uppercase mb-1">
                      <FileCheck className="w-4 h-4 text-emerald-700" />
                      <span>Actionable Mitigation Protocol</span>
                    </div>
                    <p className="text-slate-950 font-bold leading-relaxed">{signal.mitigationProtocol}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
