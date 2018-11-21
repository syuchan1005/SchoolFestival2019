# SchoolFestival2019
これはとある学校の文化祭用レジアプリです

> なお今年はLINEBotです

## 使い方
1. `.env.sample`と`config.sample.js`をそれぞれ`.env`, `config.js`にリネーム
2. `.env`と`config.js`を埋める
3. `npm install`
4. `npm run build`
5. `npm run start`

## 開発時
`npm run build` -> `npm run start`ではなく`npm run dev`で開発用サーバーが立ち上がります

## 注意事項
サーバーを再起動するとSessionがリセットされるため商品追加などの一時的な情報が削除されます
(注文やユーザーの団体名などはデータベースに保存しているので消えません)
