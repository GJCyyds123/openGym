// Which builds run the own-key Coach on the device: every phone, and a web build that opted in
// with VITE_COACH_BYOK=1 (a static deployment with no server). Every other web build is
// unchanged — its Coach is the server's, and Settings has no AI Coach page.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { pageVisible } from '../views/settings-pages.js'

const mocks = vi.hoisted(() => ({ mobile: false }))
vi.mock('./mobile.js', () => ({
  get MOBILE() { return mocks.mobile },
  readJsonFile: async () => null,
  writeJsonFile: async () => {}
}))

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); mocks.mobile = false })
const load = () => import('./coach-device.js')

describe('deviceCoach', () => {
  it('an ordinary web build leaves the Coach to the server', async () => {
    const m = await load()
    expect(m.WEB_BYOK).toBe(false)
    expect(m.deviceCoach()).toBe(false)
  })

  it('a web build that opted in runs it in the browser', async () => {
    vi.stubEnv('VITE_COACH_BYOK', '1')
    const m = await load()
    expect(m.WEB_BYOK).toBe(true)
    expect(m.deviceCoach()).toBe(true)
  })

  it('only "1" opts in', async () => {
    vi.stubEnv('VITE_COACH_BYOK', 'true')
    expect((await load()).WEB_BYOK).toBe(false)
  })

  it('every phone can; the web flag means nothing there', async () => {
    mocks.mobile = true
    vi.stubEnv('VITE_COACH_BYOK', '1')
    const m = await load()
    expect(m.WEB_BYOK).toBe(false)
    expect(m.deviceCoach()).toBe(true)
  })

  it('the settings come back with defaults where nothing was saved yet', async () => {
    const m = await load()
    m._resetCoachDevice()
    const d = await m.loadCoachDevice()
    expect(d.mode).toBe('off')
    expect(m.coachDeviceSettings(d)).toEqual({ mode: 'off', provider: null, model: null, baseUrl: null })
  })
})

describe('the AI Coach settings page', () => {
  it('shows on a device that runs the Coach itself, and nowhere else', () => {
    expect(pageVisible('coach', { mobile: true })).toBe(true)
    expect(pageVisible('coach', { mobile: false, deviceCoach: true })).toBe(true)
    expect(pageVisible('coach', { mobile: false, deviceCoach: false })).toBe(false)
    expect(pageVisible('coach', { mobile: false })).toBe(false)
  })
})
