var Yknk = Yknk || {};


Yknk.Image = Yknk.Image || (function() {
    // 再帰的に画像を読み込む
    function load_image_recursively(obj, n) {
        // 読み込み対象がなかった
        if (obj.src == undefined) {
            obj.isLoaded = true;
            return;
        }

        // すべての画像を読み込んだ
        if (n == obj.src.length) {
            obj.isLoaded = true;
            return;
        }

        obj.image[n] = new Image();
        obj.image[n].src = obj.src[n];
        obj.image[n].onload = function() {
            // 読み込みが完了してから次の画像を読み込む
            load_image_recursively(obj, n+1);
        };
    }
    return {
        src: (Yknk.Image) ? (Yknk.Image.src || undefined) : undefined,
        image: [],
        isLoaded: false,

        init: function()
        {
            load_image_recursively(this, 0);
        },

    };
})();


Yknk.Audio = Yknk.Audio || (function() {
    var m_audio = [];
    var m_isMuted = false;
    return {

        src: (Yknk.Audio) ? (Yknk.Audio.src || undefined) : undefined,
        isLoaded: false,

        // オーディオを初期化する
        init: function() {
            // 読み込み対象がなかった
            if (this.src == undefined) {
                this.isLoaded = true;
                return;
            }

            // HTML5 Audio を利用できなかった
            if (!window.HTMLAudioElement) {
                Yknk.log("HTML5 Audio を利用できません。");
                this.isLoaded = false;
                return;
            }

            // オーディオのDOMオブジェクトを読み込む
            for (var i = 0; i < this.src.length; i++) {
                m_audio[i] = document.getElementById(this.src[i]);
                m_audio[i].volume = 1.0;
            }

            // 初期ミュート設定をしておく
            this.muteAll(false);

            this.isLoaded = true;
        },

        // 再生
        play: function(id) {
            m_audio[id].play();
        },

        // ループ再生
        playLoop: function(id) {
            m_audio[id].addEventListener(
                'ended',
                function () { m_audio[id].play(); },
                false
            );
            m_audio[id].play();
        },

        // ループ停止
        stopLoop: function(id) {
            m_audio[id].addEventListener('ended', null, false);
            m_audio[id].currentTime = 0;
            m_audio[id].pause();
        },

        // ボリュームを設定する
        setVolume: function(id, volume) {
            var v = Math.min(Math.max(volume, 0), 1);
            m_audio[id].volume = v;
        },

        // ミュートが有効かどうか？
        isMuted: function() {
            return m_isMuted;
        },

        // ミュート ON/OFF 切り替えをおこなう
        toggleAllMutes: function() {
            this.muteAll(!m_isMuted);
        },

        // 全ミュート(status = true), ミュート全解除(status = false) する
        muteAll: function(muted) {
            m_isMuted = muted;
            for (var i = 0; i < m_audio.length; i++) {
                m_audio[i].muted = muted;
            }
        },

    };
})();
