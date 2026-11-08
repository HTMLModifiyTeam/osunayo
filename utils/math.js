export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const clamp = (v, a, b) => v < a ? a : v > b ? b : v
export const lerp = (a, b, k) => a + (b - a) * k
export const smoothstep = x => {
  x = clamp(x, 0, 1);
  return x * x * (3 - 2 * x);
};

export const phase = (t, start, end) => clamp((t - start) / (end - start), 0, 1);
export const envelope = (t, start, end, rise = .2, fall = .25) => t < start || t > end ? 0 : Math.min(smoothstep((t - start) / rise), smoothstep((end - t) / fall));
export const overlapArea = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));

export const RND = Math.random;
export const randomRange = (a, b) => a + RND() * (b - a);
export const pick = a => a[Math.floor(RND() * a.length)];