(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        show(0);
        start();
    }

    var scope = document.querySelector('[data-filter-scope]');
    var keywordInput = document.querySelector('[data-filter-keyword]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var result = document.querySelector('[data-filter-result]');

    if (scope && keywordInput && yearSelect && regionSelect && typeSelect) {
        var items = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));
        var params = new URLSearchParams(window.location.search);
        var initialKeyword = params.get('q') || '';

        function fillSelect(select, attr) {
            var values = Array.from(new Set(items.map(function (item) {
                return item.getAttribute(attr) || '';
            }).filter(Boolean))).sort(function (a, b) {
                return b.localeCompare(a, 'zh-CN');
            });
            values.forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        function textOf(item) {
            return [
                item.getAttribute('data-title'),
                item.getAttribute('data-year'),
                item.getAttribute('data-region'),
                item.getAttribute('data-genre'),
                item.getAttribute('data-type'),
                item.textContent
            ].join(' ').toLowerCase();
        }

        function applyFilter() {
            var keyword = keywordInput.value.trim().toLowerCase();
            var year = yearSelect.value;
            var region = regionSelect.value;
            var type = typeSelect.value;
            var shown = 0;

            items.forEach(function (item) {
                var matchKeyword = !keyword || textOf(item).indexOf(keyword) !== -1;
                var matchYear = !year || item.getAttribute('data-year') === year;
                var matchRegion = !region || item.getAttribute('data-region') === region;
                var matchType = !type || item.getAttribute('data-type') === type;
                var visible = matchKeyword && matchYear && matchRegion && matchType;
                item.classList.toggle('hidden-by-filter', !visible);
                if (visible) {
                    shown += 1;
                }
            });

            if (result) {
                result.textContent = '当前显示 ' + shown + ' 部作品';
            }
        }

        fillSelect(yearSelect, 'data-year');
        fillSelect(regionSelect, 'data-region');
        fillSelect(typeSelect, 'data-type');
        keywordInput.value = initialKeyword;
        [keywordInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
            control.addEventListener('input', applyFilter);
            control.addEventListener('change', applyFilter);
        });
        applyFilter();
    }
})();
