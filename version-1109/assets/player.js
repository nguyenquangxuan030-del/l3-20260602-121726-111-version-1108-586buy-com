var MoviePlayer = (function () {
    function create(id, streamUrl) {
        var root = document.getElementById(id);

        if (!root) {
            return;
        }

        var video = root.querySelector("video");
        var overlay = root.querySelector(".player-overlay");
        var ready = false;
        var hls = null;

        function load() {
            if (ready || !video) {
                return;
            }

            ready = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = streamUrl;
        }

        function play() {
            load();
            root.classList.add("is-playing");

            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            video.setAttribute("controls", "controls");
            var promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener("ended", function () {
            if (overlay) {
                overlay.classList.remove("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    return {
        create: create
    };
})();
