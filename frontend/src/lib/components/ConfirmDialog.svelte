<script lang="ts">
  import { dialogStore } from '../dialog.svelte'
  import DialogShell from './DialogShell.svelte'

  // 確認ダイアログ（終了時の未保存確認・インポート上書き確認・通知 等）。
  // 枠・フォーカス・ボタンスタイルは DialogShell に集約。本文とキーボード処理のみここで持つ。
  function onKeydown(e: KeyboardEvent): void {
    if (!dialogStore.open) return
    if (e.key === 'Escape') {
      e.preventDefault()
      dialogStore.choose(dialogStore.escValue)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      dialogStore.choose(dialogStore.enterValue)
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<DialogShell open={dialogStore.open} title={dialogStore.title}>
  <div class="message">{dialogStore.message}</div>
  {#snippet footer()}
    {#each dialogStore.buttons as btn (btn.value)}
      <button
        class:primary={btn.primary}
        data-autofocus={btn.primary ? '' : undefined}
        onclick={() => dialogStore.choose(btn.value)}
      >
        {btn.label}
      </button>
    {/each}
  {/snippet}
</DialogShell>

<style>
  .message {
    font-size: 0.9rem;
    line-height: 1.6;
    margin-bottom: 1.2rem;
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>
