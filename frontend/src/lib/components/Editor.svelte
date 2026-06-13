<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import {
    EditorView,
    keymap,
    lineNumbers,
    highlightActiveLine,
    highlightActiveLineGutter,
    highlightSpecialChars,
    drawSelection,
    dropCursor
  } from '@codemirror/view'
  import { EditorState, Compartment, type Extension } from '@codemirror/state'
  import { history, historyKeymap, defaultKeymap } from '@codemirror/commands'
  import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, indentOnInput } from '@codemirror/language'
  import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
  import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
  import { markdown } from '@codemirror/lang-markdown'
  import { oneDark } from '@codemirror/theme-one-dark'
  import { styleStore } from '../style/style.svelte'
  import { setEditorView, getEditorView } from '../editorBridge'
  import type { ColorScheme } from '../style/styleDef'

  // 編集モードのエディタ（CodeMirror 6）。設計: docs/スタイル設定設計.md §9
  //   控えめな Markdown 構文ハイライト / 行番号 / 行の折り返し（ソフトラップ）/ 等幅フォント。
  //   配色テーマは本文スタイルの colorScheme に連動（light=既定 / dark=one-dark）。
  //   キーボードとメニューの挙動を揃えるため、CodeMirror 固有の拡張（複数選択・選択なし時の
  //   行コピー）は無効化している（basicSetup は使わず、必要な拡張のみを自前で構成）。
  let { value = '', onChange }: { value?: string; onChange?: (v: string) => void } = $props()

  let host: HTMLDivElement
  let view: EditorView | undefined
  const themeComp = new Compartment()

  function themeExt(scheme: ColorScheme): Extension {
    return scheme === 'dark' ? oneDark : []
  }

  // 選択が空のとき、CodeMirror 既定の「現在行コピー/切り取り」を抑止する
  // （メニュー側はコピー/切り取りを無効にしているため、挙動を揃える）。
  function suppressEmptyClipboard(event: ClipboardEvent, v: EditorView): boolean {
    if (v.state.selection.main.empty) {
      event.preventDefault()
      return true // 既定処理を抑止
    }
    return false
  }

  onMount(() => {
    view = new EditorView({
      doc: value,
      parent: host,
      extensions: [
        // basicSetup 相当のうち、複数選択（rectangularSelection / allowMultipleSelections）と
        // 折りたたみ・自動補完・lint を除いた最小構成。検索（Ctrl+F）・undo/redo は維持。
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        drawSelection(),
        dropCursor(),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        EditorState.allowMultipleSelections.of(false), // 複数選択を無効化
        keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...searchKeymap, ...historyKeymap]),
        markdown(), // Markdown 構文ハイライト
        EditorView.lineWrapping, // 行の折り返し（ソフトラップ）
        EditorView.domEventHandlers({
          copy: (event, v) => suppressEmptyClipboard(event, v),
          cut: (event, v) => suppressEmptyClipboard(event, v)
        }),
        themeComp.of(themeExt(styleStore.active.colorScheme)),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) onChange?.(u.state.doc.toString())
        })
      ]
    })
    // 右クリックメニュー（切り取り/貼り付け等）から参照できるよう登録する。
    setEditorView(view)
  })

  onDestroy(() => {
    if (getEditorView() === view) setEditorView(null)
    view?.destroy()
  })

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
