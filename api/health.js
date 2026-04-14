/**
 * /api/health — Vercel Serverless Function
 *
 * Used by the /diag page to verify:
 *   1. Same-origin API calls succeed (rules out general network block)
 *   2. The Vercel edge is reachable for dynamic requests
 *   3. Response latency from the user's location
 *
 * GET /api/health  →  200 JSON { ok, ts, region, ... }
 * HEAD /api/health →  200 (for latency-only check)
 */
export default function handler(req, res) {
  // Allow cross-origin requests so the diag page can call it
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'HEAD') {
    return res.status(200).end();
  }

  return res.status(200).json({
    ok: true,
    ts: new Date().toISOString(),
    region: process.env.VERCEL_REGION || process.env.AWS_REGION || 'unknown',
    deployment: process.env.VERCEL_URL || 'unknown',
    runtime: 'edge-function',
  });
}
