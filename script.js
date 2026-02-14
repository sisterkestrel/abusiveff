(function () {
  var QUOTE_STORAGE_KEY = 'aluneQuoteCount';
  var THEME_STORAGE_KEY = 'aluneTheme';
  var RGB_STORAGE_KEY = 'aluneRgbHue';
  var STORAGE_DISCORD = 'alune_discord_img';
  var STORAGE_LEFT_AK = 'alune_left_ak';
  var STORAGE_RIGHT_AK = 'alune_right_ak';
  var STORAGE_MUSIC_URL = 'alune_music_url';

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

  // --- Admin panel: show when URL has ?admin ---
  var adminPanel = document.getElementById('admin-panel');
  if (adminPanel && window.location.search.indexOf('admin') !== -1) {
    adminPanel.classList.add('visible');
    loadAdminFieldsFromStorage();
  }

  // --- Apply images and music: config.json first (for everyone on Vercel), then localStorage override ---
  function applyMedia(urls) {
    var imgDiscord = document.getElementById('imgDiscord');
    var imgLeft = document.getElementById('imgLeftAk');
    var imgRight = document.getElementById('imgRightAk');
    var audio = document.getElementById('bgMusic');
    if (!audio) return;
    if (urls.discordImage && imgDiscord) { imgDiscord.src = urls.discordImage; imgDiscord.style.display = ''; }
    if (urls.leftImage && imgLeft) { imgLeft.src = urls.leftImage; imgLeft.style.display = ''; }
    if (urls.rightImage && imgRight) { imgRight.src = urls.rightImage; imgRight.style.display = ''; }
    if (urls.musicUrl) {
      audio.src = urls.musicUrl;
      audio.load();
    }
  }

  function applyMediaFromStorage() {
    var d = localStorage.getItem(STORAGE_DISCORD);
    var l = localStorage.getItem(STORAGE_LEFT_AK);
    var r = localStorage.getItem(STORAGE_RIGHT_AK);
    var m = localStorage.getItem(STORAGE_MUSIC_URL);
    if (d || l || r || m) {
      applyMedia({
        discordImage: d || '',
        leftImage: l || '',
        rightImage: r || '',
        musicUrl: m || ''
      });
    }
  }

  // Load config.json (permanent for everyone), then optional localStorage override
  (function loadConfig() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'config.json?t=' + Date.now(), true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        try {
          var config = JSON.parse(xhr.responseText);
          applyMedia({
            discordImage: config.discordImage || '',
            leftImage: config.leftImage || '',
            rightImage: config.rightImage || '',
            musicUrl: config.musicUrl || ''
          });
        } catch (e) {}
      }
      applyMediaFromStorage();
    };
    xhr.onerror = function () { applyMediaFromStorage(); };
    xhr.send();
  })();

  function loadAdminFieldsFromStorage() {
    function isUrl(s) { return s && (s.indexOf('http://') === 0 || s.indexOf('https://') === 0); }
    var d = localStorage.getItem(STORAGE_DISCORD);
    var l = localStorage.getItem(STORAGE_LEFT_AK);
    var r = localStorage.getItem(STORAGE_RIGHT_AK);
    var m = localStorage.getItem(STORAGE_MUSIC_URL);
    var urlDiscord = document.getElementById('adminDiscordUrl');
    var urlLeft = document.getElementById('adminLeftUrl');
    var urlRight = document.getElementById('adminRightUrl');
    var urlMusic = document.getElementById('adminMusicUrl');
    if (urlDiscord) urlDiscord.value = isUrl(d) ? d : '';
    if (urlLeft) urlLeft.value = isUrl(l) ? l : '';
    if (urlRight) urlRight.value = isUrl(r) ? r : '';
    if (urlMusic) urlMusic.value = m || '';
  }

  // --- Admin save: uploads and URLs ---
  var adminSaveBtn = document.getElementById('adminSave');
  if (adminSaveBtn) {
    adminSaveBtn.addEventListener('click', function () {
      var audio = document.getElementById('bgMusic');

      function saveImage(fileInput, urlInput, storageKey, imgEl) {
        var url = urlInput && urlInput.value ? urlInput.value.trim() : '';
        if (url) {
          localStorage.setItem(storageKey, url);
          if (imgEl) { imgEl.src = url; imgEl.style.display = ''; }
          return;
        }
        var file = fileInput && fileInput.files && fileInput.files[0];
        if (file) {
          var reader = new FileReader();
          reader.onload = function () {
            var dataUrl = reader.result;
            if (dataUrl.length > 500 * 1024) {
              alert('Image is too large (max ~500KB). Use a smaller image or paste a URL.');
              return;
            }
            localStorage.setItem(storageKey, dataUrl);
            if (imgEl) { imgEl.src = dataUrl; imgEl.style.display = ''; }
          };
          reader.readAsDataURL(file);
        }
      }

      saveImage(
        document.getElementById('adminDiscordFile'),
        document.getElementById('adminDiscordUrl'),
        STORAGE_DISCORD,
        document.getElementById('imgDiscord')
      );
      saveImage(
        document.getElementById('adminLeftFile'),
        document.getElementById('adminLeftUrl'),
        STORAGE_LEFT_AK,
        document.getElementById('imgLeftAk')
      );
      saveImage(
        document.getElementById('adminRightFile'),
        document.getElementById('adminRightUrl'),
        STORAGE_RIGHT_AK,
        document.getElementById('imgRightAk')
      );

      var musicUrlInput = document.getElementById('adminMusicUrl');
      var musicFileInput = document.getElementById('adminMusicFile');
      var musicUrl = musicUrlInput && musicUrlInput.value ? musicUrlInput.value.trim() : '';
      if (musicUrl) {
        localStorage.setItem(STORAGE_MUSIC_URL, musicUrl);
        if (audio) { audio.src = musicUrl; audio.load(); }
      } else if (musicFileInput && musicFileInput.files && musicFileInput.files[0]) {
        var file = musicFileInput.files[0];
        var objUrl = URL.createObjectURL(file);
        if (audio) { audio.src = objUrl; audio.load(); }
        alert('Music set for this session. To keep it after refresh, paste a direct link to the MP3 in the Music URL field (e.g. from Dropbox or a file host).');
      }
    });
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
    if (!audio.src) {
      alert('No music set. Open the admin panel (add ?admin to the URL) to upload music or paste a music URL.');
      return;
    }
    if (audio.paused) {
      audio.play().catch(function () {
        alert('Could not play. Check the music URL or try another format (MP3).');
      });
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
