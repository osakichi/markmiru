<script lang="ts">
  import ColorField from './ColorField.svelte'
  import { styleStore } from '../style/style.svelte'
  import { uiStore } from '../stores/ui.svelte'
  import {
    FONT_OPTIONS,
    CODE_FONT_OPTIONS,
    type ColorScheme,
    type LinkUnderline,
    type MarkerPosition
  } from '../style/styleDef'

  // スタイル設定パネル。Markdown 記法ごとのセクションでアクティブスタイルを編集（ライブ反映）。
  // 標準プリセットは「複製して編集」。設計: docs/スタイル設定設計.md §2, §4
  const p = $derived(styleStore.active)
  const editable = $derived(!p.builtin)

  // スタイル名はバッファ編集し、確定（フォーカスアウト/Enter）時に一意性を検証する。
  // 空・重複（プリセット含む全スタイルで一意）は適用せず、現在名へ戻して警告を表示する。
  let draftName = $state('')
  let lastId = $state('')
  $effect(() => {
    if (p.id !== lastId) {
      lastId = p.id
      draftName = p.name
    }
  })
  const nameError = $derived.by(() => {
    if (!editable) return ''
    const n = draftName.trim()
    if (!n) return '名前を入力してください。'
    if (styleStore.nameTaken(n, p.id)) return 'この名前は既に使われています。'
    return ''
  })
  function commitName(): void {
    if (styleStore.rename(p.id, draftName)) {
      draftName = styleStore.active.name
    } else {
      draftName = p.name
    }
  }

  function num(e: Event): number {
    return Number((e.currentTarget as HTMLInputElement).value)
  }
  function val(e: Event): string {
    return (e.currentTarget as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value
  }
  function chk(e: Event): boolean {
    return (e.currentTarget as HTMLInputElement).checked
  }
</script>

{#if uiStore.settingsOpen}
  <div class="overlay">
    <div class="panel" role="dialog" aria-modal="true" aria-label="スタイル設定">
      <header>
        <strong>スタイル設定</strong>
        <span class="active-name">{p.name}</span>
        <span class="spacer"></span>
        <button onclick={() => uiStore.closeSettings()}>閉じる</button>
      </header>

      {#if !editable}
        <div class="banner">
          <span>標準プリセットは直接編集できません。複製して編集してください。</span>
          <button class="primary" onclick={() => styleStore.duplicateActive()}>複製して編集</button>
        </div>
      {:else}
        <div class="row">
          <span class="label">スタイル名</span>
          <input
            type="text"
            class:invalid={nameError}
            bind:value={draftName}
            onblur={commitName}
            onkeydown={(e) => {
              if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur()
            }}
          />
        </div>
        {#if nameError}
          <p class="name-error">{nameError}</p>
        {/if}
      {/if}

      <div class="body">
        <!-- 全体（本文） -->
        <section>
          <h4>全体（本文）</h4>
          <div class="row">
            <span class="label">カラースキーム（コード/図/エディタ連動）</span>
            <select value={p.colorScheme} disabled={!editable} onchange={(e) => styleStore.updateActive({ colorScheme: val(e) as ColorScheme })}>
              <option value="light">ライト</option>
              <option value="dark">ダーク</option>
            </select>
          </div>
          <div class="row">
            <span class="label">フォント</span>
            <select value={p.fontFamily} disabled={!editable} onchange={(e) => styleStore.updateActive({ fontFamily: val(e) })}>
              {#each FONT_OPTIONS as o (o.value)}<option value={o.value}>{o.label}</option>{/each}
            </select>
          </div>
          <div class="row">
            <span class="label">文字サイズ (px)</span>
            <input type="number" min="10" max="32" value={p.fontSize} disabled={!editable} oninput={(e) => styleStore.updateActive({ fontSize: num(e) })} />
          </div>
          <div class="row">
            <span class="label">行間</span>
            <input type="number" step="0.05" min="1" max="2.5" value={p.lineHeight} disabled={!editable} oninput={(e) => styleStore.updateActive({ lineHeight: num(e) })} />
          </div>
          <ColorField label="文字色" value={p.color} disabled={!editable} onChange={(v) => styleStore.updateActive({ color: v })} />
          <ColorField label="背景色" value={p.background} disabled={!editable} onChange={(v) => styleStore.updateActive({ background: v })} />
          <div class="row">
            <span class="label">本文の最大幅 (px)</span>
            <input type="number" min="480" max="1400" step="10" value={p.maxWidth} disabled={!editable || p.maxWidthFull} oninput={(e) => styleStore.updateActive({ maxWidth: num(e) })} />
          </div>
          <div class="row">
            <label class="checkbox-label">
              <input type="checkbox" checked={p.maxWidthFull} disabled={!editable} onchange={(e) => styleStore.updateActive({ maxWidthFull: (e.currentTarget as HTMLInputElement).checked })} />
              ウィンドウ幅に追従する
            </label>
          </div>
        </section>

        <!-- 見出し h1〜h6 -->
        <section>
          <h4>見出し（h1〜h6）</h4>
          {#each p.headings as h, i (i)}
            <details class="heading">
              <summary>見出し h{i + 1}</summary>
              <div class="row">
                <span class="label">フォント</span>
                <select value={h.fontFamily} disabled={!editable} onchange={(e) => styleStore.updateActiveHeading(i, { fontFamily: val(e) })}>
                  {#each FONT_OPTIONS as o (o.value)}<option value={o.value}>{o.label}</option>{/each}
                </select>
              </div>
              <div class="row">
                <span class="label">サイズ (px)</span>
                <input type="number" min="10" max="48" value={h.fontSize} disabled={!editable} oninput={(e) => styleStore.updateActiveHeading(i, { fontSize: num(e) })} />
              </div>
              <div class="row">
                <span class="label">太さ (100〜900)</span>
                <input type="number" min="100" max="900" step="100" value={h.fontWeight} disabled={!editable} oninput={(e) => styleStore.updateActiveHeading(i, { fontWeight: num(e) })} />
              </div>
              <ColorField label="色" value={h.color} disabled={!editable} onChange={(v) => styleStore.updateActiveHeading(i, { color: v })} />
              <div class="row">
                <span class="label">上マージン (em)</span>
                <input type="number" step="0.1" min="0" max="4" value={h.marginTop} disabled={!editable} oninput={(e) => styleStore.updateActiveHeading(i, { marginTop: num(e) })} />
              </div>
              <div class="row">
                <span class="label">下マージン (em)</span>
                <input type="number" step="0.1" min="0" max="4" value={h.marginBottom} disabled={!editable} oninput={(e) => styleStore.updateActiveHeading(i, { marginBottom: num(e) })} />
              </div>
              <div class="row">
                <span class="label">下線（水平線）</span>
                <input type="checkbox" checked={h.border} disabled={!editable} onchange={(e) => styleStore.updateActiveHeading(i, { border: chk(e) })} />
              </div>
            </details>
          {/each}
        </section>

        <!-- リンク -->
        <section>
          <h4>リンク</h4>
          <ColorField label="色" value={p.linkColor} disabled={!editable} onChange={(v) => styleStore.updateActive({ linkColor: v })} />
          <div class="row">
            <span class="label">下線</span>
            <select value={p.linkUnderline} disabled={!editable} onchange={(e) => styleStore.updateActive({ linkUnderline: val(e) as LinkUnderline })}>
              <option value="always">常に表示</option>
              <option value="hover">ホバー時のみ</option>
              <option value="none">なし</option>
            </select>
          </div>
        </section>

        <!-- リスト -->
        <section>
          <h4>リスト</h4>
          <div class="row">
            <span class="label">インデント幅 (px)</span>
            <input type="number" min="0" max="64" value={p.listIndent} disabled={!editable} oninput={(e) => styleStore.updateActive({ listIndent: num(e) })} />
          </div>
          <ColorField label="マーカー色" value={p.markerColor} disabled={!editable} onChange={(v) => styleStore.updateActive({ markerColor: v })} />
          <div class="row">
            <span class="label">マーカーサイズ (em)</span>
            <input type="number" step="0.1" min="0.5" max="2" value={p.markerSize} disabled={!editable} oninput={(e) => styleStore.updateActive({ markerSize: num(e) })} />
          </div>
          <div class="row">
            <span class="label">マーカー位置</span>
            <select value={p.markerPosition} disabled={!editable} onchange={(e) => styleStore.updateActive({ markerPosition: val(e) as MarkerPosition })}>
              <option value="outside">外側</option>
              <option value="inside">内側</option>
            </select>
          </div>
        </section>

        <!-- 引用 -->
        <section>
          <h4>引用</h4>
          <ColorField label="文字色" value={p.quoteColor} disabled={!editable} onChange={(v) => styleStore.updateActive({ quoteColor: v })} />
          <ColorField label="背景" value={p.quoteBg} disabled={!editable} onChange={(v) => styleStore.updateActive({ quoteBg: v })} />
          <ColorField label="左ボーダー色" value={p.quoteBorder} disabled={!editable} onChange={(v) => styleStore.updateActive({ quoteBorder: v })} />
          <div class="row">
            <span class="label">左ボーダー太さ (px)</span>
            <input type="number" min="0" max="12" value={p.quoteBorderWidth} disabled={!editable} oninput={(e) => styleStore.updateActive({ quoteBorderWidth: num(e) })} />
          </div>
          <div class="row">
            <span class="label">イタリック</span>
            <input type="checkbox" checked={p.quoteItalic} disabled={!editable} onchange={(e) => styleStore.updateActive({ quoteItalic: chk(e) })} />
          </div>
        </section>

        <!-- コード -->
        <section>
          <h4>コード</h4>
          <div class="row">
            <span class="label">等幅フォント</span>
            <select value={p.codeFontFamily} disabled={!editable} onchange={(e) => styleStore.updateActive({ codeFontFamily: val(e) })}>
              {#each CODE_FONT_OPTIONS as o (o.value)}<option value={o.value}>{o.label}</option>{/each}
            </select>
          </div>
          <ColorField label="ブロック背景" value={p.codeBlockBg} disabled={!editable} onChange={(v) => styleStore.updateActive({ codeBlockBg: v })} />
          <div class="row">
            <span class="label">ブロック文字サイズ (px)</span>
            <input type="number" min="9" max="24" value={p.codeFontSize} disabled={!editable} oninput={(e) => styleStore.updateActive({ codeFontSize: num(e) })} />
          </div>
          <ColorField label="インラインコード背景" value={p.codeBg} disabled={!editable} onChange={(v) => styleStore.updateActive({ codeBg: v })} />
          <p class="note">トークン配色（キーワード等の色分け）はカラースキームに連動します。</p>
        </section>

        <!-- 水平線 -->
        <section>
          <h4>水平線</h4>
          <ColorField label="色" value={p.hrColor} disabled={!editable} onChange={(v) => styleStore.updateActive({ hrColor: v })} />
          <div class="row">
            <span class="label">太さ (px)</span>
            <input type="number" min="1" max="8" value={p.hrThickness} disabled={!editable} oninput={(e) => styleStore.updateActive({ hrThickness: num(e) })} />
          </div>
        </section>

        <!-- 表 -->
        <section>
          <h4>表</h4>
          <ColorField label="境界線の色" value={p.borderColor} disabled={!editable} onChange={(v) => styleStore.updateActive({ borderColor: v })} />
          <ColorField label="ヘッダの背景" value={p.tableHeaderBg} disabled={!editable} onChange={(v) => styleStore.updateActive({ tableHeaderBg: v })} />
          <ColorField label="奇数行の背景" value={p.rowOddBg} disabled={!editable} onChange={(v) => styleStore.updateActive({ rowOddBg: v })} />
          <ColorField label="偶数行の背景" value={p.rowEvenBg} disabled={!editable} onChange={(v) => styleStore.updateActive({ rowEvenBg: v })} />
        </section>

        <!-- 印刷（全体設定） -->
        <section>
          <h4>印刷 / PDF（全体設定）</h4>
          <div class="row">
            <span class="label">表示通りに印刷（背景色も再現）</span>
            <input
              type="checkbox"
              checked={uiStore.printAsDisplayed}
              onchange={(e) => (uiStore.printAsDisplayed = chk(e))}
            />
          </div>
          <p class="note">オフ（既定）は紙向けに白背景・濃色文字へ変換します。スタイルとは独立した全体設定です。</p>
        </section>

        <!-- カスタム CSS -->
        <section>
          <h4>カスタム CSS（上級者向け）</h4>
          <p class="note">.markdown-body 配下を対象に上書きできます。</p>
          <textarea rows="6" disabled={!editable} value={p.customCSS} oninput={(e) => styleStore.updateActive({ customCSS: val(e) })}></textarea>
        </section>

        {#if editable}
          <section>
            <button class="danger" onclick={() => styleStore.remove(p.id)}>このスタイルを削除</button>
          </section>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-settings);
  }
  .panel {
    background: #ffffff;
    color: #24292f;
    width: min(580px, 94vw);
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.25);
  }
  header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.8rem 1rem;
    border-bottom: 1px solid #d0d7de;
  }
  .active-name {
    color: #57606a;
    font-size: 0.85rem;
    margin-left: 1em;
  }
  .spacer {
    flex: 1;
  }
  header button {
    border: 1px solid #d0d7de;
    background: #fff;
    border-radius: 6px;
    padding: 0.2rem 0.8rem;
    cursor: pointer;
  }
  .banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    margin: 0.8rem 1rem;
    padding: 0.6rem 0.8rem;
    background: #fff8e1;
    border: 1px solid #f0d68a;
    border-radius: 6px;
    font-size: 0.85rem;
  }
  .body {
    overflow-y: auto;
    padding: 0.4rem 1rem 1rem;
  }
  section {
    padding: 0.6rem 0;
    border-bottom: 1px solid #eef1f4;
  }
  h4 {
    margin: 0.2rem 0 0.5rem;
    font-size: 0.9rem;
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    padding: 0.25rem 0;
  }
  .label {
    font-size: 0.82rem;
    color: #444;
  }
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.82rem;
    color: #444;
    cursor: pointer;
  }
  .checkbox-label input[type='checkbox'] {
    cursor: pointer;
  }
  .row input[type='text'],
  .row input[type='number'],
  .row select {
    border: 1px solid #d0d7de;
    border-radius: 4px;
    padding: 0.2rem 0.4rem;
    font-size: 0.82rem;
  }
  .row input[type='number'] {
    width: 6em;
  }
  .row input[type='text'] {
    width: 14em;
  }
  .row input[type='text'].invalid {
    border-color: #cf222e;
  }
  .name-error {
    margin: 0 0 0.2rem;
    font-size: 0.75rem;
    color: #cf222e;
    text-align: right;
  }
  details.heading {
    border: 1px solid #eef1f4;
    border-radius: 6px;
    padding: 0.2rem 0.6rem;
    margin: 0.3rem 0;
  }
  details.heading summary {
    cursor: pointer;
    font-size: 0.82rem;
    font-weight: 600;
    padding: 0.2rem 0;
  }
  textarea {
    width: 100%;
    box-sizing: border-box;
    font-family: ui-monospace, Consolas, monospace;
    font-size: 0.8rem;
    border: 1px solid #d0d7de;
    border-radius: 6px;
    padding: 0.4rem;
  }
  .note {
    font-size: 0.75rem;
    color: #8b949e;
    margin: 0.2rem 0;
  }
  .primary {
    background: #0969da;
    border-color: #0969da;
    color: #fff;
    border: 1px solid #0969da;
    border-radius: 6px;
    padding: 0.2rem 0.8rem;
    cursor: pointer;
    white-space: nowrap;
  }
  .danger {
    background: #fff;
    border: 1px solid #cf222e;
    color: #cf222e;
    border-radius: 6px;
    padding: 0.3rem 0.8rem;
    cursor: pointer;
  }
</style>
