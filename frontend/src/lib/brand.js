// The product name the UI shows, and where its source lives. openGym and the upstream repository
// unless a build sets VITE_APP_NAME / VITE_SOURCE_URL — a rebranded fork. Unset, nothing changes.
//
// `import.meta.env` is Vite's; this module is also loaded by plain Node (through i18n-core.js),
// where it does not exist.
const env = import.meta.env || {}

export const UPSTREAM_NAME = 'openGym'
export const APP_NAME = (env.VITE_APP_NAME || '').trim() || UPSTREAM_NAME
export const SOURCE_URL = env.VITE_SOURCE_URL || 'https://github.com/DuarteSantos8/openGym'
export const REBRANDED = APP_NAME !== UPSTREAM_NAME

// CJK characters and full-width punctuation: no space goes between them and a CJK name.
const CJK = /[　-〿㐀-鿿＀-￯“”‘’]/
const CJK_NAME = CJK.test(APP_NAME)

/**
 * The UI string with the product name swapped in. A path such as Documents/openGym is a real
 * folder name and stays. When the new name is CJK, the spaces that Latin-in-CJK typesetting puts
 * around "openGym" go with it ("使用 openGym 制作" → "使用嘉园制作"), next to Latin text they stay
 * ("更新到 openGym v{0}" → "更新到嘉园 v{0}").
 */
export function brand(s) {
  if (!REBRANDED || typeof s !== 'string' || !s.includes(UPSTREAM_NAME)) return s
  return s.replace(/( ?)(?<![/\w])openGym(?![\w/])( ?)/g, (m, before, after, at, str) => {
    if (!CJK_NAME) return before + APP_NAME + after
    const prev = str[at - 1], next = str[at + m.length]
    return (before && prev && !CJK.test(prev) ? ' ' : '') + APP_NAME + (after && next && !CJK.test(next) ? ' ' : '')
  })
}
