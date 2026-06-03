<script lang="ts">
  import { tick } from 'svelte'
  import { renderMarkdown, runMermaid } from '../markdown/renderer'
  import { styleStore } from '../style/style.svelte'
  import { profileToVars, varsToStyleString } from '../style/profile'
  import '../styles/markdown.css'

  // 閲覧モードのプレビュー。source（Markdown 文字列）を描画する。
  let { source = '' }: { source?: string } = $props()

  let container = $state<HTMLElement | undefined>(undefined)
  let html = $state('')

  // アクティブプロファイルから CSS 変数を生成して適用（背景・配色・フォント等）
  const varsStyle = $derived(varsToStyleString(profileToVars(styleStore.active)))

  // source とテーマ（colorScheme）に依存して再描画。
  // テーマ変更時は mermaid を新テーマで描き直すため html を作り直す。
  $effect(() => {
    const src = source
    const scheme = styleStore.active.colorScheme
    // colorScheme が変わったら HTML 文字列も必ず変化させ、{@html} の再描画
    // → mermaid プレースホルダ再生成 → 新テーマで再描画 を確実に行う。
    html = renderMarkdown(src) + `<!--markmiru-scheme:${scheme}-->`
    tick().then(() => {
      if (container) runMermaid(container, scheme)
    })
  })
</script>

<!-- スクロールは全幅の外側コンテナ1か所に集約。CSS 変数はここに適用（子に継承）。 -->
<div class="preview-scroll" style={varsStyle}>
  <div class="markdown-body" bind:this={container}>
    {@html html}
  </div>
</div>
