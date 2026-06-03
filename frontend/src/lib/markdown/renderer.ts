import MarkdownIt from 'markdown-it'
import taskLists from 'markdown-it-task-lists'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'
import mermaid from 'mermaid'
import type { ColorScheme } from '../style/profile'

// 閲覧モードの Markdown レンダリングパイプライン
// 設計: docs/アーキテクチャ・画面設計.md §3
//   markdown-it（GFM）→ highlight.js / mermaid プレースホルダ
//   → DOMPurify でサニタイズ → DOM 反映後に mermaid.run() で図を描画

let currentMermaidTheme = ''
function ensureMermaid(theme: 'default' | 'dark'): void {
  if (currentMermaidTheme === theme) return
  // securityLevel: 'strict' で未知ソースでも安全側に倒す
  mermaid.initialize({ startOnLoad: false, theme, securityLevel: 'strict' })
  currentMermaidTheme = theme
}

const md: MarkdownIt = new MarkdownIt({
  html: true, // 生 HTML は許可するが、後段の DOMPurify で無害化する
  linkify: true,
  typographer: false,
  highlight(code: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(code, { language: lang }).value}</code></pre>`
      } catch {
        /* 失敗時はエスケープのみ */
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(code)}</code></pre>`
  }
})

// GFM チェックリスト
md.use(taskLists, { enabled: true, label: true })

// ```mermaid フェンスは描画用プレースホルダとして出力（描画は DOM 反映後）
const defaultFence = md.renderer.rules.fence!
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const info = tokens[idx].info.trim().toLowerCase()
  if (info === 'mermaid') {
    return `<pre class="mermaid">${md.utils.escapeHtml(tokens[idx].content)}</pre>`
  }
  return defaultFence(tokens, idx, options, env, self)
}

/** Markdown を安全な HTML に変換する（mermaid はプレースホルダのまま返る）。 */
export function renderMarkdown(src: string): string {
  const rawHtml = md.render(src ?? '')
  // 安全な HTML は許可しつつ、script 等の危険要素のみ除去
  return DOMPurify.sanitize(rawHtml)
}

/** コンテナ内の mermaid プレースホルダ（pre.mermaid）を SVG に描画する。HTML 反映後に呼ぶ。
 *  colorScheme に応じてテーマ（light=default / dark=dark）を切り替える。 */
export async function runMermaid(container: HTMLElement, scheme: ColorScheme = 'light'): Promise<void> {
  const nodes = Array.from(container.querySelectorAll<HTMLElement>('pre.mermaid'))
  if (nodes.length === 0) return
  ensureMermaid(scheme === 'dark' ? 'dark' : 'default')
  try {
    await mermaid.run({ nodes })
  } catch (err) {
    console.error('mermaid render error:', err)
  }
}
