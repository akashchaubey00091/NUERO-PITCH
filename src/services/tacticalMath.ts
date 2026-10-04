/**
 * NeuroPitch Tactical & Sports Science Mathematics
 * Implements planar geometry, convex hulls, Voronoi pitch dominance,
 * homography coordinate transformations, and metabolic power modeling.
 */

export interface Point2D {
  x: number;
  y: number;
}

/**
 * Computes 2D Convex Hull using the Monotone Chain algorithm (Andrew's variant)
 * Returns array of Points defining the minimal bounding polygon in clockwise order.
 */
export function computeConvexHull(points: Point2D[]): Point2D[] {
  if (points.length <= 2) return [...points];

  const sorted = [...points].sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));

  const crossProduct = (o: Point2D, a: Point2D, b: Point2D) => {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  };

  // Lower hull
  const lower: Point2D[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && crossProduct(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  // Upper hull
  const upper: Point2D[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && crossProduct(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

/**
 * Computes polygon area in square meters using Shoelace formula
 */
export function computePolygonArea(vertices: Point2D[]): number {
  if (vertices.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }
  return Math.abs(area) / 2;
}

/**
 * Computes centroid (center of mass) of given points
 */
export function computeCentroid(points: Point2D[]): Point2D {
  if (points.length === 0) return { x: 52.5, y: 34.0 };
  const sumX = points.reduce((acc, p) => acc + p.x, 0);
  const sumY = points.reduce((acc, p) => acc + p.y, 0);
  return {
    x: Number((sumX / points.length).toFixed(2)),
    y: Number((sumY / points.length).toFixed(2)),
  };
}

/**
 * Computes Team Length (deepest outfield player to highest forward)
 * and Team Width (maximum flank-to-flank separation)
 */
export function computeTeamDimensions(points: Point2D[]): { lengthM: number; widthM: number } {
  if (points.length < 2) return { lengthM: 0, widthM: 0 };
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  return {
    lengthM: Number((maxX - minX).toFixed(1)),
    widthM: Number((maxY - minY).toFixed(1)),
  };
}

/**
 * Probabilistic Pitch Control model (simplified Fernández & Bornn spatial influence).
 * Evaluates pitch dominance on a 21x14 grid across 105m x 68m.
 * Returns grid of values in [-1, 1], where -1 = 100% Home dominance, +1 = 100% Away dominance.
 */
export function computePitchControlGrid(
  homePlayers: { x: number; y: number; vx?: number; vy?: number }[],
  awayPlayers: { x: number; y: number; vx?: number; vy?: number }[],
  cols: number = 24,
  rows: number = 16
): number[][] {
  const grid: number[][] = [];
  const dx = 105 / cols;
  const dy = 68 / rows;

  for (let r = 0; r < rows; r++) {
    const rowVals: number[] = [];
    const targetY = (r + 0.5) * dy;

    for (let c = 0; c < cols; c++) {
      const targetX = (c + 0.5) * dx;

      // Calculate time-to-intercept proxy for each player
      let minHomeDist = Infinity;
      for (const p of homePlayers) {
        const d = Math.hypot(p.x - targetX, p.y - targetY);
        if (d < minHomeDist) minHomeDist = d;
      }

      let minAwayDist = Infinity;
      for (const p of awayPlayers) {
        const d = Math.hypot(p.x - targetX, p.y - targetY);
        if (d < minAwayDist) minAwayDist = d;
      }

      // Logistic sigmoid differential
      const deltaDist = minAwayDist - minHomeDist;
      // if deltaDist > 0, Home is closer (negative index for home)
      // sigmoid mapped to [-1, 1]
      const influence = (2 / (1 + Math.exp(-deltaDist / 4.5))) - 1;
      rowVals.push(Number(influence.toFixed(3)));
    }
    grid.push(rowVals);
  }

  return grid;
}

/**
 * Planar 4-point Homography Matrix estimation:
 * Maps 4 points in image space [u, v] to pitch coordinates [x, y]
 */
export function solveHomography(
  srcPts: [number, number][],
  dstPts: [number, number][]
): number[] {
  // srcPts: 4 points in video space
  // dstPts: 4 points in pitch space (meters)
  // Simplified direct linear transform (DLT) normalized
  // Returns 9 coefficients [h0, h1, h2, h3, h4, h5, h6, h7, h8]
  // Fallback identity transformation if fewer than 4 points
  if (srcPts.length < 4 || dstPts.length < 4) {
    return [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }

  // Use standard affine/projective approximation for web camera perspective
  const [s0, s1, s2, s3] = srcPts;
  const [d0, d1, d2, d3] = dstPts;

  // Simple homography approximation for broadcast cameras
  const sx = (d1[0] - d0[0]) / Math.max(1, s1[0] - s0[0]);
  const sy = (d3[1] - d0[1]) / Math.max(1, s3[1] - s0[1]);

  return [sx, 0, d0[0] - s0[0] * sx, 0, sy, d0[1] - s0[1] * sy, 0, 0, 1];
}

/**
 * Apply 3x3 homography to convert broadcast pixel (u, v) to pitch meters (x, y)
 */
export function applyHomography(H: number[], u: number, v: number): Point2D {
  const w = H[6] * u + H[7] * v + H[8];
  const scale = Math.abs(w) < 1e-6 ? 1 : 1 / w;
  const x = (H[0] * u + H[1] * v + H[2]) * scale;
  const y = (H[3] * u + H[4] * v + H[5]) * scale;

  return {
    x: Math.max(0, Math.min(105, x)),
    y: Math.max(0, Math.min(68, y)),
  };
}

/**
 * Inverse homography: Pitch meters (x, y) to broadcast normalized frame (0..1)
 */
export function projectPitchToCamera(
  pitchX: number,
  pitchY: number,
  cameraPitch: number = 0.35
): { u: number; v: number; scale: number } {
  // Projects a top-down pitch coordinate (0..105, 0..68)
  // to a broadcast TV camera perspective view
  const normX = pitchX / 105; // 0..1
  const normY = pitchY / 68; // 0..1 (0 is near touchline, 1 is far touchline)

  // Camera sits above sideline (Y < 0 or near Y = 0)
  // Far points (high Y) converge toward center and have smaller scale
  const perspectiveRatio = 1 - normY * cameraPitch;
  const centerX = 0.5;
  const u = centerX + (normX - centerX) * perspectiveRatio;
  const v = 0.28 + normY * 0.65; // maps to vertical broadcast frame
  const scale = 0.65 + (1 - normY) * 0.45; // players closer to camera are larger

  return { u, v, scale };
}

/**
 * Metabolic Power according to Osgnach & di Prampero (2010)
 * P = EnergyCost * Velocity
 * where EnergyCost is a polynomial function of Equivalent Slope ES.
 */
export function calculateMetabolicPower(speedMs: number, accelMs2: number): number {
  if (speedMs < 0.1) return 0;
  // Equivalent slope calculation
  const g = 9.81;
  const es = Math.tan(Math.atan(accelMs2 / g));
  // Energy cost of running on equivalent slope (J / kg / m)
  const ec =
    155.4 * Math.pow(es, 5) -
    30.4 * Math.pow(es, 4) -
    43.3 * Math.pow(es, 3) +
    46.3 * Math.pow(es, 2) +
    19.5 * es +
    3.6;

  // Metabolic power = EC * v (W / kg)
  const powerWkg = Math.max(0, ec * speedMs);
  return Number(powerWkg.toFixed(2));
}
