(function () {
  var body = document.body;
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      body.classList.toggle('menu-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === activeIndex);
    });

    thumbs.forEach(function (thumb, i) {
      thumb.classList.toggle('active', i === activeIndex);
    });
  }

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      var index = Number(thumb.getAttribute('data-hero-thumb'));
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-local-search]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var categoryFilter = document.querySelector('[data-category-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var empty = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyQueryFromLocation() {
    if (!searchInput) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query) {
      searchInput.value = query;
    }
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var query = normalize(searchInput ? searchInput.value : '');
    var minYear = Number(yearFilter && yearFilter.value ? yearFilter.value : 0);
    var category = categoryFilter ? categoryFilter.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var searchText = normalize(card.getAttribute('data-search'));
      var year = Number(card.getAttribute('data-year') || 0);
      var cardCategory = card.getAttribute('data-category') || '';
      var matched = true;

      if (query && searchText.indexOf(query) === -1) {
        matched = false;
      }

      if (minYear && year < minYear) {
        matched = false;
      }

      if (category && cardCategory !== category) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  applyQueryFromLocation();

  [searchInput, yearFilter, categoryFilter].forEach(function (element) {
    if (element) {
      element.addEventListener('input', filterCards);
      element.addEventListener('change', filterCards);
    }
  });

  filterCards();
})();
