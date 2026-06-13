<script lang="ts">
  import { tick, onMount } from 'svelte'
  import { renderMarkdown, runMermaid, resolveLocalImages } from '../markdown/renderer'
  import { styleStore } from '../style/style.svelte'
  import { styleToVars, varsToStyleString } from '../style/styleDef'
  import { tabsStore } from '../stores/tabs.svelte'
  import { uiStore } from '../stores/ui.svelte'
  import { dialogStore } from '../dialog.svelte'
  import '../styles/markdown.css'

  // 閲覧モードのプレビュー。source（Markdown 文字列）を描画する。
  // fileDir: 開いているファイルの親ディレクトリ（相対パス画像の解決に使用）。空なら画像解決スキップ。
  // remoteImagePolicy: リモート画像の表示可否（未確認なら遮断してレンダリングし、初回に確認する）。
  let {
    source = '',
    tabId = '',
    fileName = '',
    fileDir = '',
    remoteImagePolicy
  }: {
    source?: string
    tabId?: string
    fileName?: string
    fileDir?: string
    remoteImagePolicy?: 'allow' | 'block'
  } = $props()

  let container = $state<HTMLElement | undefined>(undefined)
  let html = $state('')

  // 同一タブで確認ダイアログが多重に開かないようにするガード。
  let confirmingId: string | null = null

  // アクティブスタイルから CSS 変数を生成して適用（背景・配色・フォント等）
  const varsStyle = $derived(varsToStyleString(styleToVars(styleStore.active)))

  // 本文のみを選択する（右クリックメニュー「すべて選択」および Ctrl+A と共通）。
  function selectAllBody(): void {
    if (!container) return
    const range = document.createRange()
    range.selectNodeContents(container)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  }

  // 閲覧モードのコピーは書式を捨てプレーンテキストのみにする（メニューのコピーと挙動を揃える）。
  function onCopy(e: ClipboardEvent): void {
    const selection = window.getSelection()
    const text = selection?.toString() ?? ''
    if (!text) return
    // 選択が本文内のときのみ介入する（他所の選択には触れない）。
    if (container && selection?.anchorNode && !container.contains(selection.anchorNode)) return
    e.preventDefault()
    e.clipboardData?.setData('text/plain', text)
  }

  // Ctrl+A（閲覧モード）は本文のみを対象にする（ブラウザ既定のページ全体選択ではなく）。
  function onKeydown(e: KeyboardEvent): void {
    if (!((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey)) return
    if (e.key !== 'a' && e.key !== 'A') return
    const t = e.target as HTMLElement | null
    if (t?.closest('input, textarea, [contenteditable="true"]')) return // 入力欄では既定動作
    e.preventDefault()
    selectAllBody()
  }

  // Preview は閲覧モードのアクティブタブのみマウントされるため、購読はその間だけ有効。
  onMount(() => {
    window.addEventListener('copy', onCopy)
    window.addEventListener('keydown', onKeydown)
    return () => {
      window.removeEventListener('copy', onCopy)
      window.removeEventListener('keydown', onKeydown)
    }
  })

  // source・テーマ・リモート画像ポリシーに依存して再描画。
  $effect(() => {
    const src = source
    const scheme = styleStore.active.colorScheme
    const policy = remoteImagePolicy
    const id = tabId
    const dir = fileDir
    // 未確認（undefined）または 'block' の間はリモート画像を読み込まない。
    const result = renderMarkdown(src, { allowRemoteImages: policy === 'allow' })
    // colorScheme が変わったら HTML 文字列も必ず変化させ、{@html} の再描画
    // → mermaid プレースホルダ再生成 → 新テーマで再描画 を確実に行う。
    html = result.html + `<!--markmiru-scheme:${scheme}-->`
    tick().then(() => {
      if (!container) return
      void runMermaid(container, scheme)
      void resolveLocalImages(container, dir)
    })
    // リモート画像を含み未確認の場合、ファイルごとに一度だけ表示可否を確認する。
    // セッション復元中（restoring）は commands.restoreSession が一括処理するためスキップ。
    if (result.hasRemoteImages && policy === undefined && id && !uiStore.restoring) {
      void confirmRemoteImages(id)
    }
  })

  async function confirmRemoteImages(id: string): Promise<void> {
    if (confirmingId === id) return
    confirmingId = id
    try {
      const choice = await dialogStore.confirmRemoteImages(fileName || '無題')
      tabsStore.setRemoteImagePolicy(id, choice)
    } finally {
      confirmingId = null
    }
  }
</script>

<!-- スクロールは全幅の外側コンテナ1か所に集約。CSS 変数はここに適用（子に継承）。 -->
<div class="preview-scroll" style={varsStyle}>
  <div class="markdown-body" bind:this={container}>
    {@html html}
  </div>
</div>
