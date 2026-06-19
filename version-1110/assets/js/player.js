import { H as Hls } from './hls.js';

(function () {
    var player = document.querySelector('[data-player]');
    var layer = document.querySelector('[data-play-layer]');
    var hls = null;
    var ready = false;

    if (!player) {
        return;
    }

    function source() {
        return player.getAttribute('data-src') || '';
    }

    function prepare() {
        var src = source();
        if (ready || !src) {
            return;
        }

        if (player.canPlayType('application/vnd.apple.mpegurl')) {
            player.src = src;
        } else if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(player);
        } else {
            player.src = src;
        }
        ready = true;
    }

    function hideLayer() {
        if (layer) {
            layer.classList.add('hidden');
        }
    }

    function play() {
        prepare();
        hideLayer();
        var promise = player.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                if (layer) {
                    layer.classList.remove('hidden');
                }
            });
        }
    }

    if (layer) {
        layer.addEventListener('click', play);
    }

    player.addEventListener('click', function () {
        if (player.paused) {
            play();
        }
    });

    player.addEventListener('play', hideLayer);
    player.addEventListener('ended', function () {
        if (layer) {
            layer.classList.remove('hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
})();
