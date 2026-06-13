// 危険な選択を伴う確認ダイアログの状態（Promise ベース・汎用）。
// 外部リンクを開く／外部画像を読み込む など、ユーザーにリスクのある選択をさせる場面で使う。
// Chromium のガイドライン（Security Considerations for Browser UI）に倣った防御を行う:
//  - 危険側（accept）はポインタ操作のみ。Enter/Space では発動させない（keyjacking 対策）。
//  - 表示直後の一定時間（約 500ms）は危険側を無効化する（clickjacking 対策＝起動遅延）。
//  - 安全側（reject）は Esc でも実行でき、初期フォーカスも安全側に置く。
// 実装/挙動: docs/アーキテクチャ・画面設計.md §5.11

export interface RiskyConfirmOptions {
  title: string
  message: string
  /** 追加で目立たせて表示する詳細（URL など）。省略可。 */
  detail?: string
  /** 危険側ボタンのラベル（例: 「はい」「表示する」）。 */
  acceptLabel: string
  /** 安全側ボタンのラベル（例: 「いいえ」「表示しない」）。 */
  rejectLabel: string
}

class RiskyDialogStore {
  open = $state(false)
  title = $state('')
  message = $state('')
  detail = $state('')
  acceptLabel = $state('')
  rejectLabel = $state('')

  #resolve: ((ok: boolean) => void) | null = null

  /** 確認する。危険側（accept）を選んだら true、安全側（reject）なら false を返す。 */
  confirm(opts: RiskyConfirmOptions): Promise<boolean> {
    this.title = opts.title
    this.message = opts.message
    this.detail = opts.detail ?? ''
    this.acceptLabel = opts.acceptLabel
    this.rejectLabel = opts.rejectLabel
    this.open = true
    return new Promise<boolean>((resolve) => {
      this.#resolve = resolve
    })
  }

  /** 危険側を選ぶ。 */
  accept(): void {
    this.#close(true)
  }

  /** 安全側を選ぶ。 */
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

export const riskyDialog = new RiskyDialogStore()
