
var Moge = Moge || {};

Moge.Utils = Moge.Utils || {
    multilineText: function(context, text, width) {
        // context: Canvasコンテキスト
        // text:    文字列
        // width:   描画する幅
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
