// 外部リンクを開く前の確認ダイアログの状態（Promise ベース）。
// 危険な選択（外部アプリ起動）を伴うため、Chromium のガイドライン
// （Security Considerations for Browser UI）に倣い次の防御を行う:
//  - プライマリ（[はい]）はポインタ操作のみ。キーボード（Enter 等）では発動させない（keyjacking 対策）。
//  - 表示直後の一定時間（約 500ms）はプライマリを無効化する（clickjacking 対策）。
//  - セカンダリ（[いいえ]）は Esc でも実行できる（安全側の既定）。
// 実装/挙動: docs/アーキテクチャ・画面設計.md §5.11

class LinkDialogStore {
  open = $state(false)
  url = $state('')

  #resolve: ((ok: boolean) => void) | null = null

  /** url を開いてよいか確認する。許可で true、拒否で false を返す。 */
  confirm(url: string): Promise<boolean> {
    this.url = url
    this.open = true
    return new Promise<boolean>((resolve) => {
      this.#resolve = resolve
    })
  }

  /** [はい]（開く）。 */
  accept(): void {
    this.#close(true)
  }

  /** [いいえ]（開かない）。 */
  reject(): void {
    this.#close(false)
  }

  #close(ok: boolean): void {
    this.open = false
    const resolve = this.#resolve
    this.#resolve = null
    resolve?.(ok)
  }
}

export const linkDialog = new LinkDialogStore()
