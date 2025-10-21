# テクスチャ画像の管理

## ディレクトリ構成

```
web/canvas2d/
  ├── source-images/       # 元画像（任意のサイズ・形式）
  │   ├── tower_south1_1f.png
  │   ├── gate1_roof.jpg
  │   └── ...
  ├── images/              # 生成された256×256画像（自動生成）
  │   ├── tower_south1_1f.png
  │   ├── gate1_roof.png
  │   └── ...
  └── generate-textures.sh # 画像生成スクリプト
```

## 使い方

### 1. 元画像を配置

`source-images/` ディレクトリに、マップIDと同じ名前の画像ファイルを配置します。

- ファイル名: `{mapId}.{png|jpg|jpeg}`
- 例: `tower_south1_1f.png`, `gate1_roof.jpg`
- サイズ: 任意（大きめの画像を推奨）
- 形式: PNG, JPG, JPEG

### 2. スクリプトを実行

```bash
cd web/canvas2d
./generate-textures.sh
```

オプション: クロップ率を指定（デフォルト: 70%）

```bash
# 中央から50%を切り出し
./generate-textures.sh 50

# 中央から90%を切り出し（ほぼ全体）
./generate-textures.sh 90
```

### 3. 生成結果

`images/` ディレクトリに、256×256のPNG画像が生成されます。

## スクリプトの動作

`generate-textures.sh` は以下の処理を行います：

1. **中央クロップ**: 画像の中央から指定%（デフォルト70%）を切り出し
2. **リサイズ**: 256×256ピクセルにリサイズ（アスペクト比保持）
3. **PNG出力**: 常にPNG形式で出力（透明度対応）

### なぜクロップするのか？

- 大きな画像の重要な部分（中央）だけを使用
- 余白や端の不要な部分を除外
- 256×256という小さなサイズでも視認性を確保

### クロップ率の選び方

- **50%**: 画像の中心部分のみ（被写体が中央にある場合）
- **70%** (推奨): バランスが良い
- **90%**: ほぼ全体（画像全体を使いたい場合）
- **100%**: クロップなし（全体をそのままリサイズ）

## ImageMagickのインストール

### Ubuntu/Debian
```bash
sudo apt-get install imagemagick
```

### macOS
```bash
brew install imagemagick
```

### Windows (WSL)
```bash
sudo apt-get install imagemagick
```

## トラブルシューティング

### "convert: not found" エラー
→ ImageMagickをインストールしてください

### 画像が生成されない
→ `source-images/` に画像ファイル（.png, .jpg, .jpeg）があるか確認

### 画像がぼやける
→ クロップ率を下げる（50%など）か、元画像の解像度を上げる

## map-data.jsへの登録

生成した画像を使うには、`map-data.js` に画像パスを追加します：

```javascript
{
  "id": "tower_south1_1f",
  "name": "塔・南①1F",
  "floor": 1,
  "area": "tower_south1",
  "enemyType": "yellow",
  "description": "祭祀",
  "image": "images/tower_south1_1f.png"  // ← 追加
}
```

## 注意事項

- `images/` ディレクトリは自動生成なので、Gitにコミットする必要はありません
- `source-images/` の元画像はGitで管理することを推奨
- 画像のファイル名は必ずマップIDと一致させてください
