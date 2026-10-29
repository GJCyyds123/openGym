import { describe, it, expect } from 'vitest'
import { COMPATIBLE_PRESETS, presetFor, presetName } from './coach-presets.js'
import { validateBaseUrl } from '../../../api/coach/core/providers.js'

describe('compatible presets', () => {
  it('are https endpoints the setup screen accepts as they are', () => {
    for (const p of COMPATIBLE_PRESETS) {
      const v = validateBaseUrl(p.baseUrl)
      expect(v.ok, p.id).toBe(true)
      expect(v.value).toMatch(/^https:\/\//)
      expect(p.model).toBeTruthy()
      expect(p.keyUrl).toMatch(/^https:\/\//)
    }
  })

  it('have unique ids and endpoints', () => {
    expect(new Set(COMPATIBLE_PRESETS.map(p => p.id)).size).toBe(COMPATIBLE_PRESETS.length)
    expect(new Set(COMPATIBLE_PRESETS.map(p => p.baseUrl)).size).toBe(COMPATIBLE_PRESETS.length)
  })

  it('presetFor recognises a preset endpoint however it was typed, and only for the compatible provider', () => {
    expect(presetFor('compatible', 'https://api.deepseek.com')?.id).toBe('deepseek')
    expect(presetFor('compatible', ' HTTPS://API.DEEPSEEK.COM/ ')?.id).toBe('deepseek')
    expect(presetFor('compatible', 'https://dashscope.aliyuncs.com/compatible-mode/v1/')?.id).toBe('qwen')
    expect(presetFor('compatible', 'https://ollama.example.com')).toBe(null)
    expect(presetFor('openai', 'https://api.deepseek.com')).toBe(null)
    expect(presetFor('compatible', null)).toBe(null)
  })

  it('presetName uses the language’s own name where the brand has one, English otherwise', () => {
    const qwen = COMPATIBLE_PRESETS.find(p => p.id === 'qwen')
    const deepseek = COMPATIBLE_PRESETS.find(p => p.id === 'deepseek')
    expect(presetName(qwen, 'zh')).toBe('通义千问')
    expect(presetName(qwen, 'zh-TW')).toBe('通義千問')
    expect(presetName(qwen, 'de')).toBe('Qwen')
    expect(presetName(deepseek, 'zh')).toBe('DeepSeek')
    expect(presetName(deepseek, undefined)).toBe('DeepSeek')
  })
})
