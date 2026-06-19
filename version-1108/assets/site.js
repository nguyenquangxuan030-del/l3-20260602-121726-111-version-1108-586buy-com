(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var expanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', String(!expanded));
            mobilePanel.hidden = expanded;
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prevButton = carousel.querySelector('[data-hero-prev]');
        var nextButton = carousel.querySelector('[data-hero-next]');
        var currentIndex = 0;
        var timer = null;

        function setSlide(index) {
            if (!slides.length) {
                return;
            }

            currentIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === currentIndex);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === currentIndex);
            });
        }

        function nextSlide() {
            setSlide(currentIndex + 1);
        }

        function resetTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(nextSlide, 5500);
        }

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                setSlide(currentIndex - 1);
                resetTimer();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                nextSlide();
                resetTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot')) || 0;
                setSlide(index);
                resetTimer();
            });
        });

        setSlide(0);
        resetTimer();
    }

    var filterInput = document.querySelector('.js-filter-input');
    var filterSelect = document.querySelector('.js-filter-select');
    var yearSelect = document.querySelector('.js-year-select');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var emptyState = document.querySelector('.empty-state');

    function params() {
        return new URLSearchParams(window.location.search);
    }

    if (filterInput) {
        var initialQuery = params().get('q');
        if (initialQuery) {
            filterInput.value = initialQuery;
        }
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var region = filterSelect ? filterSelect.value.trim() : '';
        var year = yearSelect ? yearSelect.value.trim() : '';
        var visible = 0;

        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            var cardRegion = card.getAttribute('data-region') || '';
            var cardYear = card.getAttribute('data-year') || '';
            var matched = true;

            if (query && text.indexOf(query) === -1) {
                matched = false;
            }
            if (region && cardRegion !== region) {
                matched = false;
            }
            if (year && cardYear !== year) {
                matched = false;
            }

            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyFilters);
    }
    if (filterSelect) {
        filterSelect.addEventListener('change', applyFilters);
    }
    if (yearSelect) {
        yearSelect.addEventListener('change', applyFilters);
    }

    applyFilters();
})();
