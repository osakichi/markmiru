// UI 全体の状態（サイドバー開閉など）。設計: docs/アーキテクチャ・画面設計.md §2

class UiStore {
  /** サイドバー（開いているファイル一覧）の表示状態 */
  sidebarOpen = $state(true)

  /** セッション復元中（この間は設定の保存を抑止する） */
  restoring = $state(false)
  /** 終了処理中（タブを閉じる際の設定保存で前回セッションを上書きしないよう抑止する） */
  closing = $state(false)

  /** スタイル設定パネルの表示状態 */
  settingsOpen = $state(false)

  /** 印刷/PDF を「表示通り」に出すか（false=印刷向けに配色変換）。設計 §5.2 */
  printAsDisplayed = $state(false)

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen
  }

  openSettings(): void {
    this.settingsOpen = true
  }
  closeSettings(): void {
    this.settingsOpen = false
  }
}

export const uiStore = new UiStore()
