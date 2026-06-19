(function () {
  var root = document.querySelector('[data-player-root]');
  var video = document.getElementById('movieVideo');
  var button = document.querySelector('[data-play-button]');
  var hls = null;
  var ready = false;

  function attachSource() {
    if (!video || !videoSource || ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSource;
      ready = true;
      return;
    }

    if (window.Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(videoSource);
      hls.attachMedia(video);
      ready = true;
      return;
    }

    video.src = videoSource;
    ready = true;
  }

  function startPlay() {
    attachSource();

    if (button) {
      button.classList.add('hidden');
    }

    if (video) {
      video.setAttribute('controls', 'controls');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }
  }

  if (button) {
    button.addEventListener('click', startPlay);
  }

  if (root) {
    root.addEventListener('click', function (event) {
      if (event.target === video && !ready) {
        startPlay();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
})();
