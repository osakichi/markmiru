// 同梱フォント（@fontsource）。woff2＋unicode-range サブセットで自己ホストするため、
// OS に依存せず同じ字形で表示できる（クロスプラットフォームの一致）。
// 当面は Regular(400)/Bold(700) のみ同梱して容量を抑える。
// 日本語の等幅は Noto Sans Mono（ラテン）＋ Noto Sans JP フォールバック（方式A）。
// 必要なら後日、日本語等幅合成フォント（NOTONOTO 等）を同梱して差し替える（方式B）。
import '@fontsource/noto-sans-jp/400.css'
import '@fontsource/noto-sans-jp/700.css'
import '@fontsource/noto-serif-jp/400.css'
import '@fontsource/noto-serif-jp/700.css'
import '@fontsource/noto-sans-mono/400.css'
import '@fontsource/noto-sans-mono/700.css'
