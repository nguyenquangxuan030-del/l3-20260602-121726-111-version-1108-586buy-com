(function () {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const mainNav = document.querySelector('[data-main-nav]');
    const headerSearch = document.querySelector('.header-search');

    if (navToggle && mainNav && headerSearch) {
        navToggle.addEventListener('click', function () {
            mainNav.classList.toggle('open');
            headerSearch.classList.toggle('open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let heroIndex = 0;

    function showHeroSlide(index) {
        if (!slides.length) {
            return;
        }

        heroIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, position) {
            slide.classList.toggle('active', position === heroIndex);
        });

        dots.forEach(function (dot, position) {
            dot.classList.toggle('active', position === heroIndex);
        });
    }

    if (slides.length) {
        showHeroSlide(0);

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showHeroSlide(index);
            });
        });

        window.setInterval(function () {
            showHeroSlide(heroIndex + 1);
        }, 6500);
    }

    const filterForm = document.querySelector('[data-filter-form]');

    if (filterForm) {
        const keywordInput = filterForm.querySelector('[data-filter-keyword]');
        const yearSelect = filterForm.querySelector('[data-filter-year]');
        const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
        const emptyState = document.querySelector('[data-empty-state]');

        function applyFilters() {
            const keyword = (keywordInput.value || '').trim().toLowerCase();
            const year = yearSelect.value;
            let visibleCount = 0;

            cards.forEach(function (card) {
                const haystack = [
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.region
                ].join(' ').toLowerCase();
                const matchesKeyword = !keyword || haystack.includes(keyword);
                const matchesYear = !year || card.dataset.year === year;
                const visible = matchesKeyword && matchesYear;

                card.style.display = visible ? '' : 'none';
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('active', visibleCount === 0);
            }
        }

        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilters();
        });

        keywordInput.addEventListener('input', applyFilters);
        yearSelect.addEventListener('change', applyFilters);
    }

    function getAssetsBase() {
        const currentScript = document.currentScript;

        if (currentScript && currentScript.src) {
            return currentScript.src.replace(/site\.js(?:\?.*)?$/, '');
        }

        const script = document.querySelector('script[src$="assets/site.js"], script[src*="assets/site.js?"]');

        if (script && script.src) {
            return script.src.replace(/site\.js(?:\?.*)?$/, '');
        }

        return new URL('assets/', window.location.href).href;
    }

    function loadHlsEngine() {
        if (window.SiteHls) {
            return Promise.resolve(window.SiteHls);
        }

        return new Promise(function (resolve, reject) {
            const existing = document.querySelector('script[data-hls-engine]');

            if (existing) {
                existing.addEventListener('load', function () {
                    resolve(window.SiteHls);
                }, { once: true });
                existing.addEventListener('error', reject, { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = new URL('hls-engine-global.js', getAssetsBase()).href;
            script.async = true;
            script.dataset.hlsEngine = 'true';
            script.addEventListener('load', function () {
                resolve(window.SiteHls);
            }, { once: true });
            script.addEventListener('error', reject, { once: true });
            document.head.appendChild(script);
        });
    }

    async function startPlayer(shell) {
        const video = shell.querySelector('video[data-src]');
        const overlay = shell.querySelector('.play-overlay');
        const message = shell.querySelector('[data-player-message]');

        if (!video) {
            return;
        }

        const source = video.dataset.src;

        if (message) {
            message.textContent = '正在初始化播放源…';
        }

        try {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                const Hls = await loadHlsEngine();

                if (Hls && Hls.isSupported()) {
                    if (video._staticHls) {
                        video._staticHls.destroy();
                    }

                    const hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    video._staticHls = hls;
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            if (overlay) {
                overlay.classList.add('hidden');
            }

            await video.play();
        } catch (error) {
            if (message) {
                message.textContent = '播放源已绑定，请使用浏览器控件再次点击播放。';
            }

            if (overlay) {
                overlay.classList.remove('hidden');
            }
        }
    }

    document.querySelectorAll('[data-play-button]').forEach(function (button) {
        button.addEventListener('click', function () {
            const shell = button.closest('.player-shell');
            startPlayer(shell);
        });
    });

    const searchRoot = document.querySelector('[data-search-root]');

    if (searchRoot && window.MOVIE_SEARCH_INDEX) {
        const form = searchRoot.querySelector('[data-search-form]');
        const input = searchRoot.querySelector('[data-search-input]');
        const resultBox = searchRoot.querySelector('[data-search-results]');
        const countBox = searchRoot.querySelector('[data-search-count]');
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q') || '';

        function renderSearch(query) {
            const normalized = query.trim().toLowerCase();
            const results = window.MOVIE_SEARCH_INDEX.filter(function (item) {
                return !normalized || item.text.toLowerCase().includes(normalized);
            }).slice(0, 120);

            countBox.textContent = '找到 ' + results.length + ' 条结果';

            resultBox.innerHTML = results.map(function (item) {
                return [
                    '<article class="movie-card compact">',
                    '    <a class="poster-link" href="' + item.url + '">',
                    '        <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                    '        <span class="poster-badge">' + escapeHtml(item.year) + '</span>',
                    '    </a>',
                    '    <div class="card-body">',
                    '        <a class="card-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>',
                    '        <div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
                    '        <p>' + escapeHtml(item.oneLine) + '</p>',
                    '    </div>',
                    '</article>'
                ].join('');
            }).join('');
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        input.value = initialQuery;
        renderSearch(initialQuery);

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const query = input.value.trim();
            const nextUrl = query ? '?q=' + encodeURIComponent(query) : window.location.pathname;
            window.history.replaceState(null, '', nextUrl);
            renderSearch(query);
        });

        input.addEventListener('input', function () {
            renderSearch(input.value);
        });
    }
}());
