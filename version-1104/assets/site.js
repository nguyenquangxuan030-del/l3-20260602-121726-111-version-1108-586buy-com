(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      button.textContent = menu.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var url = form.getAttribute("data-search-url") || form.getAttribute("action") || "search.html";
        window.location.href = url + (query ? "?q=" + encodeURIComponent(query) : "");
      });
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        schedule();
      });
    }

    show(0);
    schedule();
  }

  function setupImageFallbacks() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        var frame = image.closest(".poster-frame, .hero-media, .player-cover");
        if (frame) {
          frame.classList.add("image-missing");
        }
      }, { once: true });
    });
  }

  function setupCardFilters() {
    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var scope = panel.closest("section") || document;
      var input = panel.querySelector("[data-filter-cards]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var typeSelect = panel.querySelector("[data-filter-type]");
      var countLabel = panel.querySelector("[data-filter-count]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

      function apply() {
        var query = normalize(input && input.value);
        var year = normalize(yearSelect && yearSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesYear = !year || normalize(card.getAttribute("data-year")) === year;
          var matchesType = !type || normalize(card.getAttribute("data-type")) === type;
          var show = matchesQuery && matchesYear && matchesType;
          card.classList.toggle("is-hidden", !show);
          if (show) {
            visible += 1;
          }
        });

        if (countLabel) {
          countLabel.textContent = visible + " 部";
        }
      }

      [input, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function movieCardTemplate(movie) {
    return [
      "<article class=\"movie-card\">",
      "  <a class=\"poster-frame\" href=\"" + movie.url + "\" data-title=\"" + escapeHtml(movie.title) + "\">",
      "    <img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" class=\"poster-img\">",
      "    <span class=\"poster-play\" aria-hidden=\"true\">▶</span>",
      "    <span class=\"poster-score\">" + escapeHtml(movie.rating) + "</span>",
      "  </a>",
      "  <div class=\"movie-card-body\">",
      "    <h3><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p>" + escapeHtml(movie.oneLine || "") + "</p>",
      "    <div class=\"meta-line\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-page-form]");
    var input = document.querySelector("[data-search-page-input]");
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");

    if (!form || !input || !results || !summary) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";

    function render() {
      var query = normalize(input.value);
      var movies = window.MOVIE_INDEX || [];
      var matched = movies.filter(function (movie) {
        if (!query) {
          return false;
        }
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.category,
          movie.oneLine
        ].join(" "));
        return haystack.indexOf(query) !== -1;
      }).slice(0, 120);

      if (!query) {
        summary.textContent = "请输入关键词开始搜索。";
        results.innerHTML = "";
        return;
      }

      summary.textContent = "找到 " + matched.length + " 条相关结果。";
      results.innerHTML = matched.map(movieCardTemplate).join("\n");
      setupImageFallbacks();
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = window.location.pathname + (query ? "?q=" + encodeURIComponent(query) : "");
      window.history.replaceState(null, "", nextUrl);
      render();
    });

    render();
  }

  function setupPlayers() {
    document.querySelectorAll("[data-play-button]").forEach(function (button) {
      var wrap = button.closest(".player-wrap");
      if (!wrap) {
        return;
      }
      var video = wrap.querySelector("[data-hls-player]");
      var cover = wrap.querySelector("[data-player-cover]");
      var message = wrap.querySelector("[data-player-message]");
      var hlsInstance = null;
      var loaded = false;

      function setMessage(text) {
        if (message) {
          message.textContent = text;
        }
      }

      function startPlayback() {
        if (!video) {
          return;
        }
        var source = video.getAttribute("data-src");
        if (!source) {
          setMessage("未找到可播放的视频源。");
          return;
        }

        if (!loaded) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            loaded = true;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            loaded = true;
          } else {
            setMessage("当前浏览器暂不支持 HLS 播放，请尝试新版 Chrome、Edge、Safari 或移动端浏览器。");
            return;
          }
        }

        if (cover) {
          cover.classList.add("is-hidden");
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            setMessage("浏览器阻止了自动播放，请再次点击播放器播放。");
            if (cover) {
              cover.classList.remove("is-hidden");
            }
          });
        }
      }

      button.addEventListener("click", startPlayback);
      if (video) {
        video.addEventListener("play", function () {
          if (cover) {
            cover.classList.add("is-hidden");
          }
        });
        video.addEventListener("error", function () {
          setMessage("视频加载失败，请检查网络或稍后重试。");
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
        video.addEventListener("emptied", function () {
          if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
            loaded = false;
          }
        });
      }
    });
  }

  ready(function () {
    setupMobileMenu();
    setupSearchForms();
    setupHero();
    setupImageFallbacks();
    setupCardFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
