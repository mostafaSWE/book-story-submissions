// Depth tiers, as approved: near = largest and fully inked. Speeds in px/s, phase = start offset.
export const ROWS = [
  { tier: "far", speed: 15, phase: 0.13, ids: [1, 6, 7, 10, 11, 16, 18, 24, 27, 30] },
  { tier: "near", speed: 24, phase: 0.57, ids: [29, 34, 5, 2, 23, 14, 38, 36, 19, 32] },
  { tier: "mid", speed: 19, phase: 0.31, ids: [15, 3, 21, 26, 12, 31, 20, 33, 13, 39] },
  { tier: "far", speed: 13, phase: 0.79, ids: [4, 8, 9, 17, 22, 25, 28, 35, 37, 40] }
];
export const FEATURED = [29, 15, 34]; // reduced-motion fallback
