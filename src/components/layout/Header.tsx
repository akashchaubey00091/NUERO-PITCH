import React, { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  Compass,
  FileText,
  Globe,
  HardDrive,
  Layers,
  Maximize2,
  Minimize2,
  Moon,
  ShieldAlert,
  Sun,
  Users,
  Video,
  Wifi,
  WifiOff
} from 'lucide-react';
import { AppSettings, MatchSummary } from '../../types/football';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  currentMatch: MatchSummary;
  matches: MatchSummary[];
  onSelectMatch: (matchId: string) => void;
  isOnline: boolean;
  activeRiskCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  settings,
  onUpdateSettings,
  currentMatch,
  matches,
  onSelectMatch,
  isOnline,
  activeRiskCount,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle encountered restriction:', err);
      setIsFullscreen((prev) => !prev);
    }
  };

  const toggleDarkMode = () => {
    const updated = { ...settings, darkMode: !settings.darkMode };
    onUpdateSettings(updated);
  };

  const navItems = [
    { id: 'dashboard', label: 'Match Overview', icon: BarChart3 },
    { id: 'video', label: 'Video Analysis', icon: Video },
    { id: 'pitch', label: 'Tactical Pitch', icon: Compass },
    { id: 'players', label: 'Player Analytics', icon: Users },
    { id: 'team', label: 'Team Analytics', icon: Layers },
    { id: 'risk', label: 'Risk Intelligence', icon: ShieldAlert, badge: activeRiskCount },
    { id: 'reports', label: 'Match Report & AI', icon: FileText },
    { id: 'settings', label: 'Settings & Domain', icon: Globe },
  ];

  const isDark = settings.darkMode;

  return (
    <header className={`border-b transition-colors sticky top-0 z-40 ${
      isDark
        ? 'bg-[#0e1014] border-[#1e232d] text-[#ececed]'
        : 'bg-white border-slate-300 text-slate-950 shadow-xs'
    }`}>
      {/* Top Telemetry & Scoreboard Strip */}
      <div className={`px-4 sm:px-6 lg:px-8 border-b py-2 text-xs flex flex-wrap items-center justify-between gap-3 ${
        isDark ? 'border-[#171920] bg-[#090a0d]' : 'border-slate-300 bg-slate-50'
      }`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <span className="w-3.5 h-3.5 rounded-xs bg-[#059669] inline-block shadow-xs" />
            <span className={`font-['Barlow_Condensed',sans-serif] tracking-wider text-xl font-black uppercase ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}>
              NEUROPITCH
            </span>
            <span className={`font-mono text-[10px] font-black border px-2 py-0.5 rounded ${
              isDark ? 'text-[#8c919b] border-[#262933]' : 'text-slate-900 bg-white border-slate-300'
            }`}>
              STRUCTURED TRACKING ENGINE v3.8
            </span>
          </div>

          <div className={`hidden md:flex items-center gap-2 font-mono text-xs font-black border-l pl-3 ${
            isDark ? 'text-[#8c919b] border-[#262933]' : 'text-slate-800 border-slate-300'
          }`}>
            <span>FIXTURE: UCL QF</span>
            <span>·</span>
            <span>ETIHAD STADIUM</span>
            <span>·</span>
            <span>105M X 68M</span>
          </div>
        </div>

        {/* Live Match Clock and Score Ticker */}
        <div className="flex items-center gap-3 font-mono text-xs font-bold">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded border font-black ${
            isDark ? 'bg-[#14161d] border-[#222631]' : 'bg-white border-slate-300 text-slate-950 shadow-xs'
          }`}>
            <span className="text-emerald-700 font-black">FT 94:00</span>
            <span className="text-slate-400">|</span>
            <span className="text-sky-700 font-black">MCI {currentMatch.score.home}</span>
            <span className="text-slate-400">-</span>
            <span className="text-red-700 font-black">{currentMatch.score.away} ARS</span>
          </div>

          {/* Custom Domain Tag */}
          {settings.domainConfig?.domain && (
            <div
              onClick={() => setActiveTab('settings')}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded border font-black cursor-pointer ${
                isDark
                  ? 'bg-[#14161d] border-[#222631] text-[#9ca3af] hover:text-white'
                  : 'bg-white border-slate-300 text-slate-900 hover:text-black shadow-xs'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span className="text-xs">{settings.domainConfig.domain}</span>
            </div>
          )}

          {/* Sync Status */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded border font-black ${
            isDark ? 'bg-[#14161d] border-[#222631]' : 'bg-white border-slate-300 shadow-xs'
          }`}>
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-xs text-emerald-800 font-black hidden sm:inline">LIVE SYNC</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                <span className="text-xs text-amber-800 font-black hidden sm:inline">LOCAL DB</span>
              </>
            )}
          </div>

          {/* Dark / White Mode Switcher */}
          <button
            onClick={toggleDarkMode}
            title={isDark ? 'Switch to White Theme' : 'Switch to Dark Theme'}
            className={`p-2 rounded border transition-colors cursor-pointer font-black ${
              isDark
                ? 'bg-[#14161d] border-[#222631] text-[#9ca3af] hover:text-white'
                : 'bg-white border-slate-300 text-slate-900 hover:text-black hover:bg-slate-100 shadow-xs'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-900" />}
          </button>

          {/* Full Screen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
            className={`p-2 rounded border transition-colors cursor-pointer font-black flex items-center gap-1.5 ${
              isDark
                ? 'bg-[#14161d] border-[#222631] text-[#9ca3af] hover:text-white'
                : 'bg-white border-slate-300 text-slate-900 hover:text-black hover:bg-slate-100 shadow-xs'
            }`}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-emerald-700" />
                <span className="text-[11px] font-mono font-black hidden md:inline">EXIT FULLSCREEN</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-slate-900" />
                <span className="text-[11px] font-mono font-black hidden md:inline">FULLSCREEN</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-2 overflow-x-auto scrollbar-none py-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'border-[#00d26a] text-[#00d26a] bg-[#14171f]'
                      : 'border-slate-950 text-slate-950 bg-slate-100 font-black shadow-2xs'
                    : isDark
                    ? 'border-transparent text-[#9da3af] hover:text-white hover:bg-[#13151b]'
                    : 'border-transparent text-slate-800 hover:text-slate-950 hover:bg-slate-100 font-extrabold'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? (isDark ? 'text-[#00d26a]' : 'text-slate-950') : (isDark ? 'text-slate-400' : 'text-slate-700')}`} />
                <span className="font-black">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                    isDark ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-amber-100 text-amber-950 border border-amber-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
