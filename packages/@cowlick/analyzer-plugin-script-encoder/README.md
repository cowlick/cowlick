# @cowlick/kag-compiler

`@cowlick/kag-compiler`は[KAG3](http://www.ultrasync.net/dee/kr2helps/kag3doc/contents/)ベースのスクリプトから`cowlick`用のJavaScriptを生成するコンパイラです。

## Usage

`npm`等のパッケージ管理システムを利用してください。
例えば、`npm`を用いてグローバルインストールする場合は下記コマンドを実行します。

```bash
npm i -g @cowlick/kag-compiler
```

### ツールとして利用する場合

下記のコマンドを用いることで、`<target>`ディレクトリを起点にスクリプトをコンパイルできます。

```bash
cowlick-kag-compiler <target>
```

このとき、解析の起点となるファイルは`<target>/first.ks`です。

#### -o, --output

省略時: `script`

出力先のディレクトリを指定します。
