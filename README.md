# OCRテキスト認識・表示アプリ ドキュメント

## 概要
このアプリケーションは、カメラで撮影した紙や看板の文字を認識し、テキストに変換して大きな文字で表示するWebアプリケーションです。TypeScript、React、Vite、TailwindCSSを使用して開発されており、Tesseract.jsを利用してOCR（光学文字認識）処理を行います。

## 主な機能
1. カメラアクセス機能
   - デバイスのカメラにアクセスし、リアルタイムで映像を表示
   - 背面カメラを優先的に使用（モバイルデバイス向け）

2. OCR処理機能
   - Tesseract.jsを使用した日本語テキスト認識
   - 撮影した画像から文字を抽出

3. テキスト表示機能
   - 認識したテキストを大きな文字で表示
   - 3段階のテキストサイズ（標準、大きい、特大）を選択可能
   - レスポンシブデザインによる様々な画面サイズへの対応

## 技術スタック
- **フロントエンド**: React、TypeScript
- **ビルドツール**: Vite
- **スタイリング**: TailwindCSS
- **OCRライブラリ**: Tesseract.js

## 使用方法
1. 「カメラを起動」ボタンをクリックしてカメラを有効化
2. 認識したい文字（紙や看板など）にカメラを向ける
3. 「撮影してテキスト認識」ボタンをクリックして画像を撮影
4. OCR処理が完了すると、認識されたテキストが表示される
5. テキストサイズを「標準」「大きい」「特大」から選択可能

## インストール方法
```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# ビルドしたアプリケーションのプレビュー
npm run preview
```

## プロジェクト構成
```
/
├── public/          # 静的ファイル
├── src/             # ソースコード
│   ├── App.tsx      # メインコンポーネント
│   ├── App.css      # アプリケーション固有のスタイル
│   ├── index.css    # グローバルスタイル
│   └── main.tsx     # エントリーポイント
├── index.html       # HTMLテンプレート
├── package.json     # 依存関係と設定
└── tsconfig.json    # TypeScript設定
```

## 実装の詳細

### カメラアクセス
MediaDevices APIの`getUserMedia()`メソッドを使用してカメラにアクセスしています。モバイルデバイスでは背面カメラを優先的に使用するよう設定されています。

```typescript
const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' } // 背面カメラを優先
    })
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      setCameraActive(true)
    }
  } catch (err) {
    console.error('カメラへのアクセスに失敗しました:', err)
  }
}
```

### OCR処理
Tesseract.jsを使用して画像からテキストを認識しています。日本語の言語データを使用し、認識されたテキストからスペースを取り除く処理を行っています。

```typescript
const recognizeText = async (imageUrl: string) => {
  setIsProcessing(true)
  
  try {
    const worker = await createWorker('jpn') // 日本語の言語データを使用
    
    const { data } = await worker.recognize(imageUrl)
    
    // 日本語OCRの場合、スペースが入ることがあるので取り除く
    const cleanedText = data.text.replace(/\s+/g, '')
    setRecognizedText(cleanedText)
    
    await worker.terminate()
  } catch (err) {
    console.error('OCR処理に失敗しました:', err)
    setRecognizedText('テキスト認識に失敗しました。もう一度お試しください。')
  } finally {
    setIsProcessing(false)
  }
}
```

### テキスト表示
認識されたテキストを3段階のサイズ（標準、大きい、特大）で表示できます。CSSクラスを動的に切り替えることで実現しています。

```typescript
const getTextDisplayClass = () => {
  switch (textSize) {
    case 'normal':
      return 'text-display'
    case 'large':
      return 'text-display-large'
    case 'extra-large':
      return 'text-display-extra-large'
    default:
      return 'text-display-large'
  }
}
```

## 注意事項
- カメラへのアクセスには、HTTPSまたはローカルホスト環境が必要です
- OCR処理の精度は、撮影環境（明るさ、角度、フォントなど）に影響されます
- 初回実行時にTesseract.jsの言語データをダウンロードするため、インターネット接続が必要です

## 今後の改善点
- 複数言語対応の追加
- 画像の前処理機能（コントラスト調整、傾き補正など）の追加
- 認識したテキストの編集機能
- 認識結果の履歴機能

## ライセンス
このプロジェクトはMITライセンスの下で公開されています。
