var Yknk = Yknk || {};


Yknk.Share = Yknk.Share || {

    replacer: "{REPLACE}",

    html:
        '<a href="https://twitter.com/share"' +
        'class="twitter-share-button" ' +
        'data-url="http://yakinikuteishoku.xxxxxxxx.jp/2/" ' +
        'data-text="{REPLACE}" ' +
        'data-lang="ja">ツイート</a>',

    // シェアボタンのHTMLを生成する
    generateHTML: function(text)
    {
        var skeleton = this.html;
        return skeleton.replace(this.replacer, text.toString());
    },

    ///////////////////////////////////////////////////////////////////////////

    // シェアボタンのコンテナ要素を取得する
    getContainerElement: function()
    {
        return document.getElementById("points");
    },

    // シェアボタンの表示・非表示を切り替える
    setVisible: function(is_visible)
    {
        var points = this.getContainerElement();
        var style = is_visible ? "display: block;" : "display: none;";
        points.setAttribute("style", style);
    },

    // シェアする本文を設定する
    setText: function(text)
    {
        var points = this.getContainerElement();
        points.innerHTML = this.generateHTML(text);
        twttr.widgets.load();
    },

    ///////////////////////////////////////////////////////////////////////////

    // リセットする
    reset: function() {
        this.setText("エラー");
        this.setVisible(false);
    },

    // 記録点数をシェアする
    shareScore: function(score) {
        this.setText("焼肉定食ゲームにて" + score + "点獲得！");
        this.setVisible(true);
    },

};
