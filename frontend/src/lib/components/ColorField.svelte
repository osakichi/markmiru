<script lang="ts">
  // カラー入力：ポインタ選択（input[type=color]）＋ #rrggbb 直接入力（text）の両対応。
  let {
    label,
    value,
    disabled = false,
    onChange
  }: { label: string; value: string; disabled?: boolean; onChange: (v: string) => void } = $props()

  // input[type=color] は #rrggbb のみ。非 hex 値（rgba 等）の場合はピッカーは黒表示にしつつ、
  // テキスト側で元の値を編集できるようにする。
  function toHex(v: string): string {
    return /^#[0-9a-fA-F]{6}$/.test(v.trim()) ? v.trim() : '#000000'
  }
</script>

<div class="field">
  <span class="label">{label}</span>
  <span class="controls">
    <input
      type="color"
      {disabled}
      value={toHex(value)}
      oninput={(e) => onChange((e.currentTarget as HTMLInputElement).value)}
    />
    <input
      type="text"
      class="hex"
      {disabled}
      value={value}
      placeholder="#rrggbb"
      oninput={(e) => onChange((e.currentTarget as HTMLInputElement).value)}
    />
  </span>
</div>

<style>
  .field {
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
  .controls {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
  input[type='color'] {
    width: 32px;
    height: 26px;
    padding: 0;
    border: 1px solid #d0d7de;
    border-radius: 4px;
    background: none;
    cursor: pointer;
  }
  .hex {
    width: 8.5em;
    font-family: ui-monospace, Consolas, monospace;
    font-size: 0.8rem;
    padding: 0.2rem 0.4rem;
    border: 1px solid #d0d7de;
    border-radius: 4px;
  }
  input:disabled {
    opacity: 0.5;
    cursor: default;
  }
</style>
