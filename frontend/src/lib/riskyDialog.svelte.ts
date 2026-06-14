// 危険な選択を伴う確認ダイアログの状態（Promise ベース・汎用）。
// 外部リンクを開く／外部画像を読み込む など、ユーザーにリスクのある選択をさせる場面で使う。
// Chromium のガイドライン（Security Considerations for Browser UI）に倣った防御を行う:
//  - 危険側（accept）はポインタ操作のみ。Enter/Space では発動させない（keyjacking 対策）。
//  - 表示直後の一定時間（約 500ms）は危険側を無効化する（clickjacking 対策＝起動遅延）。
//  - 安全側（reject）は Esc でも実行でき、初期フォーカスも安全側に置く。
// 実装/挙動: docs/アーキテクチャ・画面設計.md §5.11

import { PromiseDialog } from './promiseDialog.svelte'

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

class RiskyDialogStore extends PromiseDialog<boolean> {
  title = $state('')
  message = $state('')
  detail = $state('')
  acceptLabel = $state('')
  rejectLabel = $state('')

  /** 確認する。危険側（accept）を選んだら true、安全側（reject）なら false を返す。 */
  confirm(opts: RiskyConfirmOptions): Promise<boolean> {
    this.title = opts.title
    this.message = opts.message
    this.detail = opts.detail ?? ''
    this.acceptLabel = opts.acceptLabel
    this.rejectLabel = opts.rejectLabel
    return this.begin()
  }

  /** 危険側を選ぶ。 */
  accept(): void {
    this.finish(true)
  }

  /** 安全側を選ぶ。 */
  reject(): void {
    this.finish(false)
  }
}

export const riskyDialog = new RiskyDialogStore()
