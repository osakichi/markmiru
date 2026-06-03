import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

export default {
  // Svelte 5 では vite-plugin-svelte 同梱の vitePreprocess を使用
  preprocess: vitePreprocess()
}
