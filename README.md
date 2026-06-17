# Daily Research Gacha

1日1回だけ引ける、HTML・CSS・JavaScript製のトレーディングカードガチャです。  
GitHub Pagesへそのまま公開できます。

## 機能

- 端末のローカル日付を基準に、1日1回だけ抽選
- SSR / SR / R / Nの提供割合
- 抽選演出
- 獲得カードの図鑑表示
- 同じカードを引いた場合の所持枚数表示
- 次回抽選までのカウントダウン
- スマートフォン対応
- `prefers-reduced-motion`対応

## ファイル構成

```text
daily-gacha/
├── index.html
├── style.css
├── script.js
├── .nojekyll
└── README.md
```

## ローカルで確認する

プロジェクトフォルダ内で次を実行します。

```bash
python3 -m http.server 8000
```

ブラウザで以下を開きます。

```text
http://localhost:8000
```

## GitHub Pagesへ公開する

1. GitHubで新しいPublicリポジトリを作成
2. このフォルダのファイルをpush
3. リポジトリの `Settings` → `Pages`
4. `Source` を `Deploy from a branch`
5. `main` と `/(root)` を選び、`Save`

公開URLは通常、次の形式です。

```text
https://GitHubユーザー名.github.io/リポジトリ名/
```

## カード内容を変更する

`script.js`内の`CARD_MASTER`を編集します。

```javascript
{
  id: "C-013",
  name: "カード名",
  category: "CATEGORY",
  rarity: "R",
  symbol: "★",
  description: "カードの説明",
  quote: "SHORT PHRASE",
  weight: 1,
}
```

`rarity`には `SSR`、`SR`、`R`、`N`のいずれかを指定します。

## 重要な制約

「1日1回」の判定は`localStorage`に保存されます。そのため、以下の場合は再度引けます。

- ブラウザのデータを削除した
- 別のブラウザや端末を使った
- 端末の日付を変更した

ユーザー単位で厳密に1日1回へ制限するには、ログイン機能とサーバー側データベースが必要です。
