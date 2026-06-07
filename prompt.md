title が表示されていません。

02_messages の D列(title) を表示したいです。

現状：
message は表示されている
lucky_type / lucky_content も表示されている

しかし title が表示されない

確認してほしいこと：

1. GAS JSONに title が含まれているか確認
2. ブラウザコンソールで受信JSONを確認
3. tarotCards.ts の正規化処理で title が落ちていないか確認
4. ResultScreen.tsx に title が渡っているか確認
5. title が空でない場合は message の上に表示

修正後
npm run build
git commit
git push
まで実施してください