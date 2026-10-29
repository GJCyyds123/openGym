// Mobile build, or a web build with VITE_COACH_BYOK=1: how the Coach runs on this device, and the
// little it keeps between runs.
//
// Deliberately NOT part of S. S is the training log — it syncs to a paired server, travels in
// the JSON export, and is what "back up your data" means. Which provider this phone talks to,
// the pseudonym it uses, today's run count and a proposal waiting to be looked at are device
// facts, so they live in their own file next to the remote-pairing one. The API key itself is
// not even here: see coach-secrets.js.
//
// This module is intentionally light. The setup screen imports it before the user has chosen
// anything, and the promise there is that nothing AI-shaped loads until they do.
import { MOBILE, readJsonFile, writeJsonFile } from './mobile.js'

// A static web deployment has no server to run the Coach, so a build may opt into the phone's
// own-key Coach instead (VITE_COACH_BYOK=1): the same pipeline, in the browser. The settings file
// lands in the Filesystem plugin's IndexedDB store and the key in its secure-storage plugin's
// localStorage fallback, which on the web is only as private as the origin. Unset — every upstream
// web build — nothing changes: the Coach there is the server's.
export const WEB_BYOK = !MOBILE && import.meta.env.VITE_COACH_BYOK === '1'
/** This device can run the Coach itself: every phone, and a web build that opted in. A function,
 *  not a constant, so it reads MOBILE when asked (the screens' tests flip it between cases). */
export const deviceCoach = () => MOBILE || WEB_BYOK

const FILE = 'opengym-coach.json'

export const COACH_MODES = ['off', 'server', 'byok']

const DEFAULTS = { mode: 'off', provider: null, model: null, baseUrl: null, handle: null, daily: null, pending: null }

let cache = null
export async function loadCoachDevice() {
  if (cache) return cache
  const saved = await readJsonFile(FILE)
  cache = { ...DEFAULTS, ...(saved && typeof saved === 'object' ? saved : {}) }
  if (!COACH_MODES.includes(cache.mode)) cache.mode = 'off'
  return cache
}
export async function saveCoachDevice(patch) {
  const next = { ...(await loadCoachDevice()), ...patch }
  cache = next
  await writeJsonFile(FILE, next)
  return next
}
/** The part of it a UI may show: never the pending proposal, never the handle. */
export const coachDeviceSettings = d => d ? { mode: d.mode, provider: d.provider, model: d.model, baseUrl: d.baseUrl } : null

// Test seam.
export function _resetCoachDevice() { cache = null }
