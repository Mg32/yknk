
var Yknk = Yknk || {};


// ログへ出力する
Yknk.log = function (message) {
    var target = document.getElementById("debug");
    var html = Yknk.Utils.convertToHTML(message) + "<br>";
    target.innerHTML += html;
};


Yknk.Utils = Yknk.Utils || {

    // 文字列をHTMLへ変換する
    // text: 文字列
    convertToHTML: function(text) {
        var html = text
            // HTMLエスケープ
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            // 改行 → <br>
            .replace(/\r\n|\n|\r/g, "<br>")
        ;
        return html;
    },

    // 文字列を指定幅にあうように改行する
    // context: Canvasコンテキスト
    // text:    文字列
    // width:   描画する幅 (px)
    multilineText: function(context, text, width) {
        // http://ninoha.com/?p=60 より
        var len = text.length;
        var strArray = [];
        var tmp = "";
        var i = 0;

        if (len < 1) {
            // textの文字数が0だったら終わり
            return strArray;
        }

        for (i = 0; i < len; i++) {
            var c = text.charAt(i);  // textから１文字抽出
            if (c == "\n") {
                // 改行コードの場合はそれまでの文字列を配列にセット
                strArray.push(tmp);
                tmp = "";
                continue;
            }

            // contextの現在のフォントスタイルで描画したときの長さを取得
            if (context.measureText(tmp + c).width <= width) {
                // 指定幅を超えるまでは文字列を繋げていく
                tmp += c;
            }
            else {
                // 超えたら、それまでの文字列を配列にセット
                strArray.push(tmp);
                tmp = c;
            }
        }

        // 繋げたままの分があれば回収
        if (tmp.length > 0)
            strArray.push(tmp);

        return strArray;
    },

};
