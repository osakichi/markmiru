// アクティブなスタイルの管理（Svelte 5 runes）。
// 複製して編集する方式（プリセットは雛形のまま保持）。永続化は config。
import { PRESETS, normalizeStyle, baseStyleName, type Style, type HeadingStyle } from './styleDef'

let counter = 0
function newId(): string {
  counter += 1
  return `user-${Date.now()}-${counter}`
}

class StyleStore {
  styles = $state<Style[]>(PRESETS.map((p) => structuredClone(p)))
  activeId = $state<string>('light')

  get active(): Style {
    return this.styles.find((p) => p.id === this.activeId) ?? this.styles[0]
  }

  /** 永続化対象（プリセットを除くユーザースタイル）。 */
  get userStyles(): Style[] {
    return this.styles.filter((p) => !p.builtin)
  }

  setActive(id: string): void {
    this.activeId = id
  }

  /** name が既存（exceptId 以外）と重複するか。前後空白を無視して厳密一致で判定する。 */
  nameTaken(name: string, exceptId?: string): boolean {
    const n = name.trim()
    return this.styles.some((p) => p.id !== exceptId && p.name.trim() === n)
  }

  /** name で検索する（インポート時の重複判定に使う。前後空白を無視）。 */
  findByName(name: string): Style | undefined {
    const n = name.trim()
    return this.styles.find((p) => p.name.trim() === n)
  }

  /** base を起点に、既存と衝突しない一意な名前を返す（必要なら「 2」「 3」…を付与）。 */
  uniqueName(base: string, exceptId?: string): string {
    const b = base.trim() || 'スタイル'
    if (!this.nameTaken(b, exceptId)) return b
    let i = 2
    while (this.nameTaken(`${b} ${i}`, exceptId)) i++
    return `${b} ${i}`
  }

  /** アクティブなスタイルを複製して編集可能なユーザースタイルにし、アクティブ化する。 */
  duplicateActive(): Style {
    const src = this.active
    const snap = $state.snapshot(src) as Style
    const name = this.uniqueName(`${baseStyleName(src.name)} のコピー`)
    const copy: Style = { ...snap, id: newId(), name, builtin: false }
    this.styles.push(copy)
    this.activeId = copy.id
    return copy
  }

  /**
   * インポートしたスタイルを新規ユーザースタイルとして追加し、アクティブ化する。
   * ID は常に新規採番、builtin は必ず false。`rename` のときは名前を一意化する
   * （別名で追加・プリセット名との衝突回避）。
   */
  addImported(style: Style, opts?: { rename?: boolean }): Style {
    const name = opts?.rename ? this.uniqueName(style.name) : style.name.trim()
    const copy: Style = { ...style, id: newId(), name, builtin: false }
    this.styles.push(copy)
    this.activeId = copy.id
    return copy
  }

  /**
   * インポートで既存ユーザースタイルを上書きする（ID は保持）。アクティブ化する。
   * builtin（プリセット）や不在 ID は対象外（何もしない）。
   */
  overwriteImported(id: string, style: Style): void {
    const idx = this.styles.findIndex((p) => p.id === id)
    if (idx < 0 || this.styles[idx].builtin) return
    this.styles[idx] = { ...style, id, name: style.name.trim(), builtin: false }
    this.activeId = id
  }

  /** アクティブなユーザースタイルのフィールドを更新（builtin は変更しない）。 */
  updateActive(patch: Partial<Style>): void {
    const p = this.active
    if (p.builtin) return
    Object.assign(p, patch)
  }

  /** アクティブなユーザースタイルの見出し（h1〜h6）を更新。 */
  updateActiveHeading(index: number, patch: Partial<HeadingStyle>): void {
    const p = this.active
    if (p.builtin) return
    const h = p.headings[index]
    if (h) Object.assign(h, patch)
  }

  /**
   * ユーザースタイルを改名する。空・重複（プリセット含む全スタイルで一意）は拒否し false を返す。
   * 成功時は前後空白を除いた名前を適用して true を返す。
   */
  rename(id: string, name: string): boolean {
    const p = this.styles.find((x) => x.id === id)
    if (!p || p.builtin) return false
    const n = name.trim()
    if (!n || this.nameTaken(n, id)) return false
    p.name = n
    return true
  }

  remove(id: string): void {
    const p = this.styles.find((x) => x.id === id)
    if (!p || p.builtin) return
    this.styles = this.styles.filter((x) => x.id !== id)
    if (this.activeId === id) this.activeId = 'light'
  }

  /** 復元時：保存されていたユーザースタイルとアクティブ ID を反映（プリセットは保持）。 */
  loadUserStyles(userStyles: Style[], activeId: string): void {
    const presets = this.styles.filter((p) => p.builtin)
    const normalized = userStyles.map((p) => normalizeStyle(p))
    this.styles = [...presets, ...normalized]
    if (activeId && this.styles.some((p) => p.id === activeId)) {
      this.activeId = activeId
    }
  }
}

export const styleStore = new StyleStore()
