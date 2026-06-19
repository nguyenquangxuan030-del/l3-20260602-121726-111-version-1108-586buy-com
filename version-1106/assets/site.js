(function () {
    var menu = document.getElementById("menuToggle");
    var nav = document.getElementById("mainNav");
    if (menu && nav) {
        menu.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    var slider = document.getElementById("heroSlider");
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var index = 0;
        var activate = function (next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                activate(i);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        }
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var filterYear = document.querySelector("[data-filter-year]");
    var filterType = document.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    if (filterInput && params.get("q")) {
        filterInput.value = params.get("q");
    }
    var applyFilter = function () {
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
        var year = filterYear ? filterYear.value : "";
        var type = filterType ? filterType.value : "";
        cards.forEach(function (card) {
            var text = card.getAttribute("data-search") || "";
            var cardYear = card.getAttribute("data-year") || "";
            var cardType = card.getAttribute("data-type") || "";
            var visible = true;
            if (keyword && text.indexOf(keyword) === -1) {
                visible = false;
            }
            if (year && cardYear !== year) {
                visible = false;
            }
            if (type && cardType !== type) {
                visible = false;
            }
            card.classList.toggle("hidden-by-filter", !visible);
        });
    };
    if (filterInput) {
        filterInput.addEventListener("input", applyFilter);
    }
    if (filterYear) {
        filterYear.addEventListener("change", applyFilter);
    }
    if (filterType) {
        filterType.addEventListener("change", applyFilter);
    }
    if (filterInput || filterYear || filterType) {
        applyFilter();
    }
})();
