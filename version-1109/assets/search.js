(function () {
    var params = new URLSearchParams(window.location.search);
    var input = document.getElementById("global-search-input");
    var box = document.getElementById("search-results");
    var query = params.get("q") || "";

    if (input) {
        input.value = query;
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function render(items) {
        if (!box) {
            return;
        }

        if (!items.length) {
            box.innerHTML = "<p class=\"empty-result\">暂无匹配结果</p>";
            return;
        }

        box.innerHTML = items.slice(0, 80).map(function (item) {
            return [
                "<article class=\"search-result-card\">",
                "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
                "<div>",
                "<h3>" + escapeHtml(item.title) + "</h3>",
                "<p>" + escapeHtml(item.year + " · " + item.region + " · " + item.type + " · " + item.genre) + "</p>",
                "<p>" + escapeHtml(item.oneLine) + "</p>",
                "</div>",
                "<a href=\"" + escapeHtml(item.url) + "\">立即观看</a>",
                "</article>"
            ].join("");
        }).join("");
    }

    function search(value) {
        var keyword = value.trim().toLowerCase();

        if (!keyword) {
            render((window.SEARCH_MOVIES || []).slice(0, 24));
            return;
        }

        render((window.SEARCH_MOVIES || []).filter(function (item) {
            var haystack = [
                item.title,
                item.region,
                item.type,
                item.genre,
                item.category,
                item.oneLine,
                item.tags
            ].join(" ").toLowerCase();
            return haystack.indexOf(keyword) !== -1;
        }));
    }

    search(query);

    if (input) {
        input.addEventListener("input", function () {
            search(input.value);
        });
    }
})();
