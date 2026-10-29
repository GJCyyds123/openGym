// One-tap setups for OpenAI-compatible providers the Coach's provider table does not list by
// name: the endpoint and a model to start from, filled into the compatible provider's fields.
// Only a starting point — "List models" still asks the endpoint what it serves, every field
// stays editable, and a model the endpoint no longer lists is simply not preselected.
//
// Both answer a browser's CORS preflight for /models and /chat/completions (checked 2026-10-28),
// so they work from a web build with no server (VITE_COACH_BYOK) as well as from the phone, and
// both are reachable from mainland China. Neither takes a 16000-token ceiling on its default
// model; the HTTP adapter retries once at the ceiling the provider names (maxTokensCapOf).
export const COMPATIBLE_PRESETS = [
  {
    id: 'deepseek',
    names: { en: 'DeepSeek' },
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    keyUrl: 'https://platform.deepseek.com/api_keys'
  },
  {
    id: 'qwen',
    names: { en: 'Qwen', zh: '通义千问', 'zh-TW': '通義千問' },
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-plus',
    keyUrl: 'https://bailian.console.aliyun.com/'
  }
]

/** A preset's name in the app's language: a brand, so only where it has a name of its own. */
export const presetName = (preset, lang) => preset.names[lang] || preset.names[String(lang || '').split('-')[0]] || preset.names.en

const norm = url => String(url || '').trim().replace(/\/+$/, '').toLowerCase()

/** The preset a saved or typed setup is, or null: only the compatible provider has presets. */
export const presetFor = (provider, baseUrl) =>
  provider === 'compatible' ? COMPATIBLE_PRESETS.find(p => norm(p.baseUrl) === norm(baseUrl)) || null : null
