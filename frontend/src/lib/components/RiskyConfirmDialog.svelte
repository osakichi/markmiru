<script lang="ts">
  import { riskyDialog } from '../riskyDialog.svelte'
  import DialogShell from './DialogShell.svelte'

  // 危険な選択を伴う確認ダイアログ（外部リンクを開く／外部画像を読み込む 等で共有）。
  // 危険側（accept）はポインタ操作のみ・表示直後 ~500ms は無効。安全側（reject）は Esc 可。
  // 枠・フォーカスは DialogShell（ボタンへフォーカスを当てない＝Enter で誤発動させない）。
  const ARM_DELAY_MS = 500

  // armed=false の間は危険側ボタンを無効化（clickjacking 対策の起動遅延）。
  let armed = $state(false)

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
    // Esc = 安全側（reject）。Enter は無視（ダイアログは閉じない）。
    if (e.key === 'Escape') {
      e.preventDefault()
      riskyDialog.reject()
    } else if (e.key === 'Enter') {
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

<DialogShell open={riskyDialog.open} title={riskyDialog.title}>
  <div class="message">{riskyDialog.message}</div>
  {#if riskyDialog.detail}
    <div class="detail">{riskyDialog.detail}</div>
  {/if}
  {#snippet footer()}
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
  {/snippet}
</DialogShell>

<style>
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
</style>
