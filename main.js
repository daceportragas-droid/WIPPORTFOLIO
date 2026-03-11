document.addEventListener('DOMContentLoaded', function() {

  // ── NAVBAR ──
  var navbar = document.getElementById('navbar');
  var navLinks = document.getElementById('nav-links');
  var navToggle = document.getElementById('nav-toggle');
  var backTop = document.getElementById('back-top');

  window.addEventListener('scroll', function() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    backTop.classList.toggle('show', window.scrollY > 400);
  });

  navToggle.addEventListener('click', function() {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', function() {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // active nav
  var sections = document.querySelectorAll('section[id], div[id]');
  var links = document.querySelectorAll('.nav-links a');
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        links.forEach(function(l) {
          l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id);
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(function(s) { io.observe(s); });

  // ── SCROLL REVEAL ──
  var cards = document.querySelectorAll('.journal-card');
  var cardIO = new IntersectionObserver(function(entries) {
    entries.forEach(function(e, idx) {
      if (e.isIntersecting) {
        setTimeout(function() { e.target.classList.add('visible'); }, idx * 90);
        cardIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  cards.forEach(function(c) { cardIO.observe(c); });

  // scroll cue
  var scrollCue = document.getElementById('scroll-cue');
  if (scrollCue) scrollCue.addEventListener('click', function() {
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
  });

  // ── LIGHTBOX ──
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbClose = document.getElementById('lb-close');

  function openLB(src, alt) {
    lbImg.src = src; lbImg.alt = alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeLB() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.card-photo, .profile-photo, .about-photo, .heart-cell img').forEach(function(img) {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', function() { openLB(img.src, img.alt); });
  });

  lbClose.addEventListener('click', closeLB);
  lightbox.addEventListener('click', function(e) { if (e.target === lightbox) closeLB(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeLB(); });

  // ── BACK TO TOP ──
  backTop.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // ── MUSIC PLAYER ──
  var audio = document.getElementById('bg-audio');
  var playBtn = document.getElementById('play-btn');
  var muteBtn = document.getElementById('mute-btn');
  var volSlider = document.getElementById('vol-slider');
  var progressFill = document.getElementById('progress-fill');
  var progressBar = document.getElementById('music-progress');
  var timeCur = document.getElementById('time-cur');
  var timeTot = document.getElementById('time-tot');
  var vinylDisc = document.getElementById('vinyl-disc');
  var musicViz = document.getElementById('music-viz');
  var collapseBtn = document.getElementById('collapse-btn');
  var musicWidget = document.getElementById('music-widget');
  var isPlaying = false;
  var isCollapsed = false;

  audio.volume = 0.6;

  function fmtTime(s) {
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function setPlaying(play) {
    isPlaying = play;
    playBtn.innerHTML = play ? '&#9646;&#9646;' : '&#9654;';
    vinylDisc.classList.toggle('playing', play);
    musicViz.classList.toggle('playing', play);
    if (play) { audio.play().catch(function(){}); }
    else { audio.pause(); }
  }

  playBtn.addEventListener('click', function() { setPlaying(!isPlaying); });

  muteBtn.addEventListener('click', function() {
    audio.muted = !audio.muted;
    muteBtn.innerHTML = audio.muted ? '&#128263;' : '&#128266;';
    muteBtn.title = audio.muted ? 'Unmute' : 'Mute';
  });

  volSlider.addEventListener('input', function() {
    audio.volume = parseFloat(volSlider.value);
    if (audio.volume === 0) { audio.muted = true; muteBtn.innerHTML = '&#128263;'; }
    else { audio.muted = false; muteBtn.innerHTML = '&#128266;'; }
  });

  audio.addEventListener('timeupdate', function() {
    if (audio.duration) {
      var pct = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = pct + '%';
      timeCur.textContent = fmtTime(audio.currentTime);
    }
  });

  audio.addEventListener('loadedmetadata', function() {
    timeTot.textContent = fmtTime(audio.duration);
  });

  progressBar.addEventListener('click', function(e) {
    var rect = progressBar.getBoundingClientRect();
    var pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  });

  collapseBtn.addEventListener('click', function() {
    isCollapsed = !isCollapsed;
    musicWidget.classList.toggle('collapsed', isCollapsed);
    collapseBtn.innerHTML = isCollapsed ? '&#43;' : '&#8212;';
    collapseBtn.title = isCollapsed ? 'Expand' : 'Minimise';
  });

  // ── AUTOPLAY: try immediately, then fall back to first interaction ──
  var autoPlayed = false;

  function tryAutoPlay() {
    if (autoPlayed) return;
    audio.play().then(function() {
      autoPlayed = true;
      isPlaying = true;
      playBtn.innerHTML = '&#9646;&#9646;';
      vinylDisc.classList.add('playing');
      musicViz.classList.add('playing');
    }).catch(function() {
      // Browser blocked autoplay — will retry on user gesture
    });
  }

  // Attempt autoplay after short delay
  setTimeout(tryAutoPlay, 600);

  // Retry on any user interaction (scroll, click, touch, keypress)
  ['click', 'keydown', 'touchstart', 'scroll'].forEach(function(evt) {
    document.addEventListener(evt, function handler() {
      if (!autoPlayed) {
        tryAutoPlay();
        if (autoPlayed) document.removeEventListener(evt, handler);
      }
    });
  });
});
