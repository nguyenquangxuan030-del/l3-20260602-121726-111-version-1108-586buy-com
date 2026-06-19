(function () {
    window.setupVideoPlayer = function (source) {
        var video = document.getElementById("moviePlayer");
        var button = document.getElementById("playButton");
        var mask = document.getElementById("playMask");
        if (!video || !source) {
            return;
        }
        var started = false;
        var start = function () {
            if (mask) {
                mask.classList.add("is-hidden");
            }
            if (!started) {
                started = true;
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls();
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }
            var run = video.play();
            if (run && run.catch) {
                run.catch(function () {});
            }
        };
        if (button) {
            button.addEventListener("click", start);
        }
        if (mask) {
            mask.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    };
})();
