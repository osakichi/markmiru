// アプリ内モーダルダイアログの共通基底。
// 「open フラグ ＋ Promise の保持／解決」という定型を集約する。
// 各ダイアログストアはこれを継承し、表示用の状態（タイトル・選択肢等）と
// 公開メソッド（confirm/choose 等）だけを実装する。

export class PromiseDialog<T> {
  /** 表示中かどうか。各ダイアログコンポーネントが購読する。 */
  open = $state(false)

  #resolve: ((value: T) => void) | null = null

  /** ダイアログを開き、結果を待つ Promise を返す（サブクラスの公開メソッドから呼ぶ）。 */
  protected begin(): Promise<T> {
    this.open = true
    return new Promise<T>((resolve) => {
      this.#resolve = resolve
    })
  }

  /** ダイアログを閉じて結果を解決する（サブクラスのボタン操作から呼ぶ）。 */
  protected finish(value: T): void {
    this.open = false
    const resolve = this.#resolve
    this.#resolve = null
    resolve?.(value)
  }
}
