<script lang="ts">
  import { tabsStore } from '../stores/tabs.svelte'
  import { isDirty } from '../stores/tabs'
  import { closeTab } from '../commands'

  function onClose(e: MouseEvent, id: string): void {
    e.stopPropagation()
    // 未保存なら closeTab 内で3択確認（保存/保存しない/キャンセル）
    void closeTab(id)
  }
</script>

<div class="tabbar" role="tablist">
  {#each tabsStore.tabs as tab (tab.id)}
    <div
      class="tab"
      class:active={tab.id === tabsStore.activeId}
      role="tab"
      tabindex="0"
      aria-selected={tab.id === tabsStore.activeId}
      onclick={() => tabsStore.activate(tab.id)}
      onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && tabsStore.activate(tab.id)}
    >
      <span class="name">{tab.fileName}{isDirty(tab) ? ' *' : ''}</span>
      <button class="close" title="閉じる" onclick={(e) => onClose(e, tab.id)}>×</button>
    </div>
  {/each}
  <button class="new" title="新規タブ" onclick={() => tabsStore.newUntitled()}>＋</button>
</div>

<style>
  .tabbar {
    display: flex;
    align-items: stretch;
    background: #f0f2f4;
    border-bottom: 1px solid #d0d7de;
    overflow-x: auto;
    min-height: 36px;
  }
  .tab {
    display: flex;
    align-items: center;
    gap: 0.4em;
    padding: 0 0.4em 0 0.8em;
    border-right: 1px solid #d0d7de;
    cursor: pointer;
    white-space: nowrap;
    color: #57606a;
    user-select: none;
  }
  .tab.active {
    background: #ffffff;
    color: #24292f;
  }
  .name {
    font-size: 0.85rem;
  }
  .close {
    border: none;
    background: none;
    cursor: pointer;
    color: inherit;
    font-size: 1rem;
    line-height: 1;
    padding: 0.1em 0.3em;
    border-radius: 3px;
  }
  .close:hover {
    background: #d0d7de;
  }
  .new {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1rem;
    padding: 0 0.8em;
    color: #57606a;
  }
  .new:hover {
    background: #e2e6ea;
  }
</style>
