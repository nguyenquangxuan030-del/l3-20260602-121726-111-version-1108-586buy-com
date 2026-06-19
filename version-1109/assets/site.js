(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(open));
            toggle.textContent = open ? "×" : "☰";
        });
    }

    document.querySelectorAll(".card-filter").forEach(function (input) {
        var scope = input.closest("main").querySelector(".filter-scope");

        if (!scope) {
            return;
        }

        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();
            scope.querySelectorAll(".movie-card, .rank-row").forEach(function (item) {
                var haystack = (item.getAttribute("data-search") || item.textContent || "").toLowerCase();
                item.classList.toggle("is-hidden-card", query && haystack.indexOf(query) === -1);
            });
        });
    });
})();
