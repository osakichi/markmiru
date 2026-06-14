<script lang="ts">
  import { stylePicker } from '../stylePicker.svelte'
  import DialogShell from './DialogShell.svelte'

  // エクスポート対象スタイルの選択。枠・フォーカス・ボタンスタイルは DialogShell に集約。
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

<DialogShell
  open={stylePicker.open}
  title="エクスポートするスタイル"
  ariaLabel="エクスポートするスタイルの選択"
>
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
  {#snippet footer()}
    <button onclick={() => stylePicker.cancel()}>キャンセル</button>
    <button
      class="primary"
      data-autofocus=""
      disabled={!stylePicker.selectedId}
      onclick={() => stylePicker.confirm()}
    >
      エクスポート…
    </button>
  {/snippet}
</DialogShell>

<style>
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
</style>
