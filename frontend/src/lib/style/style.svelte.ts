// アクティブなスタイルプロファイルの管理（Svelte 5 runes）。
// 複製して編集する方式（プリセットは雛形のまま保持）。永続化は config。
import { PRESETS, normalizeProfile, type StyleProfile, type HeadingStyle } from './profile'

let counter = 0
function newId(): string {
  counter += 1
  return `user-${Date.now()}-${counter}`
}

class StyleStore {
  profiles = $state<StyleProfile[]>(PRESETS.map((p) => structuredClone(p)))
  activeId = $state<string>('light')

  get active(): StyleProfile {
    return this.profiles.find((p) => p.id === this.activeId) ?? this.profiles[0]
  }

  /** 永続化対象（プリセットを除くユーザープロファイル）。 */
  get userProfiles(): StyleProfile[] {
    return this.profiles.filter((p) => !p.builtin)
  }

  setActive(id: string): void {
    this.activeId = id
  }

  /** アクティブプロファイルを複製して編集可能なユーザープロファイルにし、アクティブ化する。 */
  duplicateActive(): StyleProfile {
    const src = this.active
    const snap = $state.snapshot(src) as StyleProfile
    const copy: StyleProfile = { ...snap, id: newId(), name: `${src.name} のコピー`, builtin: false }
    this.profiles.push(copy)
    this.activeId = copy.id
    return copy
  }

  /** アクティブなユーザープロファイルのフィールドを更新（builtin は変更しない）。 */
  updateActive(patch: Partial<StyleProfile>): void {
    const p = this.active
    if (p.builtin) return
    Object.assign(p, patch)
  }

  /** アクティブなユーザープロファイルの見出し（h1〜h6）を更新。 */
  updateActiveHeading(index: number, patch: Partial<HeadingStyle>): void {
    const p = this.active
    if (p.builtin) return
    const h = p.headings[index]
    if (h) Object.assign(h, patch)
  }

  rename(id: string, name: string): void {
    const p = this.profiles.find((x) => x.id === id)
    if (p && !p.builtin) p.name = name
  }

  remove(id: string): void {
    const p = this.profiles.find((x) => x.id === id)
    if (!p || p.builtin) return
    this.profiles = this.profiles.filter((x) => x.id !== id)
    if (this.activeId === id) this.activeId = 'light'
  }

  /** 復元時：保存されていたユーザープロファイルとアクティブ ID を反映（プリセットは保持）。 */
  loadUserProfiles(userProfiles: StyleProfile[], activeId: string): void {
    const presets = this.profiles.filter((p) => p.builtin)
    const normalized = userProfiles.map((p) => normalizeProfile(p))
    this.profiles = [...presets, ...normalized]
    if (activeId && this.profiles.some((p) => p.id === activeId)) {
      this.activeId = activeId
    }
  }
}

export const styleStore = new StyleStore()
