<script lang="ts">
  import { riskyDialog } from '../riskyDialog.svelte'
  import { FocusWindow } from '../../../wailsjs/go/main/App'

  // 危険な選択を伴う確認ダイアログ（外部リンクを開く／外部画像を読み込む 等で共有）。
  // 危険側（accept）はポインタ操作のみ・表示直後 ~500ms は無効。安全側（reject）は Esc 可。
  // 設計: riskyDialog.svelte.ts / docs/アーキテクチャ・画面設計.md §5.11
  const ARM_DELAY_MS = 500

  let boxEl = $state<HTMLDivElement | undefined>(undefined)
  // armed=false の間は危険側ボタンを無効化（clickjacking 対策の起動遅延）。
  let armed = $state(false)

  // 開いたら WebView にフォーカスを移し、ダイアログ枠にフォーカスを当てる
  // （ボタンには当てない＝Enter で誤発動させない / keyjacking 対策）。
  $effect(() => {
    if (!riskyDialog.open) return
    void FocusWindow()
    requestAnimationFrame(() => boxEl?.focus())
  })

  // 起動遅延: 表示中だけ 500ms 後に危険側を有効化する。
  $effect(() => {
    if (!riskyDialog.open) {
      armed = false
      return
    }
    armed = false
    const t = setTimeout(() => (armed = true), ARM_DELAY_MS)
    return () => clearTimeout(t)
  })

  function onKeydown(e: KeyboardEvent): void {
    if (!riskyDialog.open) return
    // Esc = 安全側（reject）。
    if (e.key === 'Escape') {
      e.preventDefault()
      riskyDialog.reject()
    } else if (e.key === 'Enter') {
      // Enter は無視する（ダイアログは閉じない。Esc と機能が重複しないように）。
      e.preventDefault()
    }
  }

  // 危険側ボタンはキーボードでは発動させない（Enter / Space を無効化）。
  function onAcceptKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault()
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

{#if riskyDialog.open}
  <div class="overlay">
    <div class="box" role="dialog" aria-modal="true" aria-label={riskyDialog.title} tabindex="-1" bind:this={boxEl}>
      <div class="title">{riskyDialog.title}</div>
      <div class="message">{riskyDialog.message}</div>
      {#if riskyDialog.detail}
        <div class="detail">{riskyDialog.detail}</div>
      {/if}
      <div class="buttons">
        <button onclick={() => riskyDialog.reject()}>{riskyDialog.rejectLabel}</button>
        <button
          class="primary"
          tabindex="-1"
          disabled={!armed}
          onclick={() => riskyDialog.accept()}
          onkeydown={onAcceptKeydown}
        >
          {riskyDialog.acceptLabel}
        </button>
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
    z-index: 1000;
  }
  .box {
    background: #ffffff;
    color: #24292f;
    width: min(460px, 90vw);
    border-radius: 8px;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.25);
    padding: 1.2rem 1.4rem;
    outline: none;
  }
  .title {
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 0.6rem;
  }
  .message {
    font-size: 0.9rem;
    line-height: 1.6;
    margin-bottom: 0.9rem;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .detail {
    font-family: ui-monospace, Consolas, monospace;
    font-size: 0.82rem;
    background: #f6f8fa;
    border: 1px solid #d0d7de;
    border-radius: 6px;
    padding: 0.5rem 0.6rem;
    margin-bottom: 1.2rem;
    word-break: break-all;
    max-height: 6rem;
    overflow-y: auto;
  }
  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
  .buttons button {
    border: 1px solid #d0d7de;
    background: #ffffff;
    color: #24292f;
    padding: 0.35rem 0.9rem;
    font-size: 0.85rem;
    border-radius: 6px;
    cursor: pointer;
  }
  .buttons button:hover:not(:disabled) {
    background: #f3f4f6;
  }
  .buttons button.primary {
    background: #0969da;
    border-color: #0969da;
    color: #ffffff;
  }
  .buttons button.primary:hover:not(:disabled) {
    background: #0a5fc2;
  }
  .buttons button.primary:disabled {
    background: #94c0f0;
    border-color: #94c0f0;
    cursor: default;
  }
</style>
