// 編集モードの CodeMirror EditorView を、コンポーネント外（右クリックメニュー等）から
// 参照するための受け渡し口。アクティブな編集タブは常に1つなので単一の参照で足りる。
import type { EditorView } from 'codemirror'

let activeView: EditorView | null = null

/** Editor.svelte がマウント時に登録、破棄時に null を渡す。 */
export function setEditorView(view: EditorView | null): void {
  activeView = view
}

/** 現在アクティブな EditorView（編集モードでなければ null）。 */
export function getEditorView(): EditorView | null {
  return activeView
}
