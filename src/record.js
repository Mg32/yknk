var Yknk = Yknk || {};


Yknk.Record = Yknk.Record || {
};


Yknk.Cookie = Yknk.Cookie || {

    // クッキーに書き込む
    set: function(n, v)
    {
        // ドラえもんの誕生日に期限切れ
        var expires = "Sat, 3-Sep-2112 00:00:00";
        document.cookie = n + "=" + escape(v) + ";expires=" + expires;
    },

    // クッキーから読み出す
    get: function(n)
    {
        var c = document.cookie + ";";
        var pos = c.indexOf(n);
        if (pos < 0)
            return "";
        var pos_start = c.indexOf("=", pos) + 1;
        var pos_end = c.indexOf(";", pos);
        return unescape(c.substring(pos_start, pos_end));
    },

    // クッキーが有効かどうか調べる
    isEnabled: function() {
        // ローカル環境では常に有効とみなす
        var host_name = document.location.hostname;
        if (!host_name || host_name === "localhost" || host_name == "127.0.0.1") {
            console.log("Runnning on local");
            return true;
        }

        if (!navigator.cookieEnabled)
            return false;

        // 試しに書き込んで true が返ってこなければ無効
        var checker_name = "is_cookie_enabled";
        this.set(checker_name, true);
        if (!this.get(checker_name))
            return false;

        return true;
    },

};
