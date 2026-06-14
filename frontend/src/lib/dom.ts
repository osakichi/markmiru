// 汎用 DOM ユーティリティ。

/** 要素の内容全体を選択する（本文の「すべて選択」用。閲覧モードのコピー対象を作る）。 */
export function selectElementContents(el: Element | null | undefined): void {
  if (!el) return
  const range = document.createRange()
  range.selectNodeContents(el)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
}
