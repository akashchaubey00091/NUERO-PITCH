import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  FastForward,
  Grid,
  Layers,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Zap
} from 'lucide-react';
import { Player, Team, TrackingFrame } from '../../types/football';
import {
  computeCentroid,
  computeConvexHull,
  computePitchControlGrid,
  computePolygonArea,
  computeTeamDimensions,
  Point2D
} from '../../services/tacticalMath';

interface TacticalPitchProps {
  frames: TrackingFrame[];
  players: Player[];
  homeTeam: Team;
  awayTeam: Team;
  selectedPlayerId: string | null;
  onSelectPlayer: (id: string | null) => void;
  isDark: boolean;
}

export const TacticalPitch: React.FC<TacticalPitchProps> = ({
  frames,
  players,
  homeTeam,
  awayTeam,
  selectedPlayerId,
  onSelectPlayer,
  isDark,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pitchContainerRef = useRef<HTMLDivElement | null>(null);

  // Fullscreen state
  const [isPitchFullscreen, setIsPitchFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsPitchFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const togglePitchFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (pitchContainerRef.current?.requestFullscreen) {
          await pitchContainerRef.current.requestFullscreen();
        } else if ((pitchContainerRef.current as any)?.webkitRequestFullscreen) {
          await (pitchContainerRef.current as any).webkitRequestFullscreen();
        } else if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Pitch fullscreen toggle:', err);
      setIsPitchFullscreen((prev) => !prev);
    }
  };

  // Playback state
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Visualization layer toggles
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showPitchControl, setShowPitchControl] = useState(false);
  const [showConvexHull, setShowConvexHull] = useState(true);
  const [showTrajectories, setShowTrajectories] = useState(true);
  const [showJerseyNumbers, setShowJerseyNumbers] = useState(true);
  const [teamFilter, setTeamFilter] = useState<'all' | 'home' | 'away'>('all');

  const activeFrame = frames[currentFrameIndex] || frames[0];

  // Playback timer loop
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

  // Main Canvas Render
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

    const margin = 20;
    const pitchW = width - margin * 2;
    const pitchH = height - margin * 2;

    const toCanvasX = (mX: number) => margin + (mX / 105) * pitchW;
    const toCanvasY = (mY: number) => margin + (mY / 68) * pitchH;

    // 1. Pitch Turf Ground: Deep Tactical Green
    ctx.fillStyle = isDark ? '#0b1d15' : '#14532d';
    ctx.fillRect(0, 0, width, height);

    // Mowing stripes
    const stripes = 12;
    const stripeW = pitchW / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0
        ? isDark ? '#0d2219' : '#166534'
        : isDark ? '#0b1d15' : '#14532d';
      ctx.fillRect(margin + i * stripeW, margin, stripeW, pitchH);
    }

    // 2. Probabilistic Pitch Control Grid
    if (showPitchControl && activeFrame) {
      const homeP = activeFrame.players.filter((p) => p.teamId === 'home');
      const awayP = activeFrame.players.filter((p) => p.teamId === 'away');
      const controlGrid = computePitchControlGrid(homeP, awayP, 28, 18);

      const cellW = pitchW / 28;
      const cellH = pitchH / 18;

      ctx.save();
      for (let r = 0; r < controlGrid.length; r++) {
        for (let c = 0; c < controlGrid[r].length; c++) {
          const val = controlGrid[r][c];
          if (val < -0.05) {
            const alpha = Math.min(0.38, Math.abs(val) * 0.38);
            ctx.fillStyle = `rgba(2, 132, 199, ${alpha})`;
            ctx.fillRect(margin + c * cellW, margin + r * cellH, cellW, cellH);
          } else if (val > 0.05) {
            const alpha = Math.min(0.38, Math.abs(val) * 0.38);
            ctx.fillStyle = `rgba(220, 38, 38, ${alpha})`;
            ctx.fillRect(margin + c * cellW, margin + r * cellH, cellW, cellH);
          }
        }
      }
      ctx.restore();
    }

    // 3. Gaussian Density Heatmap
    if (showHeatmap) {
      ctx.save();
      const sampleSlice = frames.slice(0, currentFrameIndex + 1);
      sampleSlice.forEach((f) => {
        f.players.forEach((p) => {
          if (selectedPlayerId && p.id !== selectedPlayerId) return;
          if (teamFilter !== 'all' && p.teamId !== teamFilter) return;

          const cx = toCanvasX(p.x);
          const cy = toCanvasY(p.y);
          const rad = 22;

          const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, rad);
          if (p.teamId === 'home') {
            grad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
            grad.addColorStop(0.5, 'rgba(14, 165, 233, 0.1)');
            grad.addColorStop(1, 'rgba(14, 165, 233, 0)');
          } else {
            grad.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
            grad.addColorStop(0.5, 'rgba(220, 38, 38, 0.1)');
            grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
          }
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, rad, 0, Math.PI * 2);
          ctx.fill();
        });
      });
      ctx.restore();
    }

    // 4. Official Pitch Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.6;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

    // Outer boundary
    ctx.strokeRect(margin, margin, pitchW, pitchH);

    // Halfway line
    const midX = margin + pitchW / 2;
    ctx.beginPath();
    ctx.moveTo(midX, margin);
    ctx.lineTo(midX, margin + pitchH);
    ctx.stroke();

    // Center Circle (r = 9.15m)
    const centerRadius = (9.15 / 105) * pitchW;
    ctx.beginPath();
    ctx.arc(midX, margin + pitchH / 2, centerRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Center spot
    ctx.beginPath();
    ctx.arc(midX, margin + pitchH / 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Left Penalty Area (16.5m x 40.32m)
    const penW = (16.5 / 105) * pitchW;
    const penH = (40.32 / 68) * pitchH;
    const penY = margin + (pitchH - penH) / 2;
    ctx.strokeRect(margin, penY, penW, penH);

    // Left Goal Area (5.5m x 18.32m)
    const goalW = (5.5 / 105) * pitchW;
    const goalH = (18.32 / 68) * pitchH;
    const goalY = margin + (pitchH - goalH) / 2;
    ctx.strokeRect(margin, goalY, goalW, goalH);

    // Left Penalty Spot (11m)
    const leftPenSpotX = toCanvasX(11);
    ctx.beginPath();
    ctx.arc(leftPenSpotX, margin + pitchH / 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Left Penalty Arc
    ctx.beginPath();
    ctx.arc(leftPenSpotX, margin + pitchH / 2, centerRadius, -0.65, 0.65);
    ctx.stroke();

    // Right Penalty Area
    ctx.strokeRect(margin + pitchW - penW, penY, penW, penH);

    // Right Goal Area
    ctx.strokeRect(margin + pitchW - goalW, goalY, goalW, goalH);

    // Right Penalty Spot (94m)
    const rightPenSpotX = toCanvasX(94);
    ctx.beginPath();
    ctx.arc(rightPenSpotX, margin + pitchH / 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Right Penalty Arc
    ctx.beginPath();
    ctx.arc(rightPenSpotX, margin + pitchH / 2, centerRadius, Math.PI - 0.65, Math.PI + 0.65);
    ctx.stroke();

    // Corner Arcs
    const cornerR = (1 / 105) * pitchW;
    ctx.beginPath();
    ctx.arc(margin, margin, cornerR, 0, Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(margin, margin + pitchH, cornerR, -Math.PI / 2, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(margin + pitchW, margin, cornerR, Math.PI / 2, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(margin + pitchW, margin + pitchH, cornerR, Math.PI, -Math.PI / 2);
    ctx.stroke();

    if (!activeFrame) return;

    // 5. Convex Hulls & Team Shapes
    if (showConvexHull) {
      const homeOutfield = activeFrame.players
        .filter((p) => p.teamId === 'home' && p.number !== 31)
        .map((p) => ({ x: p.x, y: p.y }));

      const awayOutfield = activeFrame.players
        .filter((p) => p.teamId === 'away' && p.number !== 22)
        .map((p) => ({ x: p.x, y: p.y }));

      if (teamFilter === 'all' || teamFilter === 'home') {
        const homeHull = computeConvexHull(homeOutfield);
        if (homeHull.length > 2) {
          ctx.beginPath();
          ctx.moveTo(toCanvasX(homeHull[0].x), toCanvasY(homeHull[0].y));
          for (let i = 1; i < homeHull.length; i++) {
            ctx.lineTo(toCanvasX(homeHull[i].x), toCanvasY(homeHull[i].y));
          }
          ctx.closePath();
          ctx.fillStyle = 'rgba(2, 132, 199, 0.16)';
          ctx.fill();
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.4;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        const hC = computeCentroid(homeOutfield);
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(toCanvasX(hC.x), toCanvasY(hC.y), 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (teamFilter === 'all' || teamFilter === 'away') {
        const awayHull = computeConvexHull(awayOutfield);
        if (awayHull.length > 2) {
          ctx.beginPath();
          ctx.moveTo(toCanvasX(awayHull[0].x), toCanvasY(awayHull[0].y));
          for (let i = 1; i < awayHull.length; i++) {
            ctx.lineTo(toCanvasX(awayHull[i].x), toCanvasY(awayHull[i].y));
          }
          ctx.closePath();
          ctx.fillStyle = 'rgba(220, 38, 38, 0.16)';
          ctx.fill();
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 1.4;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        const aC = computeCentroid(awayOutfield);
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(toCanvasX(aC.x), toCanvasY(aC.y), 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // 6. Trajectory Trails
    if (showTrajectories && currentFrameIndex > 0) {
      const tailLen = Math.min(14, currentFrameIndex);
      const startF = currentFrameIndex - tailLen;

      activeFrame.players.forEach((currP) => {
        if (selectedPlayerId && currP.id !== selectedPlayerId) return;
        if (teamFilter !== 'all' && currP.teamId !== teamFilter) return;

        ctx.beginPath();
        let started = false;
        for (let f = startF; f <= currentFrameIndex; f++) {
          const pastP = frames[f]?.players.find((p) => p.id === currP.id);
          if (pastP) {
            const px = toCanvasX(pastP.x);
            const py = toCanvasY(pastP.y);
            if (!started) {
              ctx.moveTo(px, py);
              started = true;
            } else {
              ctx.lineTo(px, py);
            }
          }
        }
        ctx.strokeStyle = currP.teamId === 'home' ? 'rgba(56, 189, 248, 0.5)' : 'rgba(248, 113, 113, 0.5)';
        ctx.lineWidth = selectedPlayerId === currP.id ? 2.5 : 1.2;
        ctx.stroke();
      });
    }

    // 7. Draw Player Magnetic Tokens
    activeFrame.players.forEach((p) => {
      if (teamFilter !== 'all' && p.teamId !== teamFilter) return;

      const px = toCanvasX(p.x);
      const py = toCanvasY(p.y);
      const isSelected = selectedPlayerId === p.id;
      const isHome = p.teamId === 'home';

      // Velocity Arrow Vector
      if (p.speed > 5) {
        const arrowLen = Math.min(20, p.speed * 0.85);
        const angle = Math.atan2(p.vy, p.vx);
        const tipX = px + Math.cos(angle) * arrowLen;
        const tipY = py + Math.sin(angle) * arrowLen;

        ctx.strokeStyle = isHome ? 'rgba(186, 230, 253, 0.8)' : 'rgba(254, 202, 202, 0.8)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();
      }

      // Selection Halo Ring
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(px, py, 13, 0, Math.PI * 2);
        ctx.strokeStyle = '#00d26a';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Token Body
      ctx.beginPath();
      ctx.arc(px, py, 8.5, 0, Math.PI * 2);
      ctx.fillStyle = isHome ? '#0284c7' : '#dc2626';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Jersey Number
      if (showJerseyNumbers) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px "Barlow Condensed", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.number.toString(), px, py + 0.5);
      }
    });

    // 8. Match Ball
    if (activeFrame.ball) {
      const bx = toCanvasX(activeFrame.ball.x);
      const by = toCanvasY(activeFrame.ball.y);
      const bz = activeFrame.ball.z;

      ctx.beginPath();
      ctx.ellipse(bx, by + bz * 2, 4, 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(bx, by - bz * 4, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [
    activeFrame,
    currentFrameIndex,
    frames,
    isDark,
    selectedPlayerId,
    showConvexHull,
    showHeatmap,
    showJerseyNumbers,
    showPitchControl,
    showTrajectories,
    teamFilter,
  ]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !activeFrame) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const margin = 20;
    const pitchW = canvas.clientWidth - margin * 2;
    const pitchH = canvas.clientHeight - margin * 2;

    const toCanvasX = (mX: number) => margin + (mX / 105) * pitchW;
    const toCanvasY = (mY: number) => margin + (mY / 68) * pitchH;

    let closestId: string | null = null;
    let minD = 18;

    activeFrame.players.forEach((p) => {
      const px = toCanvasX(p.x);
      const py = toCanvasY(p.y);
      const d = Math.hypot(clickX - px, clickY - py);
      if (d < minD) {
        minD = d;
        closestId = p.id;
      }
    });

    onSelectPlayer(closestId === selectedPlayerId ? null : closestId);
  };

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);
  const currentHomePlayers = activeFrame?.players.filter((p) => p.teamId === 'home') || [];
  const currentAwayPlayers = activeFrame?.players.filter((p) => p.teamId === 'away') || [];
  const homeDims = computeTeamDimensions(currentHomePlayers);
  const awayDims = computeTeamDimensions(currentAwayPlayers);

  return (
    <div
      ref={pitchContainerRef}
      className={`space-y-3 ${
        isPitchFullscreen
          ? 'fixed inset-0 z-50 p-4 overflow-y-auto bg-slate-950 text-white flex flex-col'
          : ''
      }`}
    >
      {/* Control Transport Bar */}
      <div className={`p-3 rounded-lg border shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs ${
        isDark ? 'bg-[#12141a] border-[#1e232d]' : 'bg-white border-slate-300'
      }`}>
        {/* Playback Controls */}
        <div className="flex items-center gap-1.5 font-mono font-bold">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase rounded text-xs transition-colors cursor-pointer shadow-xs"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Replay Match'}</span>
          </button>

          <button
            onClick={() => setCurrentFrameIndex((prev) => Math.max(0, prev - 1))}
            className={`p-2 rounded border transition-colors cursor-pointer font-bold ${
              isDark ? 'border-[#242833] hover:bg-[#1a1d27] text-[#9ca3af]' : 'border-slate-300 hover:bg-slate-100 text-slate-800 shadow-xs'
            }`}
            title="Step -1 Frame"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentFrameIndex((prev) => Math.min(frames.length - 1, prev + 1))}
            className={`p-2 rounded border transition-colors cursor-pointer font-bold ${
              isDark ? 'border-[#242833] hover:bg-[#1a1d27] text-[#9ca3af]' : 'border-slate-300 hover:bg-slate-100 text-slate-800 shadow-xs'
            }`}
            title="Step +1 Frame"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setCurrentFrameIndex(0);
              setIsPlaying(false);
            }}
            className={`p-2 rounded border transition-colors cursor-pointer font-bold ${
              isDark ? 'border-[#242833] hover:bg-[#1a1d27] text-[#6b7280]' : 'border-slate-300 hover:bg-slate-100 text-slate-800 shadow-xs'
            }`}
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed */}
          <div className="flex items-center gap-1 ml-1.5 font-bold">
            {[0.5, 1, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                  playbackSpeed === spd
                    ? 'bg-slate-900 text-white font-black shadow-xs'
                    : isDark ? 'text-[#8c919b] hover:text-white' : 'text-slate-800 hover:text-black hover:bg-slate-100'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Tactical Layer Toggles */}
        <div className="flex items-center flex-wrap gap-1.5 font-mono text-xs font-bold">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded border transition-colors cursor-pointer font-black ${
              showHeatmap
                ? 'bg-sky-100 border-sky-400 text-sky-950 font-black shadow-xs'
                : isDark ? 'border-[#242833] text-[#8c919b] hover:text-white' : 'border-slate-300 text-slate-800 hover:bg-slate-100 shadow-xs'
            }`}
          >
            HEATMAP
          </button>

          <button
            onClick={() => setShowPitchControl(!showPitchControl)}
            className={`px-3 py-1.5 rounded border transition-colors cursor-pointer font-black ${
              showPitchControl
                ? 'bg-indigo-100 border-indigo-400 text-indigo-950 font-black shadow-xs'
                : isDark ? 'border-[#242833] text-[#8c919b] hover:text-white' : 'border-slate-300 text-slate-800 hover:bg-slate-100 shadow-xs'
            }`}
          >
            PITCH CONTROL
          </button>

          <button
            onClick={() => setShowConvexHull(!showConvexHull)}
            className={`px-3 py-1.5 rounded border transition-colors cursor-pointer font-black ${
              showConvexHull
                ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-black shadow-xs'
                : isDark ? 'border-[#242833] text-[#8c919b] hover:text-white' : 'border-slate-300 text-slate-800 hover:bg-slate-100 shadow-xs'
            }`}
          >
            TEAM SHAPE
          </button>

          <button
            onClick={() => setShowTrajectories(!showTrajectories)}
            className={`px-3 py-1.5 rounded border transition-colors cursor-pointer font-black ${
              showTrajectories
                ? 'bg-amber-100 border-amber-400 text-amber-950 font-black shadow-xs'
                : isDark ? 'border-[#242833] text-[#8c919b] hover:text-white' : 'border-slate-300 text-slate-800 hover:bg-slate-100 shadow-xs'
            }`}
          >
            TRAILS
          </button>

          {/* Filter */}
          <div className="flex items-center gap-1 border-l pl-2 border-slate-300">
            {(['all', 'home', 'away'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTeamFilter(mode)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-black transition-colors cursor-pointer ${
                  teamFilter === mode
                    ? 'bg-slate-900 text-white font-black shadow-xs'
                    : isDark ? 'text-[#8c919b] hover:text-white' : 'text-slate-800 hover:text-black hover:bg-slate-100'
                }`}
              >
                {mode === 'all' ? 'BOTH' : mode === 'home' ? 'MCI' : 'ARS'}
              </button>
            ))}
          </div>

          {/* Full Screen Pitch Toggle */}
          <button
            onClick={togglePitchFullscreen}
            title={isPitchFullscreen ? 'Exit Full Screen Pitch' : 'Full Screen Tactical Pitch'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition-colors cursor-pointer font-black text-xs ${
              isPitchFullscreen
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : isDark
                ? 'border-[#242833] text-[#ececed] hover:bg-[#1a1d27]'
                : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-900 shadow-xs'
            }`}
          >
            {isPitchFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">EXIT FULLSCREEN</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-slate-800" />
                <span className="hidden sm:inline">FULLSCREEN PITCH</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Canvas Pitch Viewport */}
      <div className={`relative rounded-lg border overflow-hidden shadow-xs ${
        isDark ? 'border-[#1e232d] bg-[#090b0e]' : 'border-slate-300 bg-black'
      }`}>
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full aspect-[105/68] max-h-[580px] block cursor-crosshair"
        />

        {/* Tactical Telemetry Ribbon (Top-Left) */}
        <div className="absolute top-2.5 left-2.5 pointer-events-none flex flex-col gap-1 text-[11px] font-mono bg-[#0c0e12]/90 border border-[#222733] px-3 py-1.5 rounded text-[#ececed]">
          <div className="flex items-center gap-2">
            <span className="text-[#00d26a] font-bold">{activeFrame?.tacticalPhase}</span>
            <span className="text-[#555a64]">·</span>
            <span>TIMECODE: {activeFrame?.timestampSeconds.toFixed(1)}s</span>
            <span className="text-[#555a64]">·</span>
            <span>FRAME {currentFrameIndex + 1}/{frames.length}</span>
          </div>
          <div className="text-[10px] text-[#8c919b] flex items-center gap-3">
            <span>MCI SHAPE: {homeDims.lengthM}m L x {homeDims.widthM}m W</span>
            <span>ARS SHAPE: {awayDims.lengthM}m L x {awayDims.widthM}m W</span>
          </div>
        </div>

        {/* Selected Player Floating HUD (Top-Right) */}
        {selectedPlayer && (
          <div className="absolute top-2.5 right-2.5 bg-[#0e1015]/95 border border-[#00d26a]/60 p-3 rounded text-xs shadow-lg max-w-xs text-[#ececed]">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#242833]">
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-white text-[10px] font-mono ${
                  selectedPlayer.teamId === 'home' ? 'bg-[#0284c7]' : 'bg-[#dc2626]'
                }`}>
                  {selectedPlayer.number}
                </span>
                <span className="font-bold">{selectedPlayer.name}</span>
                <span className="text-[#8c919b] font-mono text-[10px]">({selectedPlayer.position})</span>
              </div>
              <button
                onClick={() => onSelectPlayer(null)}
                className="text-[#8c919b] hover:text-white text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] tabular-nums font-mono">
              <div>
                <span className="text-[#8c919b] block text-[10px]">CURRENT SPEED</span>
                <span className="font-semibold text-[#00d26a]">{selectedPlayer.speedKmh} km/h</span>
              </div>
              <div>
                <span className="text-[#8c919b] block text-[10px]">DISTANCE</span>
                <span className="font-semibold">{selectedPlayer.metrics.totalDistanceKm} km</span>
              </div>
              <div>
                <span className="text-[#8c919b] block text-[10px]">METABOLIC POWER</span>
                <span className="font-semibold">{selectedPlayer.metrics.metabolicPowerWkg} W/kg</span>
              </div>
              <div>
                <span className="text-[#8c919b] block text-[10px]">ACWR INDEX</span>
                <span className={`font-semibold ${
                  selectedPlayer.metrics.acwr > 1.45 ? 'text-[#f59e0b]' : 'text-[#00d26a]'
                }`}>
                  {selectedPlayer.metrics.acwr}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Scrubber */}
        <div className="absolute bottom-2 inset-x-3 bg-[#0c0e12]/90 border border-[#222733] px-3 py-1.5 rounded flex items-center gap-3">
          <span className="text-[10px] font-mono text-[#8c919b] whitespace-nowrap">00:00.0</span>
          <input
            type="range"
            min={0}
            max={frames.length - 1}
            value={currentFrameIndex}
            onChange={(e) => setCurrentFrameIndex(Number(e.target.value))}
            className="w-full accent-[#00d26a] cursor-pointer h-1 bg-[#252a37] rounded appearance-none"
          />
          <span className="text-[10px] font-mono text-[#ececed] whitespace-nowrap">
            {activeFrame ? `00:${activeFrame.timestampSeconds.toFixed(1).padStart(4, '0')}` : '00:30.0'}
          </span>
        </div>
      </div>
    </div>
  );
};
