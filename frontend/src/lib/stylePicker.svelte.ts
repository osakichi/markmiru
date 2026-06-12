// スタイルのエクスポート対象を選ぶピッカーの状態（Promise ベース）。
// プリセット（builtin）は一覧に出すが選択不可（グレー表示）。設計: docs/スタイル設定設計.md §6

export interface PickerItem {
  id: string
  name: string
  builtin: boolean
}

class StylePickerStore {
  open = $state(false)
  items = $state<PickerItem[]>([])
  selectedId = $state<string | null>(null)

  #resolve: ((value: string | null) => void) | null = null

  /** スタイル一覧から1件を選ばせる。builtin（プリセット）は選択不可。キャンセルは null。 */
  pick(items: PickerItem[]): Promise<string | null> {
    this.items = items
    this.selectedId = items.find((i) => !i.builtin)?.id ?? null
    this.open = true
    return new Promise<string | null>((resolve) => {
      this.#resolve = resolve
    })
  }

  select(id: string): void {
    this.selectedId = id
  }

  /** 選択を確定して Promise を解決する。 */
  confirm(): void {
    this.#close(this.selectedId)
  }

  /** キャンセルして null で解決する。 */
  cancel(): void {
    this.#close(null)
  }

  #close(value: string | null): void {
    this.open = false
    const resolve = this.#resolve
    this.#resolve = null
    resolve?.(value)
  }
}

export const stylePicker = new StylePickerStore()
