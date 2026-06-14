// アプリ内モーダルダイアログの状態。Promise ベースで選択結果を返す。
// Windows のネイティブ MessageDialog はカスタム3ボタンに非対応のため、
// 確認系はアプリ内モーダルで実装する（クロスプラットフォームでも一貫）。
import { PromiseDialog } from './promiseDialog.svelte'

export type SaveChoice = 'save' | 'discard' | 'cancel'
export type MissingChoice = 'retry' | 'skip'
export type ImportOverwriteChoice = 'overwrite' | 'addNew' | 'cancel'

interface DialogButton {
  label: string
  value: string
  primary?: boolean
}

class DialogStore extends PromiseDialog<string> {
  title = $state('')
  message = $state('')
  buttons = $state<DialogButton[]>([])

  #enterValue = ''
  #escValue = ''

  get enterValue(): string {
    return this.#enterValue
  }
  get escValue(): string {
    return this.#escValue
  }

  #show(opts: {
    title: string
    message: string
    buttons: DialogButton[]
    enterValue: string
    escValue: string
  }): Promise<string> {
    this.title = opts.title
    this.message = opts.message
    this.buttons = opts.buttons
    this.#enterValue = opts.enterValue
    this.#escValue = opts.escValue
    return this.begin()
  }

  /** 未保存タブ1件の保存確認（保存/保存しない/キャンセル）。 */
  confirmSave(fileName: string): Promise<SaveChoice> {
    return this.#show({
      title: '未保存の変更',
      message: `「${fileName}」には保存していない変更があります。保存しますか？`,
      buttons: [
        { label: '保存', value: 'save', primary: true },
        { label: '保存しない', value: 'discard' },
        { label: 'キャンセル', value: 'cancel' }
      ],
      enterValue: 'save',
      escValue: 'cancel'
    }) as Promise<SaveChoice>
  }

  /** セッション復元時、ファイルが見つからない場合の確認（再試行/スキップ）。 */
  confirmMissing(path: string): Promise<MissingChoice> {
    return this.#show({
      title: 'ファイルが見つかりません',
      message: `次のファイルを開けませんでした:\n${path}`,
      buttons: [
        { label: 'スキップ', value: 'skip', primary: true },
        { label: '再試行', value: 'retry' }
      ],
      enterValue: 'skip', // Enter=メイン（スキップ）
      escValue: 'retry'   // Esc=サブ（再試行）
    }) as Promise<MissingChoice>
  }

  /** インポート時、同名の既存スタイルがある場合の確認（上書き/別名で追加/キャンセル）。 */
  confirmImportOverwrite(name: string): Promise<ImportOverwriteChoice> {
    return this.#show({
      title: 'スタイルの上書き確認',
      message: `既に「${name}」が存在します。上書きしますか？\n「別名で追加」を選ぶと、別のスタイルとして取り込みます。`,
      buttons: [
        { label: '上書き', value: 'overwrite', primary: true },
        { label: '別名で追加', value: 'addNew' },
        { label: 'キャンセル', value: 'cancel' }
      ],
      enterValue: 'overwrite',
      escValue: 'cancel'
    }) as Promise<ImportOverwriteChoice>
  }

  /** 単一ボタン（OK）の通知ダイアログ。エラー等の伝達に使う。 */
  notify(title: string, message: string): Promise<void> {
    return this.#show({
      title,
      message,
      buttons: [{ label: 'OK', value: 'ok', primary: true }],
      enterValue: 'ok',
      escValue: 'ok'
    }).then(() => undefined)
  }

  /** ボタン選択時に呼ぶ。モーダルを閉じて Promise を解決する。 */
  choose(value: string): void {
    this.finish(value)
  }
}

export const dialogStore = new DialogStore()
