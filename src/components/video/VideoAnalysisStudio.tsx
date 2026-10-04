import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Download,
  Eye,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Upload,
  Video as VideoIcon,
  Zap
} from 'lucide-react';
import { MatchSummary, Player, TrackingFrame } from '../../types/football';
import { projectPitchToCamera } from '../../services/tacticalMath';

interface VideoAnalysisStudioProps {
  frames: TrackingFrame[];
  players: Player[];
  matchSummary: MatchSummary;
  isDark: boolean;
  selectedPlayerId: string | null;
  onSelectPlayer: (id: string | null) => void;
}

export const VideoAnalysisStudio: React.FC<VideoAnalysisStudioProps> = ({
  frames,
  players,
  matchSummary,
  isDark,
  selectedPlayerId,
  onSelectPlayer,
}) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showPlayerTags, setShowPlayerTags] = useState(true);
  const [showSpeedRadar, setShowSpeedRadar] = useState(true);
  const [showTrajectories, setShowTrajectories] = useState(true);
  const [showHomographyGrid, setShowHomographyGrid] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activeFrame = frames[currentFrameIndex] || frames[0];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => {
        if (prev >= frames.length - 1) return 0;
        return prev + 1;
      });
    }, 100 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, frames.length]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingUpload(true);
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            const url = URL.createObjectURL(file);
            setUploadedVideoUrl(url);
            setIsProcessingUpload(false);
            setUploadProgress(100);
          }, 350);
          return 95;
        }
        return prev + 20;
      });
    }, 200);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    if (!uploadedVideoUrl) {
      // Stadium broadcast background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.35);
      skyGrad.addColorStop(0, isDark ? '#05070a' : '#1e293b');
      skyGrad.addColorStop(1, isDark ? '#0b1017' : '#334155');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height * 0.35);

      // Stands
      ctx.fillStyle = isDark ? '#0d131d' : '#475569';
      ctx.fillRect(0, height * 0.2, width, height * 0.15);

      // LED Ribbon
      ctx.fillStyle = isDark ? '#0284c7' : '#0369a1';
      ctx.fillRect(0, height * 0.33, width, 14);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px "Barlow Condensed", sans-serif';
      ctx.textAlign = 'center';
      for (let i = 0; i < 6; i++) {
        ctx.fillText('NEUROPITCH OPTICAL TRACKING · UEFA CHAMPIONS LEAGUE', (width / 6) * i + width / 12, height * 0.33 + 10);
      }

      // Pitch Grass
      const pitchGrad = ctx.createLinearGradient(0, height * 0.35, 0, height);
      pitchGrad.addColorStop(0, isDark ? '#092116' : '#15803d');
      pitchGrad.addColorStop(1, isDark ? '#06170f' : '#166534');
      ctx.fillStyle = pitchGrad;

      ctx.beginPath();
      ctx.moveTo(width * 0.08, height * 0.35);
      ctx.lineTo(width * 0.92, height * 0.35);
      ctx.lineTo(width * 0.98, height * 0.98);
      ctx.lineTo(width * 0.02, height * 0.98);
      ctx.closePath();
      ctx.fill();

      // Perspective mowing lines
      const stripes = 10;
      for (let s = 0; s < stripes; s++) {
        if (s % 2 === 0) {
          const t0 = s / stripes;
          const t1 = (s + 1) / stripes;

          const topX0 = width * 0.08 + t0 * (width * 0.84);
          const topX1 = width * 0.08 + t1 * (width * 0.84);
          const botX0 = width * 0.02 + t0 * (width * 0.96);
          const botX1 = width * 0.02 + t1 * (width * 0.96);

          ctx.beginPath();
          ctx.moveTo(topX0, height * 0.35);
          ctx.lineTo(topX1, height * 0.35);
          ctx.lineTo(botX1, height * 0.98);
          ctx.lineTo(botX0, height * 0.98);
          ctx.closePath();
          ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.025)' : 'rgba(255, 255, 255, 0.06)';
          ctx.fill();
        }
      }

      // Markings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.4;

      ctx.beginPath();
      ctx.moveTo(width * 0.08, height * 0.35);
      ctx.lineTo(width * 0.92, height * 0.35);
      ctx.lineTo(width * 0.98, height * 0.98);
      ctx.lineTo(width * 0.02, height * 0.98);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width * 0.5, height * 0.35);
      ctx.lineTo(width * 0.5, height * 0.98);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(width * 0.5, height * 0.66, width * 0.12, height * 0.09, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (!activeFrame) return;

    // Homography Grid
    if (showHomographyGrid) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      for (let i = 1; i < 5; i++) {
        const y = height * (0.35 + i * 0.12);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      const corners = [
        { label: 'C1: (0, 0)', x: width * 0.08, y: height * 0.35 },
        { label: 'C2: (105, 0)', x: width * 0.92, y: height * 0.35 },
        { label: 'C3: (105, 68)', x: width * 0.98, y: height * 0.98 },
        { label: 'C4: (0, 68)', x: width * 0.02, y: height * 0.98 },
      ];

      corners.forEach((c) => {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(c.label, c.x + 6, c.y - 4);
      });
    }

    // Trajectory Trails
    if (showTrajectories && currentFrameIndex > 0) {
      const trailLength = Math.min(12, currentFrameIndex);
      const startF = currentFrameIndex - trailLength;

      activeFrame.players.forEach((currP) => {
        if (selectedPlayerId && currP.id !== selectedPlayerId) return;

        ctx.beginPath();
        let started = false;
        for (let f = startF; f <= currentFrameIndex; f++) {
          const pastP = frames[f]?.players.find((p) => p.id === currP.id);
          if (pastP) {
            const proj = projectPitchToCamera(pastP.x, pastP.y);
            const px = proj.u * width;
            const py = proj.v * height;
            if (!started) {
              ctx.moveTo(px, py);
              started = true;
            } else {
              ctx.lineTo(px, py);
            }
          }
        }
        ctx.strokeStyle = currP.teamId === 'home'
          ? 'rgba(56, 189, 248, 0.45)'
          : 'rgba(239, 68, 68, 0.45)';
        ctx.lineWidth = 1.6;
        ctx.stroke();
      });
    }

    // Tracked Players & Bounding Boxes
    activeFrame.players.forEach((p) => {
      const proj = projectPitchToCamera(p.x, p.y);
      const px = proj.u * width;
      const py = proj.v * height;
      const scale = proj.scale;

      const isHome = p.teamId === 'home';
      const isSelected = selectedPlayerId === p.id;

      const boxW = 28 * scale;
      const boxH = 56 * scale;
      const boxX = px - boxW / 2;
      const boxY = py - boxH;

      ctx.save();

      // Shadow at feet
      ctx.beginPath();
      ctx.ellipse(px, py, 9 * scale, 4 * scale, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fill();

      // Player body
      ctx.fillStyle = isHome ? '#0284c7' : '#dc2626';
      ctx.fillRect(px - 5 * scale, py - 38 * scale, 10 * scale, 22 * scale);
      ctx.beginPath();
      ctx.arc(px, py - 43 * scale, 5 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#fde047';
      ctx.fill();

      // Bounding Box
      if (showBoundingBoxes) {
        ctx.strokeStyle = isSelected
          ? '#00d26a'
          : isHome
          ? '#38bdf8'
          : '#ef4444';
        ctx.lineWidth = isSelected ? 2 : 1.2;

        const cornerSize = 6 * scale;
        ctx.beginPath();
        ctx.moveTo(boxX, boxY + cornerSize);
        ctx.lineTo(boxX, boxY);
        ctx.lineTo(boxX + cornerSize, boxY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(boxX + boxW - cornerSize, boxY);
        ctx.lineTo(boxX + boxW, boxY);
        ctx.lineTo(boxX + boxW, boxY + cornerSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(boxX, boxY + boxH - cornerSize);
        ctx.lineTo(boxX, boxY + boxH);
        ctx.lineTo(boxX + cornerSize, boxY + boxH);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(boxX + boxW - cornerSize, boxY + boxH);
        ctx.lineTo(boxX + boxW, boxY + boxH);
        ctx.lineTo(boxX + boxW, boxY + boxH - cornerSize);
        ctx.stroke();

        ctx.fillStyle = isHome ? 'rgba(2, 132, 199, 0.08)' : 'rgba(220, 38, 38, 0.08)';
        ctx.fillRect(boxX, boxY, boxW, boxH);
      }

      // ID Tag
      if (showPlayerTags) {
        const tagText = `${isHome ? 'MCI' : 'ARS'} #${p.number} · ${Math.round(p.confidence * 100)}%`;
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        const tagWidth = ctx.measureText(tagText).width + 8;
        const tagHeight = 14;

        ctx.fillStyle = isHome ? '#0284c7' : '#dc2626';
        ctx.fillRect(boxX, boxY - tagHeight - 2, tagWidth, tagHeight);

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(tagText, boxX + 4, boxY - tagHeight / 2 - 2);
      }

      // Speed Tag
      if (showSpeedRadar && p.speed > 5) {
        const speedText = `${p.speed} km/h`;
        ctx.font = 'bold 8px "JetBrains Mono", monospace';
        const speedW = ctx.measureText(speedText).width + 6;

        ctx.fillStyle = '#0b0c10';
        ctx.fillRect(boxX, boxY + boxH + 2, speedW, 12);

        ctx.fillStyle = '#00d26a';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(speedText, boxX + 3, boxY + boxH + 8);
      }

      ctx.restore();
    });

    // Ball
    if (activeFrame.ball) {
      const proj = projectPitchToCamera(activeFrame.ball.x, activeFrame.ball.y);
      const bx = proj.u * width;
      const by = proj.v * height;
      const bz = activeFrame.ball.z;
      const scale = proj.scale;

      ctx.beginPath();
      ctx.ellipse(bx, by, 5 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(bx, by - bz * 18 * scale, 4.5 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();

      if (showBoundingBoxes) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx - 7 * scale, by - bz * 18 * scale - 7 * scale, 14 * scale, 14 * scale);
        ctx.fillStyle = '#f59e0b';
        ctx.font = '7px "JetBrains Mono", monospace';
        ctx.fillText('BALL 94%', bx - 6 * scale, by - bz * 18 * scale - 9 * scale);
      }
    }

    // Minimap
    if (showMinimap) {
      const mapW = 150;
      const mapH = (mapW * 68) / 105;
      const mapX = width - mapW - 14;
      const mapY = height - mapH - 14;

      ctx.save();
      ctx.fillStyle = isDark ? '#090a0d' : '#ffffff';
      ctx.fillRect(mapX, mapY, mapW, mapH);
      ctx.strokeStyle = isDark ? '#262933' : '#d1d5db';
      ctx.lineWidth = 1;
      ctx.strokeRect(mapX, mapY, mapW, mapH);

      ctx.beginPath();
      ctx.moveTo(mapX + mapW / 2, mapY);
      ctx.lineTo(mapX + mapW / 2, mapY + mapH);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(mapX + mapW / 2, mapY + mapH / 2, (9.15 / 105) * mapW, 0, Math.PI * 2);
      ctx.stroke();

      activeFrame.players.forEach((p) => {
        const mx = mapX + (p.x / 105) * mapW;
        const my = mapY + (p.y / 68) * mapH;
        ctx.beginPath();
        ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.teamId === 'home' ? '#0284c7' : '#dc2626';
        ctx.fill();
      });

      if (activeFrame.ball) {
        const mbx = mapX + (activeFrame.ball.x / 105) * mapW;
        const mby = mapY + (activeFrame.ball.y / 68) * mapH;
        ctx.beginPath();
        ctx.arc(mbx, mby, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      ctx.restore();
    }
  }, [
    activeFrame,
    currentFrameIndex,
    frames,
    isDark,
    selectedPlayerId,
    showBoundingBoxes,
    showHomographyGrid,
    showMinimap,
    showPlayerTags,
    showSpeedRadar,
    showTrajectories,
    uploadedVideoUrl,
  ]);

  return (
    <div className="space-y-4">
      {/* Telemetry Bar */}
      <div className={`p-4 rounded-lg border shadow-xs grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono font-bold tabular-nums ${
        isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
      }`}>
        <div>
          <span className="block text-[11px] font-mono text-slate-700 font-bold uppercase">TRACKING ACCURACY</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-black text-emerald-700">
              {(matchSummary.meanTrackingConfidence * 100).toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-600 font-bold">mAP</span>
          </div>
        </div>

        <div>
          <span className="block text-[11px] font-mono text-slate-700 font-bold uppercase">ACTIVE DETECTIONS</span>
          <span className={`text-xl font-black block mt-1 ${isDark ? 'text-white' : 'text-slate-950'}`}>
            {matchSummary.totalPlayersDetected} Players + Ball
          </span>
        </div>

        <div>
          <span className="block text-[11px] font-mono text-slate-700 font-bold uppercase">REPROJECTION ERROR</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-black text-slate-950">
              {matchSummary.homographyReprojectionErrorM}m
            </span>
            <span className="text-[10px] text-slate-600 font-bold">RMS</span>
          </div>
        </div>

        <div>
          <span className="block text-[11px] font-mono text-slate-700 font-bold uppercase">INFERENCE ENGINE</span>
          <span className="text-xl font-black text-sky-700 block mt-1">
            YOLOv8 + ByteTrack
          </span>
        </div>

        <div>
          <span className="block text-[11px] font-mono text-slate-700 font-bold uppercase">PROCESSING TIMING</span>
          <span className="text-xl font-black text-slate-950 block mt-1">
            30 FPS · 33ms
          </span>
        </div>
      </div>

      {/* Main Video Viewport & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-3">
          <div className={`relative rounded-lg border overflow-hidden ${
            isDark ? 'border-[#1e232d] bg-[#090b0e]' : 'border-slate-300 bg-black shadow-xs'
          }`}>
            <canvas ref={canvasRef} className="w-full aspect-[16/9] block" />

            {uploadedVideoUrl && (
              <video ref={videoRef} src={uploadedVideoUrl} className="hidden" muted playsInline />
            )}

            {isProcessingUpload && (
              <div className="absolute inset-0 bg-[#090b0e]/90 flex flex-col items-center justify-center text-center p-6 z-20">
                <Camera className="w-8 h-8 text-[#00d26a] animate-pulse mb-3" />
                <h4 className="font-bold text-white text-base mb-1 font-mono uppercase">
                  Processing Match Clip
                </h4>
                <p className="text-xs text-[#8c919b] max-w-sm mb-3 font-bold">
                  Running homography calibration and DeepSORT tracking associations...
                </p>
                <div className="w-64 bg-[#1e232d] h-2 rounded overflow-hidden mb-2">
                  <div className="bg-[#00d26a] h-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className="text-xs font-mono text-[#00d26a] font-bold">{uploadProgress}% complete</span>
              </div>
            )}

            <div className="absolute top-2.5 left-2.5 flex items-center gap-2 text-xs font-mono font-bold bg-[#0c0e12]/90 border border-[#222733] px-3 py-1.5 rounded text-[#ececed] pointer-events-none">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping" />
              <span>LIVE CV TRACKING</span>
              <span className="text-[#555a64]">|</span>
              <span>FRAME {currentFrameIndex + 1}/{frames.length}</span>
              <span className="text-[#555a64]">|</span>
              <span>{activeFrame?.tacticalPhase}</span>
            </div>

            <div className="absolute bottom-2 inset-x-3 bg-[#0c0e12]/90 border border-[#222733] px-3 py-1.5 rounded flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-300 font-bold">00:00.0</span>
              <input
                type="range"
                min={0}
                max={frames.length - 1}
                value={currentFrameIndex}
                onChange={(e) => setCurrentFrameIndex(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-[#252a37] rounded appearance-none"
              />
              <span className="text-[10px] font-mono text-white font-bold">
                {activeFrame ? `00:${activeFrame.timestampSeconds.toFixed(1).padStart(4, '0')}` : '00:30.0'}
              </span>
            </div>
          </div>

          <div className={`p-3 rounded-lg border shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs ${
            isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
          }`}>
            <div className="flex items-center gap-1.5 font-mono font-bold">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase rounded text-xs transition-colors cursor-pointer shadow-xs"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play Analysis'}</span>
              </button>

              <button
                onClick={() => setCurrentFrameIndex((prev) => Math.max(0, prev - 1))}
                className={`p-2 rounded border cursor-pointer font-bold ${
                  isDark ? 'border-[#242833] text-[#9ca3af] hover:bg-[#1a1d27]' : 'border-slate-300 text-slate-800 hover:bg-slate-100 shadow-xs'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentFrameIndex((prev) => Math.min(frames.length - 1, prev + 1))}
                className={`p-2 rounded border cursor-pointer font-bold ${
                  isDark ? 'border-[#242833] text-[#9ca3af] hover:bg-[#1a1d27]' : 'border-slate-300 text-slate-800 hover:bg-slate-100 shadow-xs'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setCurrentFrameIndex(0);
                  setIsPlaying(false);
                }}
                className={`p-2 rounded border cursor-pointer font-bold ${
                  isDark ? 'border-[#242833] text-[#6b7280] hover:bg-[#1a1d27]' : 'border-slate-300 text-slate-800 hover:bg-slate-100 shadow-xs'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 ml-1.5 font-bold">
                {[0.5, 1, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-1 rounded text-xs font-mono font-bold cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-slate-900 text-white shadow-xs'
                        : isDark ? 'text-[#8c919b] hover:text-white' : 'text-slate-700 hover:text-black hover:bg-slate-100'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-1.5 px-3.5 py-2 rounded border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900 font-black cursor-pointer font-mono text-xs transition-colors shadow-xs">
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>UPLOAD MATCH CLIP (MP4/WEBM)</span>
              <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Sidebar Overlays & Detection Feed */}
        <div className="space-y-4 font-bold">
          <div className={`p-4 rounded-lg border shadow-xs text-xs ${
            isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
          }`}>
            <h4 className="font-mono text-xs uppercase tracking-wider font-black text-slate-800 mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-700" />
              <span>TRACKING OVERLAYS</span>
            </h4>

            <div className="space-y-2.5 font-mono text-xs font-bold text-slate-800">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Bounding Boxes</span>
                <input
                  type="checkbox"
                  checked={showBoundingBoxes}
                  onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                  className="rounded accent-emerald-600 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Player Tags</span>
                <input
                  type="checkbox"
                  checked={showPlayerTags}
                  onChange={(e) => setShowPlayerTags(e.target.checked)}
                  className="rounded accent-emerald-600 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Speed Radar (km/h)</span>
                <input
                  type="checkbox"
                  checked={showSpeedRadar}
                  onChange={(e) => setShowSpeedRadar(e.target.checked)}
                  className="rounded accent-emerald-600 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Movement Trails</span>
                <input
                  type="checkbox"
                  checked={showTrajectories}
                  onChange={(e) => setShowTrajectories(e.target.checked)}
                  className="rounded accent-emerald-600 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Homography Matrix</span>
                <input
                  type="checkbox"
                  checked={showHomographyGrid}
                  onChange={(e) => setShowHomographyGrid(e.target.checked)}
                  className="rounded accent-emerald-600 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Pitch Minimap</span>
                <input
                  type="checkbox"
                  checked={showMinimap}
                  onChange={(e) => setShowMinimap(e.target.checked)}
                  className="rounded accent-emerald-600 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Detections List */}
          <div className={`p-4 rounded-lg border shadow-xs text-xs max-h-[380px] flex flex-col ${
            isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-mono text-xs uppercase tracking-wider font-black text-slate-800">
                FRAME DETECTIONS
              </h4>
              <span className="text-[10px] font-mono text-slate-600 font-bold">
                {activeFrame?.players.length || 0} TRACKS
              </span>
            </div>

            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1 font-bold">
              {activeFrame?.players.map((p) => {
                const isSelected = selectedPlayerId === p.id;
                const isHome = p.teamId === 'home';
                const playerMeta = players.find((pl) => pl.id === p.id);

                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectPlayer(isSelected ? null : p.id)}
                    className={`p-2.5 rounded border cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50'
                        : isDark
                        ? 'border-[#1a1c24] hover:border-[#2c3140] bg-[#0b0c10]'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded flex items-center justify-center font-black text-white text-[10px] font-mono ${
                        isHome ? 'bg-[#0284c7]' : 'bg-[#dc2626]'
                      }`}>
                        {p.number}
                      </span>
                      <div>
                        <span className="font-black block text-xs text-slate-950">
                          {playerMeta ? playerMeta.name : `Player #${p.number}`}
                        </span>
                        <span className="text-[10px] text-slate-600 font-bold font-mono">
                          X:{p.x}m Y:{p.y}m
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <span className="text-emerald-700 font-black block">{p.speed} km/h</span>
                      <span className="text-[10px] text-slate-600 font-bold">
                        {Math.round(p.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
