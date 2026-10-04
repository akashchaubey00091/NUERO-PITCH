/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Header } from './components/layout/Header';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { VideoAnalysisStudio } from './components/video/VideoAnalysisStudio';
import { TacticalPitch } from './components/pitch/TacticalPitch';
import { PlayerAnalytics } from './components/player/PlayerAnalytics';
import { TeamAnalytics } from './components/team/TeamAnalytics';
import { RiskIntelligence } from './components/risk/RiskIntelligence';
import { MatchReports } from './components/reports/MatchReports';
import { SettingsView } from './components/settings/SettingsView';
import {
  INITIAL_PLAYERS,
  SAMPLE_MATCH_SUMMARY,
  SAMPLE_RISK_SIGNALS,
  SAMPLE_TACTICAL_PHASES,
  SAMPLE_TRACKING_FRAMES
} from './data/sampleMatchData';
import { AppSettings, MatchSummary, Player, RiskSignal, TacticalPhaseEvent, TrackingFrame } from './types/football';
import { DEFAULT_SETTINGS, StorageService } from './services/storage';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const s = StorageService.getSettings();
    return { ...s, darkMode: false };
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Match and tracking state
  const [currentMatch, setCurrentMatch] = useState<MatchSummary>(SAMPLE_MATCH_SUMMARY);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [riskSignals, setRiskSignals] = useState<RiskSignal[]>(SAMPLE_RISK_SIGNALS);
  const [tacticalPhases, setTacticalPhases] = useState<TacticalPhaseEvent[]>(SAMPLE_TACTICAL_PHASES);
  const [trackingFrames, setTrackingFrames] = useState<TrackingFrame[]>(SAMPLE_TRACKING_FRAMES);

  // Online / offline sync listener
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

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

  // Sync dark mode class on document element
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-[#0c0d10] text-[#ececed] font-bold antialiased selection:bg-[#00d26a]/20 selection:text-[#00d26a]';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-white text-slate-950 font-bold antialiased selection:bg-emerald-500/20 selection:text-emerald-900';
    }
  }, [settings.darkMode]);

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  const handleSelectPlayer = (id: string | null) => {
    setSelectedPlayerId(id);
  };

  const activeRiskCount = riskSignals.filter((r) => r.severity === 'elevated').length;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      settings.darkMode ? 'bg-[#0c0d10] text-[#ececed]' : 'bg-white text-slate-950'
    }`}>
      {/* Platform Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        currentMatch={currentMatch}
        matches={[currentMatch]}
        onSelectMatch={() => {}}
        isOnline={isOnline}
        activeRiskCount={activeRiskCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            matchSummary={currentMatch}
            players={players}
            riskSignals={riskSignals}
            tacticalPhases={tacticalPhases}
            trackingFrames={trackingFrames}
            onNavigateTab={setActiveTab}
            onSelectPlayer={handleSelectPlayer}
            isDark={settings.darkMode}
          />
        )}

        {activeTab === 'video' && (
          <VideoAnalysisStudio
            frames={trackingFrames}
            players={players}
            matchSummary={currentMatch}
            isDark={settings.darkMode}
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={handleSelectPlayer}
          />
        )}

        {activeTab === 'pitch' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black font-['Barlow_Condensed',sans-serif] uppercase tracking-wide text-slate-950">
                  TACTICAL PITCH CONTROL &amp; GEOMETRIC ENGINE
                </h2>
                <p className="text-xs text-slate-700 font-mono font-bold">
                  105m x 68m FIFA pitch projection with Gaussian kernel density estimation, Voronoi spatial pitch control, and convex hull contours.
                </p>
              </div>
            </div>

            <TacticalPitch
              frames={trackingFrames}
              players={players}
              homeTeam={currentMatch.homeTeam}
              awayTeam={currentMatch.awayTeam}
              selectedPlayerId={selectedPlayerId}
              onSelectPlayer={handleSelectPlayer}
              isDark={settings.darkMode}
            />
          </div>
        )}

        {activeTab === 'players' && (
          <PlayerAnalytics
            players={players}
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={handleSelectPlayer}
            riskSignals={riskSignals}
            homeTeam={currentMatch.homeTeam}
            awayTeam={currentMatch.awayTeam}
            isDark={settings.darkMode}
          />
        )}

        {activeTab === 'team' && (
          <TeamAnalytics
            matchSummary={currentMatch}
            homeTeam={currentMatch.homeTeam}
            awayTeam={currentMatch.awayTeam}
            players={players}
            tacticalPhases={tacticalPhases}
            isDark={settings.darkMode}
          />
        )}

        {activeTab === 'risk' && (
          <RiskIntelligence
            players={players}
            riskSignals={riskSignals}
            onSelectPlayer={(id) => {
              setSelectedPlayerId(id);
              setActiveTab('players');
            }}
            isDark={settings.darkMode}
          />
        )}

        {activeTab === 'reports' && (
          <MatchReports
            matchSummary={currentMatch}
            players={players}
            riskSignals={riskSignals}
            tacticalPhases={tacticalPhases}
            isDark={settings.darkMode}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            isDark={settings.darkMode}
            isOnline={isOnline}
          />
        )}
      </main>

      {/* Academic Standard Footer */}
      <footer className={`border-t py-4 text-xs font-mono transition-colors ${
        settings.darkMode ? 'bg-[#090a0d] border-[#1e222b] text-[#8c919b]' : 'bg-white border-slate-300 text-slate-800 font-bold'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 font-bold">
          <div className="flex items-center gap-2">
            <span className={`font-black ${settings.darkMode ? 'text-[#ececed]' : 'text-slate-950'}`}>
              NEUROPITCH INTELLIGENCE ENGINE
            </span>
            <span>·</span>
            <span>BUILD 3.8.4</span>
            <span>·</span>
            <span>ACADEMIC STANDARDS: GABBETT ACWR / OSGNACH METABOLIC POWER</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <span>TRACKING CONF: <strong className="text-emerald-700 font-black">86.4% mAP</strong></span>
            <span>·</span>
            <span>HOST: <strong className={settings.darkMode ? 'text-white' : 'text-slate-950'}>{settings.domainConfig?.domain || 'localhost'}</strong></span>
            <span>·</span>
            <span className="text-emerald-700 font-black">OFFLINE PERSISTENCE READY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
