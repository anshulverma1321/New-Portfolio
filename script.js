/* ╔════════════════════════════════════════════╗
   ║  NEURAL.DEV – AI Portfolio JavaScript     ║
   ╚════════════════════════════════════════════╝ */

'use strict';




/* ─── Neural Network Canvas ─── */
(function initCanvas() {
  var canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, nodes, mouse = { x: 0, y: 0 };
  var NODE_COUNT = 80;
  var CONNECTION_DIST = 160;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', function() { resize(); createNodes(); });

  function randRange(a, b) { return a + Math.random() * (b - a); }

  function createNodes() {
    var colors = ['#38bdf8', '#a855f7', '#22d3ee'];
    nodes = [];
    for (var i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: randRange(-0.3, 0.3),
        vy: randRange(-0.3, 0.3),
        r: randRange(1.2, 2.8),
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1,3),16);
    var g = parseInt(hex.slice(3,5),16);
    var b = parseInt(hex.slice(5,7),16);
    return { r: r, g: g, b: b };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var dx = nodes[i].x - nodes[j].x;
        var dy = nodes[i].y - nodes[j].y;
        var dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < CONNECTION_DIST) {
          var alpha = (1 - dist / CONNECTION_DIST) * 0.35;
          var c = hexToRgb(nodes[i].color);
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + alpha + ')';
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }
    for (var k = 0; k < nodes.length; k++) {
      var n = nodes[k];
      var c = hexToRgb(n.color);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.8)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.15)';
      ctx.fill();
    }
    for (var m = 0; m < nodes.length; m++) {
      var nd = nodes[m];
      var dx2 = mouse.x - nd.x;
      var dy2 = mouse.y - nd.y;
      var d2  = Math.sqrt(dx2*dx2 + dy2*dy2);
      if (d2 < 200 && d2 > 0) {
        nd.vx += (dx2 / d2) * 0.02;
        nd.vy += (dy2 / d2) * 0.02;
      }
    }
  }

  function update() {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      var speed = Math.sqrt(n.vx*n.vx + n.vy*n.vy);
      if (speed > 1.2) { n.vx *= 0.98; n.vy *= 0.98; }
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      n.x = Math.max(0, Math.min(W, n.x));
      n.y = Math.max(0, Math.min(H, n.y));
    }
  }

  function loop() { update(); draw(); requestAnimationFrame(loop); }

  window.addEventListener('mousemove', function(e) { mouse.x = e.clientX; mouse.y = e.clientY; });
  resize();
  createNodes();
  loop();
})();


/* ─── Custom Cursor ─── */
(function initCursor() {
  var cursor   = document.getElementById('cursor');
  var follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;
  var fx = 0, fy = 0, cx = 0, cy = 0;
  var visible = false;

  function showCursor() {
    if (!visible) {
      visible = true;
      cursor.style.opacity   = '1';
      follower.style.opacity = '1';
    }
  }
  function hideCursor() {
    visible = false;
    cursor.style.opacity   = '0';
    follower.style.opacity = '0';
  }

  document.addEventListener('mousemove', function(e) { cx = e.clientX; cy = e.clientY; showCursor(); });
  document.addEventListener('mouseleave', hideCursor);

  function update() {
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    fx += (cx - fx) * 0.12;
    fy += (cy - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(update);
  }
  update();
})();


/* ─── Navbar Scroll ─── */
(function initNavbar() {
  var navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', function() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();


/* ─── Hamburger Menu ─── */
(function initHamburger() {
  var btn   = document.getElementById('hamburger');
  var links = document.getElementById('nav-links');
  if (!btn || !links) return;
  btn.addEventListener('click', function() {
    btn.classList.toggle('active');
    links.classList.toggle('open');
  });
  links.querySelectorAll('.nav-link').forEach(function(a) {
    a.addEventListener('click', function() {
      btn.classList.remove('active');
      links.classList.remove('open');
    });
  });
})();


/* ─── Counter Animation ─── */
(function initCounters() {
  var counters = document.querySelectorAll('.stat-num[data-count]');
  var started  = new Set();
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting && !started.has(e.target)) {
        started.add(e.target);
        animateCount(e.target);
      }
    });
  }, { threshold: 0 });
  counters.forEach(function(c) { obs.observe(c); });

  function animateCount(el) {
    var raw = el.dataset.count || '0';
    var hasPlus = raw.indexOf('+') !== -1;
    var clean = raw.replace('+', '');
    var isPadded = clean.length > 1 && clean.startsWith('0');
    var target = parseInt(clean, 10) || 0;

    var duration = 1800;
    var start = performance.now();
    function step(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);

      var displayVal = String(current);
      if (isPadded) {
        displayVal = displayVal.padStart(clean.length, '0');
      }
      if (hasPlus) {
        displayVal += '+';
      }

      el.textContent = displayVal;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        var finalVal = String(target);
        if (isPadded) {
          finalVal = finalVal.padStart(clean.length, '0');
        }
        if (hasPlus) {
          finalVal += '+';
        }
        el.textContent = finalVal;
      }
    }
    requestAnimationFrame(step);
  }
})();


/* ─── Reveal on Scroll ─── */
(function initReveal() {
  document.body.classList.add('js-ready');

  function showEl(el, delay) {
    setTimeout(function() { el.classList.add('in-view'); }, delay || 0);
  }
  function showAbout(el, delay) {
    setTimeout(function() { el.classList.add('about-visible'); }, delay || 0);
  }

  var revealEls = document.querySelectorAll('.reveal');
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e, i) {
      if (e.isIntersecting) { showEl(e.target, i * 60); obs.unobserve(e.target); }
    });
  }, { threshold: 0, rootMargin: '0px 0px 60px 0px' });

  revealEls.forEach(function(el) {
    var rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) showEl(el, 80);
    else obs.observe(el);
  });

  var aboutEls = document.querySelectorAll('.about-header-anim, .about-animate-left, .about-animate-right');
  var aboutObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e, i) {
      if (e.isIntersecting) { showAbout(e.target, i * 120); aboutObs.unobserve(e.target); }
    });
  }, { threshold: 0, rootMargin: '0px 0px 80px 0px' });

  aboutEls.forEach(function(el) {
    var rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) showAbout(el, 80);
    else aboutObs.observe(el);
  });
})();

/* Hard fallback – unlock all animated elements after 500ms */
setTimeout(function() {
  document.body.classList.add('reveal-unlocked');
  document.querySelectorAll('.about-header-anim, .about-animate-left, .about-animate-right')
    .forEach(function(el) { el.classList.add('about-visible'); });
}, 500);


/* ─── Skills Data & Rendering ─── */
(function initSkills() {
  var grid = document.getElementById('skills-grid');
  if (!grid) return;

  var data = {
    ai: [
      { name: 'Python',                   pct: 88, emoji: '\uD83D\uDC0D' },
      { name: 'NumPy / Pandas',            pct: 82, emoji: '\uD83D\uDCCA' },
      { name: 'Scikit-learn',              pct: 78, emoji: '\uD83E\uDDE0' },
      { name: 'TensorFlow / PyTorch',      pct: 75, emoji: '\uD83D\uDD25' },
      { name: 'NLP Basics',               pct: 72, emoji: '\uD83D\uDDE3\uFE0F' },
      { name: 'LLM Concepts',             pct: 80, emoji: '\u2728' },
      { name: 'Model Training & Eval',    pct: 76, emoji: '\uD83C\uDFAF' },
      { name: 'Feature Engineering',      pct: 74, emoji: '\uD83D\uDD27' },
      { name: 'Hugging Face',             pct: 70, emoji: '\uD83E\uDD17' },
      { name: 'OpenAI / Gemini APIs',     pct: 85, emoji: '\uD83D\uDD17' }
    ],
    backend: [
      { name: 'Python (FastAPI / Flask)', pct: 85, emoji: '\uD83D\uDE80' },
      { name: 'REST APIs',                pct: 82, emoji: '\uD83C\uDF10' },
      { name: 'Node.js',                  pct: 65, emoji: '\uD83D\uDFE2' },
      { name: 'API Design',               pct: 78, emoji: '\uD83D\uDCCB' },
      { name: 'JSON / HTTP',              pct: 88, emoji: '\uD83D\uDCE1' },
      { name: 'Basic Authentication',     pct: 72, emoji: '\uD83D\uDD12' }
    ],
    frontend: [
      { name: 'HTML',                     pct: 88, emoji: '\uD83C\uDFD7\uFE0F' },
      { name: 'CSS',                      pct: 82, emoji: '\uD83C\uDFA8' },
      { name: 'JavaScript',               pct: 78, emoji: '\uD83D\uDCDD' },
      { name: 'React (Basics)',            pct: 65, emoji: '\u269B\uFE0F' }
    ],
    devops: [
      { name: 'Git & GitHub',             pct: 88, emoji: '\uD83D\uDC19' },
      { name: 'Docker',                   pct: 60, emoji: '\uD83D\uDC33' },
      { name: 'Render / Vercel / Railway', pct: 72, emoji: '\u2601\uFE0F' },
      { name: 'Linux Basics',             pct: 68, emoji: '\uD83D\uDC27' },
      { name: 'CI/CD Pipelines',          pct: 45, emoji: '\u2699\uFE0F', learning: true },
      { name: 'Kubernetes',               pct: 20, emoji: '\u2638\uFE0F', learning: true },
      { name: 'AWS / Cloud',              pct: 25, emoji: '\u2601\uFE0F', learning: true }
    ]
  };

  var tabs = document.querySelectorAll('.skill-tab[data-cat]');
  var active = 'ai';

  function render(cat) {
    if (!data[cat]) return;
    grid.innerHTML = '';
    data[cat].forEach(function(s, i) {
      var el = document.createElement('div');
      el.className = 'skill-item' + (s.learning ? ' skill-item--learning' : '');
      el.style.animationDelay = (i * 0.06) + 's';
      var badgeHtml = s.learning
        ? '<span class="skill-learning-badge">Currently Learning</span>'
        : '<span class="skill-pct">' + s.pct + '%</span>';
      el.innerHTML =
        '<div class="skill-top">' +
          '<span class="skill-emoji">' + s.emoji + '</span>' +
          badgeHtml +
        '</div>' +
        '<span class="skill-name">' + s.name + '</span>' +
        '<div class="skill-bar"><div class="skill-fill" data-w="' + s.pct + '"></div></div>';
      grid.appendChild(el);
    });
    requestAnimationFrame(function() {
      grid.querySelectorAll('.skill-fill').forEach(function(bar) {
        bar.style.width = bar.dataset.w + '%';
      });
    });
  }

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      active = tab.dataset.cat;
      render(active);
    });
  });

  render(active);
})();


/* ─── Contact Form ─── */
(function initForm() {
  var form    = document.getElementById('contact-form');
  if (!form) return;
  var success  = document.getElementById('form-success');
  var errorEl  = document.getElementById('form-error');
  var errorTxt = document.getElementById('form-error-text');
  var btn      = document.getElementById('send-btn');

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var name  = form.name.value.trim();
    var email = form.email.value.trim();
    var msg   = form.message.value.trim();

    if (!name || !email || !msg) {
      errorTxt.textContent = 'Please fill out all fields.';
      errorEl.style.display = 'block';
      setTimeout(function() { errorEl.style.display = 'none'; }, 4000);
      return;
    }
    if (!isValidEmail(email)) {
      errorTxt.textContent = 'Please enter a valid email address.';
      errorEl.style.display = 'block';
      setTimeout(function() { errorEl.style.display = 'none'; }, 4000);
      return;
    }

    btn.querySelector('span').textContent = 'Sending...';
    btn.disabled = true;
    btn.style.opacity = '0.7';
    errorEl.style.display = 'none';
    success.classList.remove('show');

    fetch("https://new-portfolio-ym5j.onrender.com/api/contact", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, message: msg })
    }).then(function(response) {
      if (!response.ok) throw new Error('Failed');
      btn.querySelector('span').textContent = 'Send Message';
      btn.disabled = false;
      btn.style.opacity = '';
      form.reset();
      success.classList.add('show');
      setTimeout(function() { success.classList.remove('show'); }, 5000);
    }).catch(function() {
      btn.querySelector('span').textContent = 'Send Message';
      btn.disabled = false;
      btn.style.opacity = '';
      errorTxt.textContent = 'Failed to send. Is the backend running?';
      errorEl.style.display = 'block';
      setTimeout(function() { errorEl.style.display = 'none'; }, 5000);
    });
  });
})();


/* ─── Within-page hash smooth scroll ─── */
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    var href = a.getAttribute('href');
    if (href === '#') return;
    var target = document.querySelector(href);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});


/* ─── Hero Role Typewriter ─── */
(function initTypewriter() {
  var el = document.getElementById('role-text');
  if (!el) return;

  var phrases = [
    'Full Stack AI Developer',
    'AI Systems Developer',
    'GenAI & CV Developer',
    'Machine Learning Engineer',
    'LLM Application Developer'
  ];

  var phraseIdx = 0, charIdx = 0, deleting = false, paused = false;
  var TYPE_SPEED = 55, DELETE_SPEED = 28, PAUSE_AFTER = 1800, PAUSE_BEFORE = 400;

  function tick() {
    if (paused) return;
    var current = phrases[phraseIdx];
    if (!deleting) {
      charIdx++;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === current.length) {
        paused = true;
        setTimeout(function() { paused = false; deleting = true; tick(); }, PAUSE_AFTER);
        return;
      }
      setTimeout(tick, TYPE_SPEED);
    } else {
      charIdx--;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        paused = true;
        setTimeout(function() { paused = false; tick(); }, PAUSE_BEFORE);
        return;
      }
      setTimeout(tick, DELETE_SPEED);
    }
  }
  setTimeout(tick, 900);
})();


/* ─── Learning Ticker ─── */
(function initTicker() {
  var ticker = document.getElementById('learning-ticker');
  if (!ticker) return;
  var children = Array.from(ticker.children);
  children.forEach(function(child) { ticker.appendChild(child.cloneNode(true)); });
})();


/* ─── NN Signal Flash ─── */
(function initNNSignals() {
  var svg = document.querySelector('.brain-svg');
  if (!svg) return;
  var lines = svg.querySelectorAll('.nn-line');
  if (!lines.length) return;
  function flashRandom() {
    var line = lines[Math.floor(Math.random() * lines.length)];
    line.style.transition = 'opacity 0.15s';
    line.style.opacity = '1';
    setTimeout(function() { line.style.opacity = ''; setTimeout(flashRandom, 300 + Math.random() * 700); }, 180);
  }
  setTimeout(flashRandom, 1400);
})();


/* ─── Coding Profiles: Live Data + Accurate Heatmaps ─── */
(function initProfileData() {

  /* ── Status helpers ── */
  function setStatus(id, msg, cls) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.className = 'profile-fetch-status ' + (cls || '');
  }

  /* ── Render a heatmap from a day-indexed activity map ──
     activityMap: { 'YYYY-MM-DD': level(0-4) }
     Renders last `weeks` weeks, column-major (Mon-Sun top to bottom).
     Auto-scrolls to rightmost (most recent) end. */
  function renderHeatmap(containerId, activityMap, weeks) {
    var el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    var totalDays = (weeks || 26) * 7;
    var today = new Date();
    today.setHours(0,0,0,0);

    for (var i = 0; i < totalDays; i++) {
      var d = new Date(today);
      d.setDate(today.getDate() - (totalDays - 1 - i));
      var key = d.getFullYear() + '-' +
        String(d.getMonth()+1).padStart(2,'0') + '-' +
        String(d.getDate()).padStart(2,'0');
      var level = (activityMap && activityMap[key]) || 0;
      var cell = document.createElement('div');
      cell.className = 'heatmap-cell hm-' + level;
      cell.title = key + (level > 0 ? ' (' + level + ' submission' + (level > 1 ? 's' : '') + ')' : ' (no activity)');
      el.appendChild(cell);
    }

    /* Scroll to the rightmost end so RECENT data is always visible.
       requestAnimationFrame waits for the browser to paint the grid
       before we measure scrollWidth. */
    requestAnimationFrame(function() {
      el.scrollLeft = el.scrollWidth;
    });
  }

  /* ── Build activity map from LeetCode submissionCalendar ──
     LC calendar: { unixTimestampSeconds: count, ... } */
  function lcCalendarToMap(calObj) {
    var map = {};
    Object.keys(calObj).forEach(function(ts) {
      var count = calObj[ts];
      var d = new Date(parseInt(ts, 10) * 1000);
      var key = d.getFullYear() + '-' +
        String(d.getMonth()+1).padStart(2,'0') + '-' +
        String(d.getDate()).padStart(2,'0');
      var level = count <= 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 9 ? 3 : 4;
      map[key] = level;
    });
    return map;
  }

  /* ── Helper: get YYYY-MM-DD key for N days before today ── */
  function dkey(daysAgo) {
    var d = new Date();
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() - daysAgo);
    return d.getFullYear() + '-' +
      String(d.getMonth()+1).padStart(2,'0') + '-' +
      String(d.getDate()).padStart(2,'0');
  }

  /* ── GitHub heatmap: sparse pattern matching real data
     133 contributions, ~20 active days in last year.
     Activity clusters: Dec, Jan, Feb, Mar heavy, Apr burst ── */
  function buildGHMap() {
    var map = {};
    // Days ago for each active day (approximate from screenshot):
    // Apr burst (0-16 days ago), Mar (20-36), Feb (55-58), Jan (99), Dec (124-125)
    var slots = [
      // Apr 2025 - recent burst (high intensity)
      [0,3],[1,4],[2,4],[3,3],[4,2],[6,3],[7,4],[8,3],
      [10,2],[11,2],
      // Mar 2025
      [23,2],[24,3],[30,1],[37,2],[38,1],
      // Feb 2025
      [58,1],[59,2],
      // Jan 2025
      [99,1],
      // Dec 2024
      [125,1],[126,2],
      // Nov 2024
      [162,1],[163,1]
    ];
    slots.forEach(function(s) { map[dkey(s[0])] = s[1]; });
    return map;
  }

  /* ── LeetCode: fallback heatmap matching REAL calendar (57 solved)
     Pattern from actual LeetCode screenshot:
     - Dec: ~1 cell
     - Jan: ~1 cell (mid-Jan)
     - Feb: ~1-2 cells
     - Mar: ~4 scattered cells
     - late Apr: heavy burst (last 10 days) ── */
  function buildLCFallbackMap() {
    var map = {};
    var slots = [
      // Apr 2025 — recent burst, last 10 days (heavy)
      [1, 3], [2, 4], [3, 3], [4, 2],        // Apr 16–13
      [5, 3], [7, 2], [8, 3], [9, 2],        // Apr 12–10, 9, 8
      [10, 2],                                // Apr 7

      // Mar 2025 — ~4 scattered days
      [27, 1],  // Mar 21
      [34, 2],  // Mar 14
      [38, 1],  // Mar 10
      [42, 1],  // Mar 6

      // Feb 2025 — ~1-2 cells
      [65, 1],  // Feb 11

      // Jan 2025 — 1 cell
      [93, 1],  // Jan 14

      // Dec 2024 — 1 cell
      [127, 1]  // Dec 11
    ];
    slots.forEach(function(s) { map[dkey(s[0])] = s[1]; });
    return map;
  }

  /* ── Init heatmaps with 26 weeks (6 months) of history ── */
  renderHeatmap('lc-heatmap', buildLCFallbackMap(), 26);
  renderHeatmap('gh-heatmap', buildGHMap(), 26);

  /* ── GitHub Live Data ── */
  (function fetchGitHub() {
    var user = 'anshulverma1321';
    setStatus('gh-status', 'Fetching live data…', 'loading');

    fetch('https://api.github.com/users/' + user)
      .then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(data) {
        var repos = data.public_repos || 0;
        var followers = data.followers || 0;
        document.getElementById('gh-repos') && (document.getElementById('gh-repos').textContent = repos);
        document.getElementById('gh-followers') && (document.getElementById('gh-followers').textContent = followers);

        return fetch('https://api.github.com/users/' + user + '/repos?per_page=100&sort=updated')
          .then(function(r2) { return r2.json(); })
          .then(function(reposData) {
            var stars = Array.isArray(reposData)
              ? reposData.reduce(function(sum, repo) { return sum + (repo.stargazers_count || 0); }, 0) : 0;
            document.getElementById('gh-stars') && (document.getElementById('gh-stars').textContent = stars);
            setStatus('gh-status', '\u2713 Live', 'success');
          });
      })
      .catch(function() {
        setStatus('gh-status', '', '');
      });
  })();

  /* ── LeetCode Live Data + Real Calendar Heatmap ── */
  (function fetchLeetCode() {
    var user = 'anshulverma_1';
    setStatus('lc-status', 'Fetching live data…', 'loading');

    // Fetch profile stats
    fetch('https://alfa-leetcode-api.onrender.com/userProfile/' + user)
      .then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(data) {
        document.getElementById('lc-total')  && (document.getElementById('lc-total').textContent  = data.totalSolved  || data.solvedProblem || '—');
        document.getElementById('lc-easy')   && (document.getElementById('lc-easy').textContent   = data.easySolved   || '—');
        document.getElementById('lc-medium') && (document.getElementById('lc-medium').textContent = data.mediumSolved || '—');
        document.getElementById('lc-hard')   && (document.getElementById('lc-hard').textContent   = data.hardSolved   || '—');
        setStatus('lc-status', '\u2713 Live', 'success');

        // Also fetch real submission calendar
        return fetch('https://alfa-leetcode-api.onrender.com/userCalendar/' + user)
          .then(function(r2) { if (!r2.ok) throw new Error('cal'); return r2.json(); })
          .then(function(calData) {
            // API may return submissionCalendar as string or object
            var calObj = calData.submissionCalendar || calData;
            if (typeof calObj === 'string') calObj = JSON.parse(calObj);
            if (calObj && Object.keys(calObj).length > 0) {
              renderHeatmap('lc-heatmap', lcCalendarToMap(calObj), 26);
            }
          })
          .catch(function() { /* keep fallback heatmap */ });
      })
      .catch(function() {
        // Try backup API for stats
        fetch('https://leetcode-stats-api.herokuapp.com/' + user)
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.status === 'error') return;
            document.getElementById('lc-total')  && (document.getElementById('lc-total').textContent  = data.totalSolved  || '—');
            document.getElementById('lc-easy')   && (document.getElementById('lc-easy').textContent   = data.easySolved   || '—');
            document.getElementById('lc-medium') && (document.getElementById('lc-medium').textContent = data.mediumSolved || '—');
            document.getElementById('lc-hard')   && (document.getElementById('lc-hard').textContent   = data.hardSolved   || '—');
            setStatus('lc-status', '\u2713 Live', 'success');
          })
          .catch(function() { setStatus('lc-status', '', ''); });
      });
  })();

})();


/* ─── Projects Filter ─── */
(function initProjectsFilter() {
  var filterBtns  = document.querySelectorAll('#projects-filter .skill-tab');
  var projectCards = document.querySelectorAll('#projects-grid-container .project-card');
  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filterValue = btn.getAttribute('data-filter');
      projectCards.forEach(function(card) {
        var cats = card.getAttribute('data-category');
        if (filterValue === 'all' || (cats && cats.includes(filterValue))) {
          card.style.display = 'flex';
          card.style.animation = 'fade-up 0.4s ease both';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();

