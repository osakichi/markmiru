<script lang="ts">
  import { stylePicker } from '../stylePicker.svelte'
  import { FocusWindow } from '../../../wailsjs/go/main/App'

  let boxEl = $state<HTMLDivElement | undefined>(undefined)

  // ConfirmDialog と同様、開いたら WebView にフォーカスを移し、主ボタンへ当てる（§ConfirmDialog 参照）。
  $effect(() => {
    if (!stylePicker.open) return
    void FocusWindow()
    requestAnimationFrame(() => {
      const primary = boxEl?.querySelector<HTMLButtonElement>('button.primary')
      ;(primary ?? boxEl)?.focus()
    })
  })

  function onKeydown(e: KeyboardEvent): void {
    if (!stylePicker.open) return
    if (e.key === 'Escape') {
      e.preventDefault()
      stylePicker.cancel()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (stylePicker.selectedId) stylePicker.confirm()
    }
  }

  const hasSelectable = $derived(stylePicker.items.some((i) => !i.builtin))
</script>

<svelte:window onkeydown={onKeydown} />

{#if stylePicker.open}
  <div class="overlay">
    <div
      class="box"
      role="dialog"
      aria-modal="true"
      aria-label="エクスポートするスタイルの選択"
      tabindex="-1"
      bind:this={boxEl}
    >
      <div class="title">エクスポートするスタイル</div>
      {#if hasSelectable}
        <div class="list" role="listbox" aria-label="スタイル一覧">
          {#each stylePicker.items as item (item.id)}
            <button
              class="item"
              class:selected={item.id === stylePicker.selectedId}
              role="option"
              aria-selected={item.id === stylePicker.selectedId}
              disabled={item.builtin}
              onclick={() => stylePicker.select(item.id)}
            >
              <span class="name">{item.name}</span>
              {#if item.builtin}<span class="tag">プリセット</span>{/if}
            </button>
          {/each}
        </div>
        <p class="note">プリセットは書き出せません。複製したスタイルを選んでください。</p>
      {:else}
        <div class="message">
          書き出せるスタイルがありません。プリセットを複製してから書き出してください。
        </div>
      {/if}
      <div class="buttons">
        <button onclick={() => stylePicker.cancel()}>キャンセル</button>
        <button
          class="primary"
          disabled={!stylePicker.selectedId}
          onclick={() => stylePicker.confirm()}
        >
          エクスポート…
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
    margin-bottom: 1.2rem;
    white-space: pre-wrap;
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    max-height: 50vh;
    overflow-y: auto;
    margin-bottom: 0.6rem;
  }
  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    text-align: left;
    border: 1px solid #d0d7de;
    background: #ffffff;
    color: #24292f;
    border-radius: 6px;
    padding: 0.45rem 0.7rem;
    font-size: 0.88rem;
    cursor: pointer;
  }
  .item:hover:not(:disabled) {
    background: #f3f4f6;
  }
  .item.selected {
    border-color: #0969da;
    background: #ddf4ff;
  }
  .item:disabled {
    color: #8b949e;
    background: #f6f8fa;
    cursor: default;
  }
  .tag {
    font-size: 0.72rem;
    color: #8b949e;
    border: 1px solid #d0d7de;
    border-radius: 999px;
    padding: 0 0.5rem;
    white-space: nowrap;
  }
  .note {
    font-size: 0.75rem;
    color: #8b949e;
    margin: 0 0 1rem;
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
