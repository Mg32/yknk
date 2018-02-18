
///// グローバル変数
var canvas;
var ctx;
var snd         = [];
var sndsrc      = ["snd_cur", "snd_get1", "snd_get2", "snd_miss",
                   "bgm_menu", "bgm_play", "bgm_play2", "bgm_select"];
var sndloaded    = false;
var img         = [];
var imgsrc      = ["../title.png", "chr.png", "bar.png",
                   "../bg0.png", "../bg1.png", "bg0-0.png", "bg0-1.png", "mute.png",
                   "life.png", "../yk.png", "volume.png"];
var imgloaded    = false;
var defaultFont = " 'ヒラギノ角ゴ Pro W3', 'Hiragino Kaku Gothic Pro', Meiryo, sans-serif";

// モード関連
var mode        = 0;
var mode_n      = 0;
var submode     = 0;
var selmenu     = 0;
// バグモード(プレイ画面でDeleteキー押下)
var bugged      = 0;
var bugoffsetX  = 0;
var bugoffsetY  = 0;
// フェードアウト制御
var enable_fade = 0;
var fade_step   = 4;
// 画面切り替え時の初回描画か？
var isDrawInit = true;

// 音量設定
var vol_bgm = 7;
var vol_se  = 10;

// いままでに飛んできた焼肉定食数
var yknk     = 0;
// 得点数
var score    = 0;
// 最高得点数
var mscore   = 0;
// ライフ
var life     = 3;
// いままでに獲得した焼肉定食数
var sumyknk  = 0;

// キャラクタのY座標(0～6)
var chr_y         = 3;
// 焼肉定食の数(1～32)
var yknk_num      = 1;
// 焼肉定食のスピード
var yknk_speed    = 2;
// ナイフ率
var knife         = 4;
// デリシャス焼肉定食率
var dlc_yknk      = 128;

// 焼肉定食のX座標(ピクセル)
var yknk_x        = [];
// 焼肉定食のY座標(ブロック)
var yknk_y        = [];
// 焼肉定食の種類
var yknk_kind     = [];
// 焼肉定食のスピード変更表
var yknk_sp_pt    = [1000, 2500, 5000];
var yknk_sp_ch    = [3, 4, 5];
// 焼肉定食のナイフ・デリシャス率変更表
var yknk_chkd_pt  = [100, 150, 300, 600];
var yknk_knif_ch  = [4, 3, 3, 2];
var yknk_deli_ch  = [128, 96, 64, 52];
// 焼肉定食量変更表
var yknk_num_pt   = [5, 10, 25, 50, 125, 250, 650];
var yknk_num_ch   = [2,  4,  8,  12,  16,  24,  32];
// キー操作(↑キー、↓キー)
var inkey         = [0, 0];
var inkeyframe    = [-1, -1];
// キー認識速度
var keyframeSpeed = 12;


///// main
window.onload = function()
{
    if (init()) {
        modeChg(0);
    }
};


///// 初期化
function init()
{
    canvas = document.getElementById('yknk');

    // canvas要素の存在チェック、未対応ブラウザの対応
    if (!canvas || !canvas.getContext) {
        document.getElementById("debug").innerHTML +=
            "このブラウザはCanvasに対応していません。<br/>" +
            "最新のバージョンにアップデートするか、他のブラウザでプレイしてください。<br/>";
        return false;
    }
    ctx = canvas.getContext('2d');
    ctx.font = "12px" + defaultFont;
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillText("Now Loading...", 160, 120);

    // 画像読み込み
    load_img(0);
    // オーディオ読み込み
    load_audio();
    // Cookie読み込み
    load_cookie();

    // イベント登録
    window.onkeydown = keydown;
    window.onkeyup   = keyup;

    // 約100FPSで処理
    setInterval(enterFrame, 10);
    return true;
}
function load_img(n)
{
    // 再帰的に画像を読み込む
    if (n >= imgsrc.length-1) {
        imgloaded = true;
    }
    img[n] = new Image();
    img[n].src = imgsrc[n];
    img[n].onload = function () {
        if (n < imgsrc.length-1) {
            load_img(n+1);
        }
    };
}
function load_audio()
{
    // HTML5 Audioが利用できない場合
    if (!window.HTMLAudioElement) {
        var mes = "HTML5 Audioが利用できません。<br/>";
        document.getElementById("debug").innerHTML += mes;
        return;
    }

    // オーディオのDOMオブジェクト読み込み
    for (var i = 0; i < sndsrc.length; i++) {
        snd[i] = document.getElementById(sndsrc[i]);
        snd[i].volume = 1.0;
    }
    sndloaded = true;
}
function load_cookie()
{
    // Cookieが無効な場合は警告
    if (navigator.cookieEnabled == false) {
        var mes = "Cookieが無効になっています。<br/>" +
            "ハイスコアなどのプレイデータを記録するには、Cookieを有効にしてください。<br/>";
        document.getElementById("debug").innerHTML += mes;
        return;
    }

    // ミュートON/OFF
    if (getCookie("muted") === "true") {
        for (var i = 0; i < sndsrc.length; i++) {
            snd[i].muted = true;
        }
    }

    // ハイスコア
    var strsc = getCookie("high_score");
    if (strsc)
        mscore = Number(strsc);

    // いままでに獲得した焼肉定食数
    var strsy = getCookie("sum_yknk");
    if (strsy === "")
        sumyknk = mscore;
    else
        sumyknk = Number(strsy);

    // 音量BGM/SE
    var strbgm = getCookie("vol_bgm");
    var strse  = getCookie("vol_se");
    if (sndloaded == false) return;
    if (strbgm && !isNaN(strbgm))
        vol_bgm = Number(strbgm);
    if (strse  && !isNaN(strse))
        vol_se  = Number(strse);
    set_volume(vol_bgm, vol_se);
}
function setCookie(n, v)
{
    // Cookieの登録
    // ドラえもんの誕生日に期限切れ
    document.cookie = n + "=" + escape(v) + ";expires=Sat, 3-Sep-2112 00:00:00";
}
function getCookie(n)
{
    // Cookieの取得
    var c = document.cookie + ";";
    var pos = c.indexOf(n);
    if (pos >= 0) {
        var pos_start = c.indexOf("=", pos) + 1;
        var pos_end = c.indexOf(";", pos);
        return unescape(c.substring(pos_start, pos_end));
    }
    return "";
}


///// イベント処理
function keydown(e)
{
    var keycode;
    if (e !== null) {
        keycode = e.keyCode;
    } else {
        keycode = window.event.keyCode;
    }
    // メニュー画面
    if (mode == 1) {
        if (submode == 0) {
            if (keycode == 40 || keycode == 83) {
                // 40:↓  83:'S'
                snd[0].play();
                selmenu++;
            }
            if (keycode == 38 || keycode == 87) {
                // 38:↑  87:'W'
                snd[0].play();
                selmenu--;
            }
            if (selmenu < 0) selmenu = 0;
            if (selmenu > 2) selmenu = 2;
            return;
        }
        if (submode == 2) {
            // 設定
            if (keycode == 40 || keycode == 83) {
                // 40:↓  83:'S'
                snd[0].play();
                selmenu++;
                if (selmenu > 2) selmenu = 2;
                return;
            }
            if (keycode == 38 || keycode == 87) {
                // 38:↑  87:'W'
                snd[0].play();
                selmenu--;
                if (selmenu < 0) selmenu = 0;
                return;
            }
            if (keycode == 39 || keycode == 68) {
                // 39:→  68:'D'
                if (selmenu == 0) {
                    vol_bgm++;
                    if (vol_bgm > 10) vol_bgm = 10;
                    set_volume(vol_bgm, vol_se);
                } else
                if (selmenu == 1) {
                    vol_se++;
                    if (vol_se > 10) {
                        vol_se = 10;
                        set_volume(vol_bgm, vol_se);
                        snd[3].play();
                    } else {
                        set_volume(vol_bgm, vol_se);
                        snd[0].play();
                    }
                }
                return;
            }
            if (keycode == 37 || keycode == 65) {
                // 37:←  65:'A'
                if (selmenu == 0) {
                    vol_bgm--;
                    if (vol_bgm < 0) vol_bgm = 0;
                    set_volume(vol_bgm, vol_se);
                } else
                if (selmenu == 1) {
                    vol_se--;
                    if (vol_se < 0) {
                        vol_se = 0;
                    } else {
                        set_volume(vol_bgm, vol_se);
                        snd[0].play();
                    }
                }
                return;
            }
        }
    }
    // プレイ画面
    if (mode == 2) {
        if (submode == 0) {
            if (keycode == 40 || keycode == 39 || keycode == 83 || keycode == 68) {
                // 40:↓  39:→  83:'S'  68:'D'
                inkey[1] = 1;
            }
            if (keycode == 38 || keycode == 37 || keycode == 87 || keycode == 65) {
                // 38:↑  37:←  87:'W'  65:'A'
                inkey[0] = 1;
            }
        }
        return;
    }
}

function keyup(e)
{
    var keycode;
    if (e !== null) {
        keycode = e.keyCode;
    } else {
        keycode = window.event.keyCode;
    }

    // システムキー処理
    if (keycode == 27) {
        // 27:ESC
        for (var i = 0; i < sndsrc.length; i++) {
            snd[i].muted = 1-snd[i].muted;
        }
        setCookie("muted", snd[0].muted);
        isDrawInit = true;
        return;
    }

    // タイトル画面
    if (mode == 0) {
        if (keycode == 32) {
            // 32:Space
            snd[0].play();
            modeChg(1);
            return;
        }
    }
    // メニュー画面
    if (mode == 1) {
        if (submode == 0) {
            if (keycode == 32) {
                // 32:Space
                snd[0].play();
                if (selmenu == 0) {
                    modeChg(2);
                } else {
                    submode = selmenu;
                    selmenu = 0;
                }
                isDrawInit = true;
                return;
            }
        }
        if (submode == 1) {
            // 記録
            if (keycode == 32) {
                // 32:Space
                snd[0].play();
                selmenu = submode;
                submode = 0;
                isDrawInit = true;
                return;
            }
        }
        if (submode == 2) {
            // 設定
            if (selmenu == 2 && keycode == 32) {
                // 32:Space
                set_volume(vol_bgm, vol_se);
                setCookie("vol_bgm", vol_bgm);
                setCookie("vol_se" , vol_se);
                snd[0].play();
                selmenu = submode;
                submode = 0;
                isDrawInit = true;
                return;
            }
        }
    }
    // プレイ画面
    if (mode == 2) {
        if (submode == 0) {
            if (keycode == 40 || keycode == 39 || keycode == 83 || keycode == 68) {
                // 40:↓  39:→  83:'S'  68:'D'
                inkey[1] = 0;
            }
            if (keycode == 38 || keycode == 37 || keycode == 87 || keycode == 65) {
                // 38:↑  37:←  87:'W'  65:'A'
                inkey[0] = 0;
            }
            if (keycode == 46) {
                // 46:Delete
                // バグモードON
                if (bugged == 0) {
                    stop_loop(5);
                    play_loop(6);
                    bugged = 1;
                } else {
                    snd[3].play();
                }
            }
        }
        return;
    }
}


///// ゲームループ
function enterFrame()
{
    if (!imgloaded || !sndloaded) { return; }
    update();
    draw();
}

function update()
{
    var i, j;

    if (mode == 2) {
        if (submode == 0) {
            // バグモード２は操作不可
            if (bugged == 2) { return; }

            // キー押下処理
            for (i = 0; i < 2; i++) {
                if (inkey[i]) {
                    inkeyframe[i]++;
                } else {
                    inkeyframe[i] = -1;
                }
            }
            if (inkeyframe[0] % keyframeSpeed == 0) { chr_y--; }
            if (inkeyframe[1] % keyframeSpeed == 0) { chr_y++; }
            if (chr_y < 0) { chr_y = 0; }
            if (chr_y > 6) { chr_y = 6; }

            // 焼肉定食の処理
            var catched = 0;
            for (i = 0; i < yknk_num; i++) {
                // 自分のゾーンまできたか？
                if (chr_y == yknk_y[i] && yknk_x[i] <= 48 && yknk_x[i] >= 16) {
                    // 獲得した
                    catched++;

                    // 焼肉定食・包丁の処理
                    if (get_yknk(yknk_kind[i])) { return; }
                    new_yknk(i);

                    if (bugged == 0) {
                        // ハイスコア記録
                        if (mscore < score) {
                            mscore = score;
                            setCookie("high_score", mscore);
                        }
                        // 焼肉定食総計記録
                        setCookie("sum_yknk", sumyknk);
                    } else {
                        // バグモード２に遷移
                        if (score >= 8929) {
                            stop_loop(6);
                            bugged = 2;
                        }
                    }
                } else {
                    // 獲得せず
                    // 画面外へ出た焼肉定食は初期化
                    if (yknk_x[i] < -28) {
                        new_yknk(i);
                    }
                }

                // 移動
                yknk_x[i] -= yknk_speed;
            }

            // スコアが変わった
            if (catched > 0) {
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
                // バグモードのとき
                if (bugged != 0) {
                    dlc_yknk /= 16;
                }
            }

        } // if (submode == 0)
    } // if (mode == 2)
}
function new_yknk(i)
{
    yknk_y[i] = Math.floor(Math.random() * 7);
    yknk_x[i] = 320-8 + Math.floor(Math.random()*8)*24;
    yknk_kind[i] = 0;
    if (Math.floor(Math.random() * dlc_yknk) == 0) {
        yknk_kind[i] = 1;
    }
    if (Math.floor(Math.random() * knife) == 0) {
        yknk_kind[i] = 2;
    }
    yknk++;
}
function get_yknk(kind)
{
    // バグモードのとき
    if (bugged == 1) {
        switch (kind) {
        case 0:
            // 焼肉定食
            snd[1].play();
            break;
        case 1:
            // デリシャス
            snd[2].play();
            life = 3;
            break;
        case 2:
            // 包丁
            snd[3].play();
            life = 0;
            break;
        }
        score += Math.floor(Math.random()*43);
        score -= Math.floor(Math.random()*12);
        return false;
    }

    // 通常時
    switch (kind) {
    case 0:
        // 焼肉定食
        snd[1].play();
        score++;
        sumyknk++;
        break;
    case 1:
        // デリシャス
        snd[2].play();
        life = 3;
        score++;
        sumyknk++;
        break;
    case 2:
        // 包丁
        snd[3].play();
        life--;
        // ゲームオーバー
        if (life == 0) {
            stop_loop(5);
            draw();
            submode = 1;
            enable_fade = -1;
            setTimeout(function(){
                mode_n = -1; enable_fade = 240;
                enable_tweetbutton();
            }, 1000);
            return true;
        }
        break;
    }
    return false;
}

function draw()
{
    var i;
    ctx.save();

    // メニュー
    if (mode == 1) {
        // メインメニュー
        if (submode == 0) {
            // 背景
            ctx.drawImage(img[4], 0, 32, 164, 184, 0, 32, 164, 184);

            // 選択項目説明枠
            ctx.fillStyle = "#666666";
            ctx.fillRect(160+4, 32+8+24, 160-12, 160-8-24);

            // 選択項目説明文
            var desc = ["ゲームをはじめます。",
                        "今までの記録を見ます。",
                        "ゲームの設定やバージョンを確認します。"];
            var ar = multilineText(ctx, desc[selmenu], 148-6*2);
            ctx.textAlign = "start";
            ctx.fillStyle = "white";
            for (i = 0; i < ar.length; i++) {
                ctx.fillText(ar[i], 172, 48+16+8*2 + i*16);
            }

            // メニュー項目
            var zoom;
            var caption = ["はじめる", "記録", "設定"];
            for (i = 0; i < 3; i++) {
                if (i == selmenu) {
                    ctx.fillStyle = "#0099FF";
                    zoom = 5;
                } else {
                    ctx.fillStyle = "#6699CC";
                    zoom = 0;
                }
                ctx.fillRect(12-zoom, 32+48*i+12*(i+1)-zoom, 160-12*2+zoom*2, 64-12*2+zoom*2);
                ctx.font = (14+zoom/2) + "px" + defaultFont;
                ctx.textAlign = "center";
                ctx.fillStyle = "white";
                ctx.fillText(caption[i], (160-12)/2+4, 32+48*i+12*(i+1)+24+zoom/2);
            }
        }
        // 設定
        if (submode == 2) {
            var len = 3;
            var isItem   = [true, true, false];
            var confname = ["BGM音量", "SE音量", "もどる"];
            var confval  = [vol_bgm, vol_se, 0];
            var confboxY = [44+75, 44+95, 44+122];

            // 背景
            ctx.drawImage(img[4],
                80, confboxY[0], 160, confboxY[len-1]-confboxY[0]+18,
                80, confboxY[0], 160, confboxY[len-1]-confboxY[0]+18);

            // 設定項目とコマンド
            ctx.font = "14px" + defaultFont;
            for (i = 0; i < len; i++) {
                var textCol = "black";
                var fontSty = "14px";
                var maintext = String(confname[i]);
                var maintextX = 160;
                // この項目が選択されているか
                if (selmenu == i) {
                    ctx.fillStyle = "#0099FF";
                    ctx.fillRect(160-80, confboxY[i], 160, 18);
                    textCol = "white";
                    fontSty = "14px bold";
                }
                if (isItem[i]) {
                    // 設定項目名を表示
                    ctx.textAlign = "start";
                    ctx.fillStyle = textCol;
                    ctx.font = "14px bold" + defaultFont;
                    ctx.fillText(String(confname[i]), 88, confboxY[i]+14);
                    // <-  +>
                    var offsetDown = 0, offsetUp = 1;
                    if (Number(confval[i]) ==  0) offsetDown = 1;
                    if (Number(confval[i]) == 10) offsetUp   = 0;
                    ctx.drawImage(img[10], 16*offsetDown , 0, 16, 12, 200-32, confboxY[i]+3, 16, 12);
                    ctx.drawImage(img[10], 16*offsetUp+32, 0, 16, 12, 200+16, confboxY[i]+3, 16, 12);
                    // 設定値
                    maintext  = String(confval[i]);
                    maintextX = 200;
                }
                ctx.textAlign = "center";
                ctx.fillStyle = textCol;
                ctx.font = fontSty + defaultFont;
                ctx.fillText(maintext, maintextX, confboxY[i]+14);
            }
        } // if (submode == 2)
    } // if (mode == 1)
    if (mode == 2) {
        if (submode == 0) {
            // バグモード２(ランダム描画)
            if (bugged == 2) {
                var posx, posy, kind;
                for (i = 0; i < Math.floor(Math.random()*yknk_num)+1; i++) {
                    kind = Math.floor(Math.random()*3)+1;
                    posx = Math.floor(Math.random()*320)-8;
                    posy = Math.floor(Math.random()*240)-8;
                    ctx.drawImage(img[1], 24*kind, 0, 24, 24, posx, posy, 24, 24);
                }
                ctx.drawImage(img[1], 24*(Math.floor(Math.random()*2)+1), 0, 24, 24, 160-12+bugoffsetX, 120-12+bugoffsetY, 24, 24);
                bugoffsetX += Math.floor(Math.random()*18);
                bugoffsetX -= Math.floor(Math.random()*18);
                if (bugoffsetX < -160) bugoffsetX = -160+Math.floor(Math.random()*18);
                if (bugoffsetX >  160) bugoffsetX =  160-Math.floor(Math.random()*18);
                bugoffsetY += Math.floor(Math.random()*18);
                bugoffsetY -= Math.floor(Math.random()*18);
                if (bugoffsetY < -120) bugoffsetY = -120+Math.floor(Math.random()*18);
                if (bugoffsetY >  120) bugoffsetY =  120-Math.floor(Math.random()*18);
                ctx.drawImage(img[1], 0, 0, 24, 24, 160-12+bugoffsetX, 120-12+bugoffsetY, 24, 24);
                return;
            }

            // 背景
            if (bugged == 0) {
                ctx.drawImage(img[3], 0, 0, 320, 240-24, 0, 0, 320, 240-24);
            } else {
                ctx.drawImage(img[5+Math.floor(Math.random()*2)],
                    0, 0, 320, 240-24, 0, 0, 320, 240-24);
            }
            // 上部のバー
            ctx.drawImage(img[2], 0, 0, 320, 48, 0, 0, 320, 32);
            // ステータス
            ctx.font = "12px" + defaultFont;
            ctx.fillStyle = "white";
            ctx.textAlign = "start";
            ctx.drawImage(img[1], 24, 0, 24, 24, 12, 4, 24, 24);
            ctx.fillText("x " + score, 12+24, 20);
            ctx.drawImage(img[8], 24*(life < 1), 0, 24, 24, 256, 4, 24, 24);
            ctx.drawImage(img[8], 24*(life < 2), 0, 24, 24, 256+16, 4, 24, 24);
            ctx.drawImage(img[8], 24*(life < 3), 0, 24, 24, 256+32, 4, 24, 24);
            if (bugged != 0 && score >= 7777) {
                ctx.drawImage(img[1], 24*2, 0, 24, 24, 12, 4, 24, 24);
            }

            // キャラクター
            ctx.drawImage(img[1], 0, 0, 24, 24, 8/2+24, 32+16/2+24*chr_y, 24, 24);

            // 焼肉定食
            for (i = 0; i < yknk_num; i++) {
                ctx.drawImage(img[1], 24*(yknk_kind[i]+1), 0,
                    24, 24, 8/2+yknk_x[i], 32+16/2+24*yknk_y[i], 24, 24);
            }
        } else {
            if (enable_fade == 0) {
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, 320, 240);
                ctx.textAlign = "center";
                ctx.fillStyle = "red";
                ctx.font = "18px" + defaultFont;
                ctx.fillText("GAMEOVER", 160, 48+20);
                ctx.fillStyle = "white";
                ctx.font = "12px" + defaultFont;
                ctx.fillText("SCORE " + score, 160, 48+48);
                ctx.fillText("F5: リセット", 160, 240-64);
            }
        } // if (submode == 0)
    } // if (mode == 2)

    // 描画初回のとき
    if (isDrawInit) {
        // タイトル画面
        if (mode == 0) {
            ctx.drawImage(img[0], 0, 0, 320, 240-24, 0, 0, 320, 240-24);
        }
        // メニュー
        if (mode == 1) {
            var pagename = ["メニュー", "記録", "設定"];
            // 背景
            ctx.drawImage(img[4], 0, 32, 320, 240-32-24, 0, 32, 320, 240-32-24);
            // 上部のバー
            ctx.drawImage(img[2], 0, 0, 320, 48, 0, 0, 320, 32);
            // バーの文字
            ctx.font = "16px" + defaultFont;
            ctx.textAlign = "center";
            ctx.fillStyle = "black";
            ctx.fillText(pagename[submode], 160, 22);
            ctx.fillStyle = "white";
            ctx.fillText(pagename[submode], 160, 21);

            // メインメニュー
            if (submode == 0) {
                ctx.font = "12px" + defaultFont;
                ctx.textAlign = "start";

                ctx.fillStyle = "#666666";
                // 選択項目説明枠
                ctx.fillRect(160+4, 32+8, 160-12, 160-8);
                // キー操作表示
                ctx.fillText("移動: ↑↓   決定: スペース", 164, 240-24-8);
                // ステータス
                ctx.fillStyle = "#CCCCCC";
                ctx.fillText("ハイスコア", 172, 58);
                ctx.drawImage(img[1], 24, 0, 24, 24, 172+64, 48+6-12, 24, 24);
                ctx.fillStyle = "white";
                ctx.fillText("x " + mscore, 196+64, 58);
            }
            // 記録
            if (submode == 1) {
                //ctx.textAlign = "center";
                //ctx.font = "16px" + defaultFont;
                // キャプション
                ctx.fillStyle = "black";
                ctx.fillText("ハイスコア", 160, 48+24);
                ctx.font = "12px" + defaultFont;
                ctx.fillText("焼肉定食の総獲得数", 160, 48+24+48+36);

                // キー操作表示
                ctx.fillStyle = "#666666";
                ctx.fillText("もどる: スペース", 160, 240-32);

                // ハイスコア
                ctx.font = "48px" + defaultFont;
                ctx.fillStyle = "#0099FF";
                ctx.fillText(mscore, 160, 48+24+48);

                // 焼肉総数
                ctx.font = "24px" + defaultFont;
                ctx.fillText(sumyknk, 160, 48+24+48+36+24);
            }
            // 設定
            if (submode == 2) {
                //ctx.textAlign = "center";
                ctx.fillStyle = "black";
                ctx.drawImage(img[1], 24, 0, 24, 24,   8, 39, 48, 48);
                ctx.drawImage(img[1], 48, 0, 24, 24, 264, 39, 48, 48);

                ctx.font = "18px" + defaultFont;
                ctx.fillText("焼肉定食ゲーム Ver 1.5", 160, 48+20);
                ctx.font = "12px" + defaultFont;
                ctx.fillText("by yakinikker", 160, 48+38);
                ctx.fillStyle = "#666666";
                ctx.fillText("(Updated: 2016.08.20)", 160, 48+55);
                ctx.fillText("移動: ↑↓   変更: ←→   決定: スペース", 160, 240-32);
            }
        }
        drawBottomBar();
        isDrawInit = false;
    }

    // フェードがONのとき
    if (enable_fade > 0) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, 320, 240-enable_fade+fade_step+1);
        drawBottomBar();

        enable_fade -= fade_step;
        if (enable_fade <= 0) {
            if (mode_n > 0) {
                mode = mode_n;
                isDrawInit = true;
                endfade(mode);
            }
            enable_fade = 0;
        }
    }

    ctx.restore();
}

// 画面切り替え
function modeChg(m)
{
    if (m == 1) {
        mode_n = 1;
        enable_fade = 240;
    }
    if (m == 2) {
        mode_n = 2;
        enable_fade = 240;
        stop_loop(4);

        for (var i = 0; i < 32; i++) {
            new_yknk(i);
        }
        yknk_y[0] = 3;
        yknk_x[0] = 320-8-24;
    }
}
function endfade(m)
{
    if (m == 1) {
        play_loop(4);
        submode = 0;
    }
    if (m == 2) {
        play_loop(5);
        submode = 0;
    }
}

///// サウンド関連ユーティリティ
function play_loop(id)
{
    var f = function (n) {
                var s = snd[n];
                return function () { s.play(); };
            };
    snd[id].play();
    snd[id].addEventListener('ended', f(id), false);
}
function stop_loop(id)
{
    snd[id].addEventListener('ended', function(){}, false);
    snd[id].currentTime = 0;
    snd[id].pause();
}
function set_volume(bgm, se)
{
    var vb = bgm / 10.0;
    var vs = se  / 10.0;
    snd[0].volume = vs;
    snd[1].volume = vs;
    snd[2].volume = vs;
    snd[3].volume = vs;
    snd[4].volume = vb;
    snd[5].volume = vb;
    snd[6].volume = vb;
    snd[7].volume = vb;

    vol_bgm = bgm;
    vol_se  = se;
}

///// 描画関連ユーティリティ
function drawBottomBar()
{
    // バー背景
    ctx.drawImage(img[2], 0, 0, 320, 48, 0, 240-24, 320, 24);

    // ミュート表示
    var mute = (snd[0].muted) ? 1 : 0;
    ctx.drawImage(img[7], 24*mute, 0, 24, 24, 320-24, 240-24, 24, 24);

    // 文字
    ctx.font = "12px" + defaultFont;
    ctx.textAlign = "start";
    ctx.fillStyle = "white";

    if (bugged != 0) {
        ctx.fillText("?･?ｳ?｣?壹Α繝･繝ｼ繝茨ｼ?い?ｦ?包ｼ壹Μ繧ｻ繝?ｽｮ繝", 8, 240-8);
        return;
    }
    ctx.fillText("ESC: ミュート", 8, 240-8);
    ctx.fillText("F5: リセット", 100, 240-8);
}
function multilineText(context, text, width)
{
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
        } else {
            // 超えたら、それまでの文字列を配列にセット
            strArray.push(tmp);
            tmp = c;
        }
    }

    // 繋げたままの分があれば回収
    if (tmp.length > 0)
        strArray.push(tmp);

    return strArray;
}

///// DOM関連
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
