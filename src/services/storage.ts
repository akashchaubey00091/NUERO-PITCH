/**
 * NeuroPitch Offline Persistence Service
 * Stores match analysis sessions, tactical annotations, CV tracking cache,
 * and custom domain configurations in local offline persistence.
 */

import { AppSettings, MatchSummary, RiskSignal, TrackingFrame } from '../types/football';

const SETTINGS_KEY = 'neuropitch_settings_v1';
const MATCHES_CACHE_KEY = 'neuropitch_matches_cache_v1';
const ACTIVE_MATCH_KEY = 'neuropitch_active_match_id';
const CUSTOM_SESSIONS_KEY = 'neuropitch_custom_sessions_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  offlineMode: false,
  cvConfidenceThreshold: 0.75,
  acwrSpikeThreshold: 1.45,
  highDecelThreshold: 3.0,
  domainConfig: {
    domain: 'analytics.manchestercity.pro',
    isVerified: true,
    cnameRecord: 'cname.neuropitch.cloud',
    aRecord: '76.76.21.21',
    sslActive: true,
    lastChecked: '2026-10-04T04:20:00Z',
  },
};

export class StorageService {
  public static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Failed to load settings from storage', e);
    }
    return DEFAULT_SETTINGS;
  }

  public static saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to storage', e);
    }
  }

  public static getActiveMatchId(): string | null {
    try {
      return localStorage.getItem(ACTIVE_MATCH_KEY);
    } catch {
      return null;
    }
  }

  public static setActiveMatchId(id: string): void {
    try {
      localStorage.setItem(ACTIVE_MATCH_KEY, id);
    } catch (e) {
      console.warn('Failed to set active match id', e);
    }
  }

  public static getCustomSessions(): any[] {
    try {
      const data = localStorage.getItem(CUSTOM_SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveCustomSession(session: any): void {
    try {
      const existing = this.getCustomSessions();
      const filtered = existing.filter((s: any) => s.id !== session.id);
      filtered.unshift(session);
      localStorage.setItem(CUSTOM_SESSIONS_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Failed to save custom session', e);
    }
  }

  public static exportAllData(): string {
    const bundle = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      customSessions: this.getCustomSessions(),
    };
    return JSON.stringify(bundle, null, 2);
  }

  public static importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.settings) {
        this.saveSettings(parsed.settings);
      }
      if (Array.isArray(parsed.customSessions)) {
        localStorage.setItem(CUSTOM_SESSIONS_KEY, JSON.stringify(parsed.customSessions));
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }

  public static clearAll(): void {
    try {
      localStorage.removeItem(SETTINGS_KEY);
      localStorage.removeItem(ACTIVE_MATCH_KEY);
      localStorage.removeItem(CUSTOM_SESSIONS_KEY);
    } catch (e) {
      console.warn('Failed to clear storage', e);
    }
  }
}
