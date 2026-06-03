package main

import (
	"context"
	"os"
	"path/filepath"
	"sync/atomic"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx        context.Context
	hasUnsaved atomic.Bool
	quitting   atomic.Bool
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// emit はネイティブメニュー等からフロントへイベントを送る内部ヘルパ。
// 小文字始まりのためバインディングには公開されない。
func (a *App) emit(event string) {
	runtime.EventsEmit(a.ctx, event)
}

// SetDirtyState はフロントから未保存有無を通知する（終了時に確認ループを起動するか判断する）。
func (a *App) SetDirtyState(hasUnsaved bool) {
	a.hasUnsaved.Store(hasUnsaved)
}

// Quit はアプリを終了する（フロントの終了確認ループ完了後に呼ばれる）。
func (a *App) Quit() {
	a.quitting.Store(true)
	runtime.Quit(a.ctx)
}

// beforeClose はウィンドウを閉じる直前に呼ばれる。
// 未保存があればフロントの終了確認ループ（タブごとの3択）を起動し、いったん閉じるのを中止する。
// 設計: docs/アーキテクチャ・画面設計.md §5.3（タブごと確認方式）
func (a *App) beforeClose(ctx context.Context) bool {
	if a.quitting.Load() {
		return false
	}
	if !a.hasUnsaved.Load() {
		return false
	}
	a.emit("app:request-quit")
	return true
}

// FileDoc はファイルのパス・名前・親ディレクトリ・内容をまとめた DTO。
// パスの分解は Go の path/filepath に委ねる（OS 依存の区切りも正しく扱える）。
type FileDoc struct {
	Path    string `json:"path"`
	Name    string `json:"name"`
	Dir     string `json:"dir"`
	Content string `json:"content"`
}

func newFileDoc(path, content string) FileDoc {
	return FileDoc{
		Path:    path,
		Name:    filepath.Base(path),
		Dir:     filepath.Dir(path),
		Content: content,
	}
}

// markdownFilters はファイルダイアログのフィルタ。
var markdownFilters = []runtime.FileFilter{
	{DisplayName: "Markdown (*.md;*.markdown;*.mdown;*.txt)", Pattern: "*.md;*.markdown;*.mdown;*.txt"},
	{DisplayName: "すべてのファイル (*.*)", Pattern: "*.*"},
}

// OpenFiles はネイティブのファイル選択（複数可）を開き、選択ファイルを読み込んで返す。
// 読み込めなかったファイルはスキップする。
func (a *App) OpenFiles() ([]FileDoc, error) {
	paths, err := runtime.OpenMultipleFilesDialog(a.ctx, runtime.OpenDialogOptions{
		Title:   "ファイルを開く",
		Filters: markdownFilters,
	})
	if err != nil {
		return nil, err
	}
	docs := make([]FileDoc, 0, len(paths))
	for _, p := range paths {
		data, err := os.ReadFile(p)
		if err != nil {
			continue
		}
		docs = append(docs, newFileDoc(p, string(data)))
	}
	return docs, nil
}

// ReadFile は指定パスを読み込み、FileDoc として返す（セッション復元・再読込用）。
func (a *App) ReadFile(path string) (FileDoc, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return FileDoc{}, err
	}
	return newFileDoc(path, string(data)), nil
}

// SaveFileDialog は保存ダイアログを表示し、選択パスを返す（キャンセル時は空文字）。
func (a *App) SaveFileDialog(suggestedName string) (string, error) {
	return runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "名前を付けて保存",
		DefaultFilename: suggestedName,
		Filters:         markdownFilters,
	})
}

// SaveFile は内容を指定パスへ UTF-8 で書き込み、保存後の FileDoc を返す。
func (a *App) SaveFile(path string, content string) (FileDoc, error) {
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		return FileDoc{}, err
	}
	return newFileDoc(path, content), nil
}
