<script lang="ts">
  import { linkDialog } from '../linkDialog.svelte'
  import { FocusWindow } from '../../../wailsjs/go/main/App'

  // 外部リンクを開く前の確認ダイアログ。危険な選択のため、[はい] はポインタ操作のみ・
  // 表示直後 ~500ms は無効化し、[いいえ] は Esc でも実行できる。設計: linkDialog.svelte.ts
  const ARM_DELAY_MS = 500

  let boxEl = $state<HTMLDivElement | undefined>(undefined)
  // armed=false の間は [はい] を無効化（clickjacking 対策の起動遅延）。
  let armed = $state(false)

  // 開いたら WebView にフォーカスを移し、ダイアログ枠にフォーカスを当てる
  // （ボタンには当てない＝Enter で誤発動させない / keyjacking 対策）。
  $effect(() => {
    if (!linkDialog.open) return
    void FocusWindow()
    requestAnimationFrame(() => boxEl?.focus())
  })

  // 起動遅延: 表示中だけ 500ms 後に [はい] を有効化する。
  $effect(() => {
    if (!linkDialog.open) {
      armed = false
      return
    }
    armed = false
    const t = setTimeout(() => (armed = true), ARM_DELAY_MS)
    return () => clearTimeout(t)
  })

  function onKeydown(e: KeyboardEvent): void {
    if (!linkDialog.open) return
    // Esc = [いいえ]（安全側）。
    if (e.key === 'Escape') {
      e.preventDefault()
      linkDialog.reject()
    } else if (e.key === 'Enter') {
      // Enter は無視する（ダイアログは閉じない。Esc と機能が重複しないように）。
      e.preventDefault()
    }
  }

  // [はい] はキーボードでは発動させない（Enter / Space を無効化）。
  function onAcceptKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault()
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

{#if linkDialog.open}
  <div class="overlay">
    <div class="box" role="dialog" aria-modal="true" aria-label="外部リンクを開く" tabindex="-1" bind:this={boxEl}>
      <div class="title">外部リンクを開きますか？</div>
      <div class="message">次のリンクを既定のアプリで開きます。</div>
      <div class="url">{linkDialog.url}</div>
      <div class="buttons">
        <button onclick={() => linkDialog.reject()}>いいえ</button>
        <button
          class="primary"
          tabindex="-1"
          disabled={!armed}
          onclick={() => linkDialog.accept()}
          onkeydown={onAcceptKeydown}
        >
          はい
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
    margin-bottom: 0.6rem;
  }
  .url {
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
