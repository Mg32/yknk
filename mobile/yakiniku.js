
///// 焼肉定食ゲーム(スマホ版) /////

///// グローバル変数
var canvas;
var ctx;
var mode        = 0;
var mode_n      = 0;
var isdead      = false;
var img         = [];
var imgsrc      = ["chr.png", "../bg0.png"];
var defaultFont = " sans-serif";

// フェードアウト制御
var enable_fade = 0;
var fade_step = 8;

var yknk = 0;
var score = 0;
var mscore = 0;
var life = 3;

var chr_y;
var yknk_num, yknk_speed;
var knife, dlc_yknk;

// 焼肉定食のX座標(ピクセル)
var yknk_x = [];
// 焼肉定食のY座標(ブロック)
var yknk_y = [];
// 焼肉定食の種類
var yknk_kind = [];
// 焼肉定食のスピード変更表
var yknk_sp_pt = [1000, 2000, 5000];
var yknk_sp_ch = [5, 7, 9];
// 焼肉定食のナイフ・デリシャス率変更表
var yknk_chkd_pt = [100, 150, 300, 600];
var yknk_knif_ch = [4, 3, 3, 2];
var yknk_deli_ch = [128, 96, 64, 48];
// 焼肉定食量変更表
var yknk_num_pt = [5, 10, 25, 50, 125, 250, 650, 1250];
var yknk_num_ch = [2,  3,  5,  8,  13,  21,  27,   34];


///// 初期化
window.onload = function()
{
    modeChg(0);

    // canvas要素の存在チェック、未対応ブラウザの対応
    canvas = document.getElementById('yknk');
    if (!canvas || !canvas.getContext) {
        document.getElementById("debug").innerHTML +=
            "このブラウザはCanvasに対応していません。<br>" +
            "最新のバージョンにアップデートするか、他のブラウザでプレイしてください。<br>";
        return false;
    }
    ctx = canvas.getContext('2d');

    // Cookieからハイスコア読み込み
    if (navigator.cookieEnabled == false) {
        var mes = "Cookieが無効になっています。<br>" +
            "ハイスコアなどのプレイデータを記録するには、Cookieを有効にしてください。<br>";
        document.getElementById("debug").innerHTML += mes;
        return false;
    }
    var ck = getCookie("high_score");
    if (ck) {
        mscore = Number(ck);
    }

    // イベント
    canvas.addEventListener("touchstart", function(e){e.preventDefault();}, false);
    canvas.addEventListener("touchmove", touchMove, false);
    canvas.addEventListener("touchend", touchEnd, false);

    // リソースの読み込み
    img[0] = new Image(); img[0].src = imgsrc[0];
    img[0].onload = function () {
        img[1] = new Image(); img[1].src = imgsrc[1];
        img[1].onload = function () {
            // 50FPSで処理開始
            setInterval(enterFrame, 20);
        };
    };
};
function setCookie(n, v)
{
    document.cookie = n + "=" + escape(v) + ";expires=Sat, 3-Sep-2112 00:00:00";
}
function getCookie(n)
{
    var c = document.cookie + ";";
    var pos = c.indexOf(n);
    if (pos >= 0) {
        var pos_start = c.indexOf("=", pos) + 1;
        var pos_end = c.indexOf(";", pos);
        return unescape(c.substring(pos_start, pos_end));
    }
    return "";
}
function enable_tweetbutton()
{
    var i;
    var points = document.getElementById("points");
    points.innerHTML = points.innerHTML.replace("REPLACE", String(score));

    var twbutton = points.getElementsByClassName("twitter-share-button");
    for (i = 0; i < twbutton.length; i++) {
        twbutton[i].setAttribute("style", "display: inline;");
    }
}
function disable_tweetbutton()
{
    var i;
    var points = document.getElementById("points");
    points.innerHTML = points.innerHTML.replace(String(score)+"点", "REPLACE点");

    var twbutton = points.getElementsByClassName("twitter-share-button");
    for (i = 0; i < twbutton.length; i++) {
        twbutton[i].setAttribute("style", "display: none;");
    }
}


///// イベント
function touchMove(e)
{
    e.preventDefault();
    var rect = e.target.getBoundingClientRect();
    var y = e.touches[0].pageY - rect.top;

    if (mode == 1 && y >= 32) {
        chr_y = Math.round((y-32.0)/24.0);
        if (chr_y < 0) chr_y = 0;
        if (chr_y > 7) chr_y = 7;
    }
}
function touchEnd(e)
{
    e.preventDefault();
    if (mode == 0) {
        modeChg(1);
    }
}


///// 画面切り替え
function modeChg(m)
{
    if (m == 0) {
        disable_tweetbutton();
        mode   = 0;
        mode_n = 0;
        isdead = false;
        enable_fade = 0;        // フェードアウト制御
        yknk = 0;               // いままで飛んできた焼肉定食数
        score = 0;              // 得点数
        life = 3;               // ライフ
        chr_y = 3;              // キャラクタのY座標(0～7)
        yknk_num = 1;           // 焼肉定食の数(1～32)
        yknk_speed = 2*2;       // 焼肉定食のスピード
        knife = 4;              // ナイフ率
        dlc_yknk = 128;         // デリシャス焼肉定食率
    }
    if (m == 1) {
        mode_n = 1;
        enable_fade = 240;

        for (var i = 0; i < 32; i++) {
            new_yknk(i, 24+Math.floor(Math.random()*8)*24);
        }
        yknk_y[0] = 3;
        yknk_x[0] = 320-8-24;
    }
}


///// ゲームループ
function enterFrame()
{
    update();
    draw();
}

// 反映
function update()
{
    var i, j;
    if (isdead) return;
    if (mode == 1) {
        var catched = 0;
        // 焼肉定食の処理
        for (i = 0; i < yknk_num; i++) {
            // 焼肉定食が自分のゾーンまできた
            if (chr_y == yknk_y[i] && yknk_x[i] <= 48 && yknk_x[i] >= 16) {
                // 獲得
                switch (yknk_kind[i]) {
                case 0:
                    score++;
                    catched++;
                    break;
                case 1:
                    life = 3;
                    score++;
                    catched++;
                    break;
                case 2:
                    life--;
                    if (life == 0) {
                        isdead = true;
                        enable_fade = -1;
                        setTimeout(function(){
                            mode_n = -1; enable_fade = 240;
                            enable_tweetbutton();
                        }, 1000);
                        return;
                    }
                    break;
                }
                new_yknk(i, 24+Math.floor(Math.random()*8)*24);
            } else {
                // 画面外へ出た焼肉定食は初期化
                if (yknk_x[i] < -28) {
                    new_yknk(i, 24+Math.floor(Math.random()*8)*16);
                }
            }
            // 移動
            yknk_x[i] -= yknk_speed;
        }
        // 1個以上焼肉定食を獲得した
        if (catched >= 1) {
            // スピード変更
            for (j = 0; j < yknk_sp_pt.length; j++) {
                if (score >= yknk_sp_pt[j]) {
                    yknk_speed = yknk_sp_ch[j];
                }
            }
            // 出現率変更
            for (j = 0; j < yknk_chkd_pt.length; j++) {
                if (score >= yknk_chkd_pt[j]) {
                    knife = yknk_knif_ch[j];
                    dlc_yknk = yknk_deli_ch[j];
                }
            }
            // 焼肉定食数変更
            for (j = 0; j < yknk_num_pt.length; j++) {
                if (score >= yknk_num_pt[j]) {
                    yknk_num = yknk_num_ch[j];
                }
            }
            // 記録更新ならCookieに書き込み
            if (mscore < score) {
                mscore = score;
                setCookie("high_score", mscore);
            }
        }
    }
}

// i番目のバッファにX軸オフセットrで焼肉定食を追加
function new_yknk(i, r)
{
    yknk_y[i] = Math.floor(Math.random() * 8);
    yknk_x[i] = 320-8-24+r;
    yknk_kind[i] = 0;
    if (Math.floor(Math.random()*dlc_yknk) == 0) {
        yknk_kind[i] = 1;
    }
    if (Math.floor(Math.random()*knife) == 0) {
        yknk_kind[i] = 2;
    }
    yknk++;
}

// 描画
function draw()
{
    ctx.save();
    // タイトル画面
    if (mode == 0) {
        ctx.textAlign = "start";
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, 320, 240);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "30px serif";
        ctx.fillText("焼肉定食ゲーム", 57, 70);
        ctx.font = "13px" + defaultFont;
        ctx.fillText("x " + mscore, 205, 142);
        ctx.fillStyle = "#CCCCCC";
        ctx.fillText("飛んでくる焼肉定食をキャッチしよう！", 59, 120);
        ctx.fillText("ハイスコア：", 102, 142);
        ctx.drawImage(img[0], 24, 0, 24, 24, 181, 126, 24, 24);

        ctx.fillStyle = "#6699CC";
        ctx.fillRect(70, 162, 180, 59);
        ctx.font = "14px" + defaultFont;
        ctx.textAlign = "center"; ctx.fillStyle = "white";
        ctx.fillText("画面をタップしてスタート", 160, 197);
    }
    if (mode == 1) {
        // 背景
        ctx.drawImage(img[1], 0, 0, 320, 240, 0, 0, 320, 240);
        // 上部のバー
        ctx.fillStyle = "#333333";
        ctx.fillRect(0, 0, 320, 32);
        // ステータス
        ctx.font = "12px" + defaultFont;
        ctx.fillStyle = "white";
        ctx.textAlign = "start";
        ctx.drawImage(img[0], 24, 0, 24, 24, 12, 4, 24, 24);
        ctx.fillText("x " + score, 36, 20);
        ctx.drawImage(img[0], 96+24*(life < 1), 0, 24, 24, 256   , 4, 24, 24);
        ctx.drawImage(img[0], 96+24*(life < 2), 0, 24, 24, 256+16, 4, 24, 24);
        ctx.drawImage(img[0], 96+24*(life < 3), 0, 24, 24, 256+32, 4, 24, 24);

        // キャラクター
        ctx.drawImage(img[0], 0, 0, 24, 24, 8/2+24, 32+16/2+24*chr_y, 24, 24);

        // 焼肉定食
        for (var i = 0; i < yknk_num; i++) {
            ctx.drawImage(img[0], 24*(yknk_kind[i]+1), 0, 24, 24, 8/2+yknk_x[i], 32+16/2+24*yknk_y[i], 24, 24);
        }

        if (isdead) {
            if (enable_fade == 0) {
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, 320, 240);
                ctx.textAlign = "center";
                ctx.fillStyle = "red";
                ctx.font = "20px" + defaultFont;
                ctx.fillText("GAMEOVER", 160, 108);
                ctx.fillStyle = "white";
                ctx.font = "12px" + defaultFont;
                ctx.fillText("SCORE " + score, 160, 136);
            }
        }
    }

    // フェードがONのとき
    if (enable_fade > 0) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, 320, 240-enable_fade+fade_step+1);
        enable_fade -= fade_step;

        if (enable_fade <= 0) {
            if (mode_n > 0) {
                mode = mode_n;
            } else {
                isdead = true;
            }
            enable_fade = 0;
        }
    }
    ctx.restore();
}
