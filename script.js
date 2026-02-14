(function () {
  var QUOTE_STORAGE_KEY = 'aluneQuoteCount';
  var THEME_STORAGE_KEY = 'aluneTheme';
  var RGB_STORAGE_KEY = 'aluneRgbHue';

  var screens = {
    loading: document.getElementById('loading'),
    menu: document.getElementById('menu'),
    'quote-view': document.getElementById('quote-view'),
    'calendar-view': document.getElementById('calendar-view'),
  };

  function showScreen(id) {
    for (var k in screens) screens[k].classList.remove('active');
    if (screens[id]) screens[id].classList.add('active');
    if (id === 'loading') updateQuoteCountDisplay(true);
    if (id === 'quote-view') updateQuoteCountDisplay(true);
  }

  function getQuoteCount() {
    var n = parseInt(localStorage.getItem(QUOTE_STORAGE_KEY), 10);
    return isNaN(n) ? 0 : n;
  }

  function incrementQuoteCount() {
    var n = getQuoteCount() + 1;
    localStorage.setItem(QUOTE_STORAGE_KEY, String(n));
    return n;
  }

  function updateQuoteCountDisplay(increment) {
    var n = increment ? incrementQuoteCount() : getQuoteCount();
    var loadingEl = document.getElementById('loadingQuoteNum');
    var quoteEl = document.getElementById('quoteViewNum');
    if (loadingEl) loadingEl.textContent = '#' + n;
    if (quoteEl) quoteEl.textContent = '#' + n;
  }

  // First time she sees the quote (loading screen is visible on load) — increment once
  if (screens.loading && screens.loading.classList.contains('active')) {
    updateQuoteCountDisplay(true);
  }

  document.getElementById('btnEnter').addEventListener('click', function () {
    showScreen('menu');
  });

  document.getElementById('backToLoading').addEventListener('click', function () {
    showScreen('loading');
  });

  document.querySelectorAll('.menu-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var view = btn.getAttribute('data-view');
      if (view === 'quote') showScreen('quote-view');
      if (view === 'calendar') {
        showScreen('calendar-view');
        renderCalendar(currentCalendarYear, currentCalendarMonth);
      }
    });
  });

  document.querySelectorAll('.btn-back[data-back]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      showScreen(btn.getAttribute('data-back'));
    });
  });

  // --- Theme toggle ---
  var themeToggle = document.getElementById('themeToggle');
  var body = document.body;

  function applyTheme(theme) {
    body.setAttribute('data-theme', theme || 'light');
    themeToggle.textContent = (theme === 'dark') ? '☀️' : '🌙';
    if (theme) localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  var savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'dark' || savedTheme === 'light') applyTheme(savedTheme);
  else applyTheme('light');

  themeToggle.addEventListener('click', function () {
    var next = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });

  // --- RGB hue control ---
  var rgbInput = document.getElementById('rgbHue');
  function applyRgb(hue) {
    hue = Math.max(0, Math.min(360, hue));
    document.documentElement.style.setProperty('--rgb-hue', String(hue));
    rgbInput.value = hue;
    localStorage.setItem(RGB_STORAGE_KEY, String(hue));
  }

  var savedHue = parseInt(localStorage.getItem(RGB_STORAGE_KEY), 10);
  if (!isNaN(savedHue)) applyRgb(savedHue);

  rgbInput.addEventListener('input', function () {
    applyRgb(parseInt(this.value, 10));
  });

  // --- Music ---
  var audio = document.getElementById('bgMusic');
  var musicPlay = document.getElementById('musicPlay');

  musicPlay.addEventListener('click', function () {
    if (audio.paused) {
      audio.play().catch(function () {});
      musicPlay.textContent = '❚❚';
      musicPlay.classList.add('playing');
    } else {
      audio.pause();
      musicPlay.textContent = '▶';
      musicPlay.classList.remove('playing');
    }
  });

  audio.addEventListener('ended', function () {
    musicPlay.textContent = '▶';
    musicPlay.classList.remove('playing');
  });

  // --- Calendar + diverse messages ---
  var currentCalendarYear = new Date().getFullYear();
  var currentCalendarMonth = new Date().getMonth();
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  var beautifulMessages = [
    'You look beautiful today 👑',
    "You're stunning 💕",
    'So pretty today ✨',
    'Gorgeous as always 🌸',
    'Radiant 💖',
    'Absolutely beautiful 🎀',
    'You glow today ✨',
    'So beautiful 💗',
    'Stunning today 👑',
    'Pretty every day 🌷',
    'Beautiful inside & out 💕',
    'You shine today ✨',
    'Gorgeous 💖',
    'So lovely today 🎀',
    'Beautiful soul 💗',
  ];

  function getMessageForDay(dayNum) {
    var i = (dayNum - 1) % beautifulMessages.length;
    return beautifulMessages[i];
  }

  function renderCalendar(year, month) {
    var grid = document.getElementById('calendarGrid');
    var title = document.getElementById('calMonthYear');
    title.textContent = monthNames[month] + ' ' + year;

    var first = new Date(year, month, 1);
    var last = new Date(year, month + 1, 0);
    var startDay = first.getDay();
    var daysInMonth = last.getDate();

    grid.innerHTML = '';

    dayLabels.forEach(function (label) {
      var d = document.createElement('div');
      d.className = 'day-label';
      d.textContent = label;
      grid.appendChild(d);
    });

    for (var i = 0; i < startDay; i++) {
      var empty = document.createElement('div');
      empty.className = 'day-cell other-month';
      empty.innerHTML = '<span class="day-num"></span><span class="day-msg">You look beautiful 💕</span>';
      grid.appendChild(empty);
    }

    for (var d = 1; d <= daysInMonth; d++) {
      var cell = document.createElement('div');
      cell.className = 'day-cell';
      var msg = getMessageForDay(d);
      cell.innerHTML = '<span class="day-num">' + d + '</span><span class="day-msg">' + msg + '</span>';
      grid.appendChild(cell);
    }
  }

  document.getElementById('calPrev').addEventListener('click', function () {
    currentCalendarMonth--;
    if (currentCalendarMonth < 0) {
      currentCalendarMonth = 11;
      currentCalendarYear--;
    }
    renderCalendar(currentCalendarYear, currentCalendarMonth);
  });

  document.getElementById('calNext').addEventListener('click', function () {
    currentCalendarMonth++;
    if (currentCalendarMonth > 11) {
      currentCalendarMonth = 0;
      currentCalendarYear++;
    }
    renderCalendar(currentCalendarYear, currentCalendarMonth);
  });
})();
