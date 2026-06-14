<script lang="ts">
  import type { Snippet } from 'svelte'
  import { FocusWindow } from '../../../wailsjs/go/main/App'

  // アプリ内モーダルダイアログの共通枠（オーバーレイ＋ボックス＋フォーカス制御）。
  // 本文は children、ボタン列は footer スニペットで受け取る。
  // キーボード処理は各ダイアログ固有のため、呼び出し側が <svelte:window onkeydown> で持つ。
  let {
    open = false,
    title = '',
    ariaLabel = '',
    children,
    footer
  }: {
    open?: boolean
    title?: string
    ariaLabel?: string
    children?: Snippet
    footer?: Snippet
  } = $props()

  let boxEl = $state<HTMLDivElement | undefined>(undefined)

  // 開いたら WebView にフォーカスを移し、[data-autofocus] 要素（無効でないもの）へ、
  // 無ければ枠自身へフォーカスする。
  // - 文書内（WebView）にフォーカスが無いと <svelte:window onkeydown> がキーを受け取れない。
  // - 起動直後、Windows の WebView2 は子ウィンドウで動くためクリックするまでキーボード
  //   フォーカスが入らない。FocusWindow()（Go）がメインウィンドウへ WM_SETFOCUS を送り、
  //   Wails の chromium.Focus() を誘発して WebView へフォーカスを渡す（他 OS は no-op）。
  $effect(() => {
    if (!open) return
    void FocusWindow()
    requestAnimationFrame(() => {
      const auto = boxEl?.querySelector<HTMLElement>('[data-autofocus]:not([disabled])')
      ;(auto ?? boxEl)?.focus()
    })
  })
</script>

{#if open}
  <div class="overlay">
    <!-- tabindex="-1": プログラム的にフォーカス可能にする（Tab キーでは選択されない） -->
    <div
      class="box"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || title}
      tabindex="-1"
      bind:this={boxEl}
    >
      {#if title}<div class="title">{title}</div>{/if}
      {@render children?.()}
      {#if footer}<div class="buttons">{@render footer()}</div>{/if}
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
    z-index: var(--z-dialog);
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
  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
  /* footer スニペットで渡されたボタンの共通スタイル（:global でスロット内要素に適用）。 */
  .buttons :global(button) {
    border: 1px solid #d0d7de;
    background: #ffffff;
    color: #24292f;
    padding: 0.35rem 0.9rem;
    font-size: 0.85rem;
    border-radius: 6px;
    cursor: pointer;
  }
  .buttons :global(button:hover:not(:disabled)) {
    background: #f3f4f6;
  }
  .buttons :global(button:disabled) {
    cursor: default;
  }
  .buttons :global(button.primary) {
    background: #0969da;
    border-color: #0969da;
    color: #ffffff;
  }
  .buttons :global(button.primary:hover:not(:disabled)) {
    background: #0a5fc2;
  }
  .buttons :global(button.primary:disabled) {
    background: #94c0f0;
    border-color: #94c0f0;
  }
</style>
