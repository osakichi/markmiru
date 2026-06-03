import './style.css'
import './lib/style/fonts'
import './lib/styles/print.css'
import { mount } from 'svelte'
import App from './App.svelte'

// Svelte 5: クラス的な new ではなく mount() でマウントする
const app = mount(App, {
  target: document.getElementById('app')!
})

export default app
