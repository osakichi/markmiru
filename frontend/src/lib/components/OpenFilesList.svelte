<script lang="ts">
  import { tabsStore } from '../stores/tabs.svelte'
  import { isDirty } from '../stores/tabs'

  // 「開いているファイル一覧」。タブの補助 UI（タブが増えた際の視認性向上）。
  // 設計: docs/アーキテクチャ・画面設計.md §0, §4.1, §4.3
</script>

<aside class="open-files">
  <div class="head">開いているファイル</div>
  <ul>
    {#each tabsStore.tabs as tab (tab.id)}
      <li>
        <button
          class="item"
          class:active={tab.id === tabsStore.activeId}
          title={tab.filePath ?? tab.fileName}
          onclick={() => tabsStore.activate(tab.id)}
        >
          <span class="name">{tab.fileName}{isDirty(tab) ? ' *' : ''}</span>
          {#if tab.dirHint}
            <span class="dir">{tab.dirHint}</span>
          {/if}
        </button>
      </li>
    {/each}
  </ul>
</aside>

<style>
  .open-files {
    width: 240px;
    flex: 0 0 240px;
    height: 100%;
    overflow-y: auto;
    background: #f6f8fa;
    border-right: 1px solid #d0d7de;
    box-sizing: border-box;
  }
  .head {
    padding: 0.5rem 0.8rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #57606a;
    border-bottom: 1px solid #e2e6ea;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.1rem;
    width: 100%;
    border: none;
    background: none;
    text-align: left;
    padding: 0.4rem 0.8rem;
    cursor: pointer;
    color: #24292f;
  }
  .item:hover {
    background: #eaeef2;
  }
  .item.active {
    background: #dbe3ec;
  }
  .name {
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  .dir {
    font-size: 0.7rem;
    color: #8b949e;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
</style>
