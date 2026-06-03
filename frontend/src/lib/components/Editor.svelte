<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { EditorView, basicSetup } from 'codemirror'
  import { markdown } from '@codemirror/lang-markdown'
  import { Compartment, type Extension } from '@codemirror/state'
  import { oneDark } from '@codemirror/theme-one-dark'
  import { styleStore } from '../style/style.svelte'
  import type { ColorScheme } from '../style/profile'

  // ソースモードのエディタ（CodeMirror 6）。設計: docs/スタイル設定設計.md §9
  //   控えめな Markdown 構文ハイライト / 行番号 / 行の折り返し（ソフトラップ）/ 等幅フォント。
  //   配色テーマは本文プロファイルの colorScheme に連動（light=既定 / dark=one-dark）。
  let { value = '', onChange }: { value?: string; onChange?: (v: string) => void } = $props()

  let host: HTMLDivElement
  let view: EditorView | undefined
  const themeComp = new Compartment()

  function themeExt(scheme: ColorScheme): Extension {
    return scheme === 'dark' ? oneDark : []
  }

  onMount(() => {
    view = new EditorView({
      doc: value,
      parent: host,
      extensions: [
        basicSetup, // 行番号・履歴・括弧対応など一式
        markdown(), // Markdown 構文ハイライト
        EditorView.lineWrapping, // 行の折り返し（ソフトラップ）
        themeComp.of(themeExt(styleStore.active.colorScheme)),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) onChange?.(u.state.doc.toString())
        })
      ]
    })
  })

  onDestroy(() => view?.destroy())

  // 外部から value が変化した場合に同期（タブ切替時など）
  $effect(() => {
    const v = value
    if (view && v !== view.state.doc.toString()) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: v } })
    }
  })

  // テーマを colorScheme に連動
  $effect(() => {
    const scheme = styleStore.active.colorScheme
    if (view) {
      view.dispatch({ effects: themeComp.reconfigure(themeExt(scheme)) })
    }
  })
</script>

<div class="editor" bind:this={host}></div>

<style>
  .editor {
    height: 100%;
  }
  .editor :global(.cm-editor) {
    height: 100%;
  }
  .editor :global(.cm-scroller) {
    font-family: "Noto Sans Mono", "Noto Sans JP", ui-monospace, SFMono-Regular, Consolas, monospace;
  }
</style>
