(function () {
  const screens = {
    loading: document.getElementById('loading'),
    menu: document.getElementById('menu'),
    'quote-view': document.getElementById('quote-view'),
    'calendar-view': document.getElementById('calendar-view'),
  };

  function showScreen(id) {
    Object.values(screens).forEach(function (el) {
      el.classList.remove('active');
    });
    if (screens[id]) screens[id].classList.add('active');
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

  // --- Calendar ---
  var currentCalendarYear = new Date().getFullYear();
  var currentCalendarMonth = new Date().getMonth();
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
      cell.innerHTML =
        '<span class="day-num">' + d + '</span>' +
        '<span class="day-msg">You look beautiful today 👑</span>';
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
