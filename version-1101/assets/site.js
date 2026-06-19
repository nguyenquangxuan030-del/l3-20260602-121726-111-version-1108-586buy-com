(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function bindMobileMenu() {
        var button = document.querySelector('[data-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function bindHero() {
        var slides = selectAll('[data-hero-slide]');
        if (!slides.length) {
            return;
        }
        var dots = selectAll('[data-hero-dot]');
        var previous = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        start();
    }

    function bindFilters() {
        selectAll('[data-filter-toolbar]').forEach(function (toolbar) {
            var section = toolbar.parentElement;
            var list = section ? section.querySelector('[data-card-list]') : null;
            if (!list) {
                return;
            }
            var cards = selectAll('[data-movie-card]', list);
            var queryInput = toolbar.querySelector('[data-card-query]');
            var typeSelect = toolbar.querySelector('[data-filter-type]');
            var regionSelect = toolbar.querySelector('[data-filter-region]');
            var yearSelect = toolbar.querySelector('[data-filter-year]');
            var sortSelect = toolbar.querySelector('[data-sort-cards]');
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q') || '';
            if (queryInput && initialQuery) {
                queryInput.value = initialQuery;
            }

            function matches(card) {
                var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
                var type = typeSelect ? typeSelect.value : '';
                var region = regionSelect ? regionSelect.value : '';
                var year = yearSelect ? yearSelect.value : '';
                var searchText = card.getAttribute('data-search') || '';
                var title = (card.getAttribute('data-title') || '').toLowerCase();
                if (query && searchText.indexOf(query) === -1 && title.indexOf(query) === -1) {
                    return false;
                }
                if (type && card.getAttribute('data-type') !== type) {
                    return false;
                }
                if (region && card.getAttribute('data-region') !== region) {
                    return false;
                }
                if (year && card.getAttribute('data-year') !== year) {
                    return false;
                }
                return true;
            }

            function applySort() {
                var value = sortSelect ? sortSelect.value : 'default';
                var sorted = cards.slice();
                if (value === 'hot') {
                    sorted.sort(function (a, b) {
                        return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
                    });
                }
                if (value === 'new') {
                    sorted.sort(function (a, b) {
                        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
                    });
                }
                sorted.forEach(function (card) {
                    list.appendChild(card);
                });
            }

            function apply() {
                applySort();
                cards.forEach(function (card) {
                    card.style.display = matches(card) ? '' : 'none';
                });
            }

            [queryInput, typeSelect, regionSelect, yearSelect, sortSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    window.initMoviePlayer = function (streamUrl, videoId, coverId) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        if (!video) {
            return;
        }
        var hlsInstance = null;

        function playVideo() {
            if (cover) {
                cover.classList.add('is-hidden');
            }
            if (video.getAttribute('data-ready') !== 'true') {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                    video.addEventListener('loadedmetadata', function () {
                        video.play().catch(function () {});
                    }, { once: true });
                } else {
                    video.src = streamUrl;
                    video.play().catch(function () {});
                }
                video.setAttribute('data-ready', 'true');
            } else {
                video.play().catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', playVideo);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        bindMobileMenu();
        bindHero();
        bindFilters();
    });
})();
