// コードブロックのシンタックスハイライト用テーマを colorScheme に連動させる。
// 設計: docs/スタイル設定設計.md §5.1
// highlight.js のテーマ CSS（.hljs セレクタ）は全体に効くため、アクティブな1つだけを
// <style> に注入して切り替える。テキストは Vite の ?inline で取得する。
import hljsLight from 'highlight.js/styles/github.css?inline'
import hljsDark from 'highlight.js/styles/github-dark.css?inline'
import type { ColorScheme } from './styleDef'

const STYLE_ID = 'markmiru-hljs-theme'

export function applyHighlightTheme(scheme: ColorScheme): void {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = STYLE_ID
    document.head.appendChild(el)
  }
  el.textContent = scheme === 'dark' ? hljsDark : hljsLight
}
