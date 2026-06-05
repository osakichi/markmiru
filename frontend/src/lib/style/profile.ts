// 閲覧モードのスタイルプロファイル（構造化データ）と CSS 変数への変換。
// 設計: docs/スタイル設定設計.md §1, §2, §6。Markdown 記法ごとに項目を持つ。

export type ColorScheme = 'light' | 'dark'
export type LinkUnderline = 'always' | 'hover' | 'none'
export type MarkerPosition = 'outside' | 'inside'

/** 見出し h1〜h6 各レベルのスタイル。 */
export interface HeadingStyle {
  fontFamily: string
  fontSize: number // px
  fontWeight: number // 100〜900
  color: string
  marginTop: number // em
  marginBottom: number // em
  border: boolean // 下線（水平線）の有無
}

export interface StyleProfile {
  id: string
  name: string
  /** 標準プリセット（雛形）か。true は直接編集不可（複製して編集）。 */
  builtin: boolean
  /** コード/mermaid/エディタ テーマの連動に使う。 */
  colorScheme: ColorScheme

  // 本文
  fontFamily: string
  fontSize: number // px
  lineHeight: number
  color: string
  background: string
  maxWidth: number    // px
  maxWidthFull: boolean // true のときウィンドウ幅に追従（max-width: none）

  // 見出し（h1〜h6）
  headings: HeadingStyle[] // 長さ6（index0 = h1）

  // リンク
  linkColor: string
  linkUnderline: LinkUnderline

  // リスト
  listIndent: number // px
  markerColor: string
  markerSize: number // em
  markerPosition: MarkerPosition

  // 引用
  quoteColor: string
  quoteBg: string
  quoteBorder: string
  quoteBorderWidth: number // px
  quoteItalic: boolean

  // コード
  codeFontFamily: string
  codeBlockBg: string // コードブロック背景
  codeFontSize: number // px（コードブロック）
  codeBg: string // インラインコード背景

  // 水平線
  hrColor: string
  hrThickness: number // px

  // 表
  borderColor: string
  tableHeaderBg: string
  rowOddBg: string
  rowEvenBg: string

  /** 上級者向けの上書き CSS（.markdown-body 配下を対象に記述）。 */
  customCSS: string
}

// 同梱フォント（@fontsource）を優先。日本語の等幅は Noto Sans Mono（ラテン）＋ Noto Sans JP フォールバック（方式A）。
export const SANS =
  '"Noto Sans JP", -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", Meiryo, sans-serif'
export const SERIF = '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif'
export const MONO =
  '"Noto Sans Mono", "Noto Sans JP", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
const SYSTEM_SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", Meiryo, sans-serif'

/** 設定パネルの本文/見出しフォント選択肢。 */
export const FONT_OPTIONS = [
  { label: 'Noto Sans JP（ゴシック）', value: SANS },
  { label: 'Noto Serif JP（明朝）', value: SERIF },
  { label: 'システム', value: SYSTEM_SANS }
]

/** 設定パネルの等幅フォント選択肢。 */
export const CODE_FONT_OPTIONS = [
  { label: 'Noto Sans Mono', value: MONO },
  { label: 'システム等幅', value: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }
]

/** 既定の見出し定義（色を与えて生成）。 */
function defaultHeadings(color: string): HeadingStyle[] {
  const sizes = [32, 24, 20, 16, 14, 13]
  return sizes.map((fontSize, i) => ({
    fontFamily: SANS,
    fontSize,
    fontWeight: 600,
    color,
    marginTop: 1.5,
    marginBottom: 0.6,
    border: i < 2 // h1, h2 に下線
  }))
}

/** CSS 変数への変換。プレビュー要素に適用する。 */
export function profileToVars(p: StyleProfile): Record<string, string> {
  const vars: Record<string, string> = {
    '--md-font': p.fontFamily,
    '--md-font-size': `${p.fontSize}px`,
    '--md-line-height': `${p.lineHeight}`,
    '--md-color': p.color,
    '--md-bg': p.background,
    '--md-max-width': p.maxWidthFull ? 'none' : `${p.maxWidth}px`,
    '--md-link-color': p.linkColor,
    '--md-link-deco': p.linkUnderline === 'always' ? 'underline' : 'none',
    '--md-link-deco-hover': p.linkUnderline === 'none' ? 'none' : 'underline',
    '--md-list-indent': `${p.listIndent}px`,
    '--md-marker-color': p.markerColor,
    '--md-marker-size': `${p.markerSize}em`,
    '--md-list-position': p.markerPosition,
    '--md-quote-color': p.quoteColor,
    '--md-quote-bg': p.quoteBg,
    '--md-quote-border': p.quoteBorder,
    '--md-quote-border-width': `${p.quoteBorderWidth}px`,
    '--md-quote-style': p.quoteItalic ? 'italic' : 'normal',
    '--md-code-font': p.codeFontFamily,
    '--md-pre-bg': p.codeBlockBg,
    '--md-code-size': `${p.codeFontSize}px`,
    '--md-code-bg': p.codeBg,
    '--md-hr-color': p.hrColor,
    '--md-hr-thickness': `${p.hrThickness}px`,
    '--md-border': p.borderColor,
    '--md-th-bg': p.tableHeaderBg,
    '--md-row-odd-bg': p.rowOddBg,
    '--md-row-even-bg': p.rowEvenBg
  }
  p.headings.forEach((h, i) => {
    const n = i + 1
    vars[`--md-h${n}-font`] = h.fontFamily
    vars[`--md-h${n}-size`] = `${h.fontSize}px`
    vars[`--md-h${n}-weight`] = `${h.fontWeight}`
    vars[`--md-h${n}-color`] = h.color
    vars[`--md-h${n}-mt`] = `${h.marginTop}em`
    vars[`--md-h${n}-mb`] = `${h.marginBottom}em`
    vars[`--md-h${n}-border`] = h.border ? `1px solid ${p.borderColor}` : 'none'
  })
  return vars
}

/** インライン style 文字列へ。 */
export function varsToStyleString(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(';')
}

// 標準プリセット（複製・編集できる雛形）。
export const PRESETS: StyleProfile[] = [
  {
    id: 'light',
    name: 'ライト',
    builtin: true,
    colorScheme: 'light',
    fontFamily: SANS,
    fontSize: 16,
    lineHeight: 1.7,
    color: '#24292f',
    background: '#ffffff',
    maxWidth: 820,
    maxWidthFull: false,
    headings: defaultHeadings('#1f2328'),
    linkColor: '#0969da',
    linkUnderline: 'hover',
    listIndent: 28,
    markerColor: '#24292f',
    markerSize: 1,
    markerPosition: 'outside',
    quoteColor: '#57606a',
    quoteBg: '#f6f8fa',
    quoteBorder: '#d0d7de',
    quoteBorderWidth: 4,
    quoteItalic: false,
    codeFontFamily: MONO,
    codeBlockBg: '#f6f8fa',
    codeFontSize: 14,
    codeBg: '#eff1f3',
    hrColor: '#d0d7de',
    hrThickness: 1,
    borderColor: '#d0d7de',
    tableHeaderBg: '#f6f8fa',
    rowOddBg: 'transparent',
    rowEvenBg: '#f6f8fa',
    customCSS: ''
  },
  {
    id: 'dark',
    name: 'ダーク',
    builtin: true,
    colorScheme: 'dark',
    fontFamily: SANS,
    fontSize: 16,
    lineHeight: 1.7,
    color: '#c9d1d9',
    background: '#0d1117',
    maxWidth: 820,
    maxWidthFull: false,
    headings: defaultHeadings('#e6edf3'),
    linkColor: '#4493f8',
    linkUnderline: 'hover',
    listIndent: 28,
    markerColor: '#c9d1d9',
    markerSize: 1,
    markerPosition: 'outside',
    quoteColor: '#8b949e',
    quoteBg: '#161b22',
    quoteBorder: '#30363d',
    quoteBorderWidth: 4,
    quoteItalic: false,
    codeFontFamily: MONO,
    codeBlockBg: '#161b22',
    codeFontSize: 14,
    codeBg: '#161b22',
    hrColor: '#30363d',
    hrThickness: 1,
    borderColor: '#30363d',
    tableHeaderBg: '#161b22',
    rowOddBg: 'transparent',
    rowEvenBg: '#161b22',
    customCSS: ''
  },
  {
    id: 'github',
    name: 'GitHub 風',
    builtin: true,
    colorScheme: 'light',
    fontFamily: SANS,
    fontSize: 16,
    lineHeight: 1.6,
    color: '#1f2328',
    background: '#ffffff',
    maxWidth: 980,
    maxWidthFull: false,
    headings: defaultHeadings('#1f2328'),
    linkColor: '#0969da',
    linkUnderline: 'hover',
    listIndent: 32,
    markerColor: '#1f2328',
    markerSize: 1,
    markerPosition: 'outside',
    quoteColor: '#59636e',
    quoteBg: '#ffffff',
    quoteBorder: '#d1d9e0',
    quoteBorderWidth: 4,
    quoteItalic: false,
    codeFontFamily: MONO,
    codeBlockBg: '#f6f8fa',
    codeFontSize: 14,
    codeBg: 'rgba(175,184,193,0.2)',
    hrColor: '#d1d9e0',
    hrThickness: 1,
    borderColor: '#d1d9e0',
    tableHeaderBg: '#f6f8fa',
    rowOddBg: 'transparent',
    rowEvenBg: '#f6f8fa',
    customCSS: ''
  },
  {
    id: 'sepia',
    name: 'セピア',
    builtin: true,
    colorScheme: 'light',
    fontFamily: SANS,
    fontSize: 17,
    lineHeight: 1.8,
    color: '#5b4636',
    background: '#f4ecd8',
    maxWidth: 760,
    maxWidthFull: false,
    headings: defaultHeadings('#43352a'),
    linkColor: '#8a5a2b',
    linkUnderline: 'hover',
    listIndent: 28,
    markerColor: '#5b4636',
    markerSize: 1,
    markerPosition: 'outside',
    quoteColor: '#6b5a47',
    quoteBg: '#ece0c8',
    quoteBorder: '#cbb994',
    quoteBorderWidth: 4,
    quoteItalic: false,
    codeFontFamily: MONO,
    codeBlockBg: '#ece0c8',
    codeFontSize: 14,
    codeBg: '#ece0c8',
    hrColor: '#cbb994',
    hrThickness: 1,
    borderColor: '#cbb994',
    tableHeaderBg: '#ece0c8',
    rowOddBg: 'transparent',
    rowEvenBg: '#e9dcc0',
    customCSS: ''
  }
]

/** 旧バージョンや欠損のあるプロファイルを既定値で補完して整形する（復元時の安全策）。 */
export function normalizeProfile(p: Partial<StyleProfile>): StyleProfile {
  const base = structuredClone(PRESETS[0]) // light を雛形に
  const merged = { ...base, ...p, builtin: false } as StyleProfile
  if (!Array.isArray(merged.headings) || merged.headings.length !== 6) {
    merged.headings = defaultHeadings(merged.color || base.color)
  }
  return merged
}
