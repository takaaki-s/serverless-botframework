# Serverless Slack Bot Example 1

[botbuilder-adapter-slack](https://github.com/howdyai/botkit/tree/master/packages/botbuilder-adapter-slack)のexamplesのindex.jsをserverlessで動かすサンプルです。  
ServerlessFrameworkとnode、npmはあらかじめインストールしておいてください。

```bash
$ node -v
v11.6.0
$ npm -v
6.9.0
$ sls -v
1.45.1
```

# 設定

`setting.yml.example`を`setting.yml`としてコピーしてSlackの秘匿情報を設定してください。

```yaml
# Basic InformationのSigning Secret
CLIENT_SIGNING_SECRET: ''
# OAuth & PermissionsのBot User OAuth Access Token
BOT_TOKEN: ''
# Basic InformationのVerification Token
VERIFICATION_TOKEN: ''
```

ServerlessFrameworkのデプロイコマンドを実行するとデプロイされます。  

```bash
npm install
sls deploy --profile {YOUR_AWS_PROFILE_NAME}
```

デプロイが終わるとターミナルにデプロイ情報が表示されますので、  
その中の`endpoints:`をSlackのEvent Subscriptions画面のRequest URLと  
Interactive Components画面のRequest URLに設定します。  
  
それから、SlackのEvent Subscriptions画面のSubscribe to Bot EventsでBotが受信するイベントを設定します。  
メンションを受信するなら`app_mention`、チャンネルのメッセージを受信するなら`message.channels`等  

あとは、SlackでBotが反応するはずです。
