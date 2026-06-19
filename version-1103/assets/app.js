(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  function startHeroTimer() {
    if (heroTimer || slides.length < 2) {
      return;
    }

    heroTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      if (heroTimer) {
        window.clearInterval(heroTimer);
        heroTimer = null;
        startHeroTimer();
      }
    });
  });

  showSlide(0);
  startHeroTimer();

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var searchInput = filterPanel.querySelector('[data-filter-input]');
    var yearSelect = filterPanel.querySelector('[data-year-select]');
    var typeSelect = filterPanel.querySelector('[data-type-select]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty-result]');

    function runFilter() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-text') || ''
        ].join(' ').toLowerCase();
        var okQuery = !query || text.indexOf(query) !== -1;
        var okYear = !year || (card.getAttribute('data-year') || '').indexOf(year) !== -1;
        var okType = !type || (card.getAttribute('data-type') || '') === type;
        var ok = okQuery && okYear && okType;

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [searchInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', runFilter);
        control.addEventListener('change', runFilter);
      }
    });

    runFilter();
  }

  function playVideo(player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');

    if (!video) {
      return;
    }

    var src = video.getAttribute('data-url');
    if (!src) {
      return;
    }

    if (cover) {
      cover.classList.add('is-hidden');
    }

    video.controls = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = src;
      }
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsInstance) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      }
      video.play().catch(function () {});
      return;
    }

    if (!video.src) {
      video.src = src;
    }
    video.play().catch(function () {});
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var cover = player.querySelector('.player-cover');
    var button = player.querySelector('.player-button');
    var video = player.querySelector('video');

    if (cover) {
      cover.addEventListener('click', function () {
        playVideo(player);
      });
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        playVideo(player);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!video.src) {
          playVideo(player);
        }
      });
    }
  });
})();
