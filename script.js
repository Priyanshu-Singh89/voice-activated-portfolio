/**
 * Voice-Activated Portfolio — modular vanilla JS
 * - Web Speech API (recognition) with safe restart & deduplicated commands
 * - Speech Synthesis for short confirmations
 * - Theme persistence, projects (demos + user), admin CRUD
 */

// ---------------------------------------------------------------------------
// Constants & demo data
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'voicePortfolioUserProjects';

/** Built-in showcase projects (always listed first; not stored in localStorage). */
const DEMO_PROJECTS = [
  {
    id: 'demo-ai-voice-assistant',
    title: 'AI Voice Assistant',
    desc:
      'Concept demo: natural-language commands, speech recognition, and synthesized replies—similar patterns to this portfolio.',
    image:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80&auto=format&fit=crop',
    link: 'https://gemini.google.com/app',
    isDemo: true,
  },
  {
    id: 'demo-weather-app',
    title: 'Weather App',
    desc:
      'A clean weather experience: location-aware forecasts, responsive cards, and API-driven data—try a live forecast hub.',
    image:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80&auto=format&fit=crop',
    link: 'https://open-meteo.com/en',
    isDemo: true,
  },
];

/**
 * Command matchers: each entry is { test: (normalized) => boolean, run: () => void, say: string }
 * normalized text is lowercase, collapsed spaces, light punctuation strip.
 */
function buildCommandTable(ctx) {
  const { scrollToSection, toggleTheme, scrollByViewport } = ctx;

  return [
    // Project-specific voice commands
    {
      id: 'project-a',
      test: (t) => /\\bproject\\s+a\\b/.test(t) || /\\bopen\\s+project\\s+a\\b/.test(t),
      run: () => {
        window.open('https://github.com/Priyanshu_Singh89/project-a', '_blank');
      },
      say: 'Opening Project A.',
    },
    {
      id: 'project-b',
      test: (t) => /\\bproject\\s+b\\b/.test(t) || /\\bopen\\s+project\\s+b\\b/.test(t),
      run: () => {
        window.open('https://github.com/Priyanshu_Singh89/project-b', '_blank');
      },
      say: 'Opening Project B.',
    },
    {
      id: 'project-shramik-setu',
      test: (t) => /\\b(shramik\\s+)?setu\\b/.test(t) || /\\bopen\\s+(shramik\\s+)?setu\\b/.test(t),
      run: () => {
        window.open('https://shramik-setu.example.com', '_blank');
      },
      say: 'Opening Shramik Setu project.',
    },
    // Social media commands
    {
      id: 'social-linkedin',
      test: (t) =>
        /\\bopen\\s+linkedin\\b/.test(t) ||
        /\\blinkedin\\b/.test(t) ||
        /\\bconnect\\s+linkedin\\b/.test(t),
      run: () => {
        window.open('https://www.linkedin.com/in/priyanshu-singh-418493379', '_blank');
      },
      say: 'Opening LinkedIn profile.',
    },
    {
      id: 'social-github',
      test: (t) =>
        /\\bopen\\s+github\\b/.test(t) ||
        /\\bgithub\\b/.test(t) ||
        /\\bview\\s+my\\s+code\\b/.test(t),
      run: () => {
        window.open('https://github.com/Priyanshu_Singh89', '_blank');
      },
      say: 'Opening GitHub profile.',
    },
    {
      id: 'social-email',
      test: (t) =>
        /\\bopen\\s+email\\b/.test(t) ||
        /\\bsend\\s+email\\b/.test(t) ||
        /\\bgmail\\b/.test(t) ||
        /\\bcontact\\s+me\\b/.test(t),
      run: () => {
        window.location.href = 'mailto:priyanshukumar0415@gmail.com';
      },
      say: 'Opening email.',
    },
    // Standard navigation commands
    {
      id: 'projects',
      test: (t) =>
        /\b(show\s+)?(my\s+)?projects?\b/.test(t) ||
        /\bopen\s+projects?\b/.test(t) ||
        (t.includes('project') && (t.includes('show') || t.includes('see') || t.includes('open'))),
      run: () => scrollToSection('projects'),
      say: 'Showing your projects.',
    },
    {
      id: 'about',
      test: (t) =>
        /\bopen\s+about\b/.test(t) ||
        /\babout\s+(section|me)\b/.test(t) ||
        (t.includes('about') && !t.includes('contact')),
      run: () => scrollToSection('about'),
      say: 'Opening the about section.',
    },
    {
      id: 'skills',
      test: (t) =>
        /\bshow\s+skills\b/.test(t) ||
        /\bopen\s+skills\b/.test(t) ||
        /\bmy\s+skills\b/.test(t) ||
        /\bskills\s+section\b/.test(t) ||
        t === 'skills',
      run: () => scrollToSection('skills'),
      say: 'Here are your skills.',
    },
    {
      id: 'contact',
      test: (t) => /\bcontact\b/.test(t) || /\bget\s+in\s+touch\b/.test(t),
      run: () => scrollToSection('contact'),
      say: 'Opening contact.',
    },
    {
      id: 'home',
      test: (t) =>
        /\bgo\s+to\s+top\b/.test(t) ||
        /\b(scroll\s+)?top\b/.test(t) ||
        /\bback\s+to\s+top\b/.test(t) ||
        t === 'home' ||
        /\bgo\s+home\b/.test(t),
      run: () => scrollToSection('home'),
      say: 'Back to the top.',
    },
    {
      id: 'theme',
      test: (t) =>
        /\bchange\s+theme\b/.test(t) ||
        /\b(toggle|switch)\s+(theme|mode)\b/.test(t) ||
        /\b(dark|light)\s+mode\b/.test(t),
      run: () => toggleTheme(),
      say: 'Theme updated.',
    },
    {
      id: 'scroll-down',
      test: (t) =>
        /\bscroll\s+down\b/.test(t) ||
        /\bpage\s+down\b/.test(t) ||
        t === 'down',
      run: () => scrollByViewport(0.85),
      say: 'Scrolling down.',
    },
    {
      id: 'admin',
      test: (t) => /\badmin\b/.test(t) && (t.includes('open') || t.includes('show') || t.includes('panel')),
      run: () => ctx.openAdmin(),
      say: 'Opening the admin panel.',
    },
  ];
}

// ---------------------------------------------------------------------------
// DOM refs
// ---------------------------------------------------------------------------

const dom = {
  micBtn: null,
  micLabel: null,
  voiceStatus: null,
  transcriptInterim: null,
  transcriptFinal: null,
  listeningIndicator: null,
  unsupportedBanner: null,
  dismissBanner: null,
  adminBtn: null,
  adminPanel: null,
  closeAdmin: null,
  projectForm: null,
  projectList: null,
  projectSearch: null,
  clearProjects: null,
  themeToggle: null,
  navLinks: null,
  menuToggle: null,
};

function cacheDom() {
  dom.micBtn = document.getElementById('mic-toggle');
  dom.micLabel = dom.micBtn?.querySelector('.mic-label') ?? null;
  dom.voiceStatus = document.getElementById('voice-status');
  dom.transcriptInterim = document.getElementById('transcript-interim');
  dom.transcriptFinal = document.getElementById('transcript-final');
  dom.listeningIndicator = document.getElementById('listening-indicator');
  dom.unsupportedBanner = document.getElementById('voice-unsupported-banner');
  dom.dismissBanner = document.getElementById('dismiss-voice-banner');
  dom.adminBtn = document.getElementById('toggle-admin');
  dom.adminPanel = document.getElementById('admin-panel');
  dom.closeAdmin = document.getElementById('close-admin');
  dom.projectForm = document.getElementById('project-form');
  dom.projectList = document.getElementById('project-list');
  dom.projectSearch = document.getElementById('project-search');
  dom.clearProjects = document.getElementById('clear-projects');
  dom.themeToggle = document.getElementById('toggle-theme');
  dom.navLinks = document.querySelectorAll('.nav-link');
  dom.menuToggle = document.getElementById('menu-toggle');
}

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

function applyThemeFromStorage() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    document.body.classList.add('light-theme');
    const icon = dom.themeToggle?.querySelector('.theme-icon');
    if (icon) icon.textContent = '☀️';
  } else {
    document.body.classList.remove('light-theme');
    const icon = dom.themeToggle?.querySelector('.theme-icon');
    if (icon) icon.textContent = '🌙';
  }
}

function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const light = document.body.classList.contains('light-theme');
  localStorage.setItem('theme', light ? 'light' : 'dark');
  const icon = dom.themeToggle?.querySelector('.theme-icon');
  if (icon) icon.textContent = light ? '☀️' : '🌙';
}

// ---------------------------------------------------------------------------
// Navigation & scroll helpers
// ---------------------------------------------------------------------------

function scrollToSection(id) {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  el?.classList.add('section-flash');
  window.setTimeout(() => el?.classList.remove('section-flash'), 1200);
}

function scrollByViewport(fraction) {
  window.scrollBy({ top: window.innerHeight * fraction, behavior: 'smooth' });
}

function openAdminPanel() {
  dom.adminPanel?.classList.remove('hidden');
}

// ---------------------------------------------------------------------------
// Speech synthesis
// ---------------------------------------------------------------------------

const speech = {
  supported: typeof window.speechSynthesis !== 'undefined',

  /** Speak a short phrase; cancels queued speech to avoid overlap. */
  speak(text) {
    if (!this.supported || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1;
      u.pitch = 1;
      u.volume = 1;
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => /en(-|_)US/i.test(v.lang)) || voices.find((v) => v.lang.startsWith('en'));
      if (preferred) u.voice = preferred;
      window.speechSynthesis.speak(u);
    } catch {
      /* ignore synthesis errors */
    }
  },
};

// ---------------------------------------------------------------------------
// Text normalization & command execution (dedupe)
// ---------------------------------------------------------------------------

function normalizeTranscript(raw) {
  return raw
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

let lastCommandFingerprint = '';
let lastCommandAt = 0;
const COMMAND_COOLDOWN_MS = 1800;

function shouldIgnoreDuplicate(normalizedFinal) {
  const now = Date.now();
  if (normalizedFinal === lastCommandFingerprint && now - lastCommandAt < COMMAND_COOLDOWN_MS) {
    return true;
  }
  lastCommandFingerprint = normalizedFinal;
  lastCommandAt = now;
  return false;
}

function runFirstMatchingCommand(normalized) {
  const table = buildCommandTable({
    scrollToSection,
    toggleTheme,
    scrollByViewport,
    openAdmin: openAdminPanel,
  });

  for (const cmd of table) {
    if (cmd.test(normalized)) {
      cmd.run();
      speech.speak(cmd.say);
      return cmd.id;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Speech recognition
// ---------------------------------------------------------------------------

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function getMicPreflightBlockReason() {
  if (window.location?.protocol === 'file:') return 'file-protocol';
  if (!window.isSecureContext) return 'insecure-context';
  if (!SpeechRecognition) return 'speechrecognition-unavailable';
  return null;
}

async function getMicDiagnostics() {
  const diag = {
    secureContext: Boolean(window.isSecureContext),
    protocol: window.location?.protocol || '',
    hasGetUserMedia: Boolean(navigator.mediaDevices?.getUserMedia),
    permission: 'unknown',
    audioInputs: 'unknown',
  };

  // Permissions API is not consistent across browsers.
  try {
    if (navigator.permissions?.query) {
      const res = await navigator.permissions.query({ name: 'microphone' });
      diag.permission = res?.state || 'unknown';
    }
  } catch {
    /* ignore */
  }

  try {
    if (navigator.mediaDevices?.enumerateDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter((d) => d.kind === 'audioinput');
      diag.audioInputs = String(inputs.length);
    }
  } catch {
    /* ignore */
  }

  return diag;
}

async function warmUpMicPermission() {
  // Optional: helps trigger the browser mic prompt early. Recognition itself
  // must still be started from the click gesture for best reliability.
  if (!navigator.mediaDevices?.getUserMedia) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
  } catch {
    // Ignore; SpeechRecognition.onerror will surface the real reason.
  }
}

const voice = {
  recognition: null,
  /** User intent: mic should be active */
  wantsListening: false,
  /** True while recognition.start() has been called until onend (avoids double start) */
  sessionActive: false,
  restartTimer: null,
  consecutiveStartFailures: 0,
  restartStreak: 0,
  lastEndAt: 0,
  lastUserStartAt: 0,
  lastError: '',

  isSupported() {
    return Boolean(SpeechRecognition);
  },

  init() {
    if (!this.isSupported()) {
      dom.unsupportedBanner?.classList.remove('hidden');
      if (dom.micBtn) dom.micBtn.disabled = true;
      dom.micBtn?.classList.add('mic-disabled');
      if (dom.voiceStatus) dom.voiceStatus.textContent = 'Voice not supported';
      if (dom.transcriptFinal) {
        dom.transcriptFinal.textContent =
          'Your browser does not support the Web Speech API. Try Chrome or Edge on desktop.';
      }
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      this.sessionActive = true;
      this.consecutiveStartFailures = 0;
      setListeningUi(true);
      if (dom.voiceStatus) dom.voiceStatus.textContent = 'Listening…';
    };

    rec.onaudiostart = () => {};

    rec.onresult = (event) => {
      let interim = '';
      let finalChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += piece;
        } else {
          interim += piece;
        }
      }

      if (dom.transcriptInterim) {
        dom.transcriptInterim.textContent = interim ? interim : '';
      }

      if (finalChunk) {
        if (dom.transcriptInterim) dom.transcriptInterim.textContent = '';
        const raw = finalChunk.trim();
        const normalized = normalizeTranscript(raw);
        if (dom.transcriptFinal) {
          dom.transcriptFinal.textContent = raw ? `Heard: “${raw}”` : '';
        }
        if (normalized && !shouldIgnoreDuplicate(normalized)) {
          runFirstMatchingCommand(normalized);
        }
      }
    };

    rec.onerror = (e) => {
      this.lastError = e?.error ? String(e.error) : 'unknown';
      if (e.error === 'no-speech' || e.error === 'aborted') {
        return;
      }
      if (e.error === 'not-allowed') {
        if (dom.transcriptFinal) {
          dom.transcriptFinal.textContent = 'Microphone permission denied. Allow mic access and try again.';
        }
        this.wantsListening = false;
        setListeningUi(false);
        speech.speak('Microphone access was blocked.');
        return;
      }
      if (e.error === 'audio-capture') {
        if (dom.transcriptFinal) {
          dom.transcriptFinal.textContent =
            'No microphone was found or it is in use by another app. Close other apps using the mic and try again.';
        }
        this.wantsListening = false;
        setListeningUi(false);
        return;
      }
      if (e.error === 'service-not-allowed' || e.error === 'not-allowed') {
        if (dom.transcriptFinal) {
          dom.transcriptFinal.textContent =
            'Voice service was blocked by the browser. Check site permissions and try again.';
        }
        this.wantsListening = false;
        setListeningUi(false);
        return;
      }
      if (dom.transcriptFinal && e.error !== 'network') {
        dom.transcriptFinal.textContent = `Voice error: ${e.error}. You can try again.`;
      }
    };

    rec.onend = () => {
      this.sessionActive = false;
      if (!this.wantsListening) {
        setListeningUi(false);
        return;
      }
      const now = Date.now();
      // If recognition keeps ending quickly, stop the loop and show guidance.
      const endedTooFast = now - this.lastEndAt < 900;
      this.lastEndAt = now;
      this.restartStreak = endedTooFast ? this.restartStreak + 1 : 0;
      if (this.restartStreak >= 4) {
        this.wantsListening = false;
        setListeningUi(false);
        this.restartStreak = 0;
        if (dom.voiceStatus) dom.voiceStatus.textContent = 'Mic stopped';
        if (dom.transcriptFinal) dom.transcriptFinal.textContent = 'Mic keeps stopping. Collecting diagnostics…';
        dom.unsupportedBanner?.classList.remove('hidden');
        getMicDiagnostics().then((d) => {
          if (!dom.transcriptFinal) return;
          dom.transcriptFinal.textContent =
            `Mic stopped repeatedly. ` +
            `Last error: ${this.lastError || 'none'}. ` +
            `Permission: ${d.permission}. ` +
            `Audio inputs: ${d.audioInputs}. ` +
            `Open on http://localhost in Chrome/Edge and set Microphone: Allow.`;
        });
        return;
      }
      // Unexpected end while user still wants listening: restart after a tick (Chrome quirk).
      window.clearTimeout(this.restartTimer);
      const delay = Math.min(120 + this.restartStreak * 250, 1200);
      this.restartTimer = window.setTimeout(() => {
        if (!this.wantsListening) return;
        try {
          rec.start();
        } catch {
          this.restartTimer = window.setTimeout(() => {
            try {
              if (this.wantsListening) rec.start();
            } catch {
              /* ignore */
            }
          }, 350);
        }
      }, delay);
    };

    this.recognition = rec;
  },

  start() {
    if (!this.recognition) return;
    this.wantsListening = true;
    window.clearTimeout(this.restartTimer);
    try {
      if (!this.sessionActive) {
        this.recognition.start();
      }
    } catch {
      this.consecutiveStartFailures += 1;
      // Try a hard reset: stop/abort then start again.
      try {
        this.recognition.abort?.();
        this.recognition.stop?.();
      } catch {
        /* ignore */
      }

      if (dom.transcriptFinal) {
        dom.transcriptFinal.textContent =
          'Could not start the microphone. If you opened this via file://, use http://localhost. Also allow mic permission for this site.';
      }
      if (dom.voiceStatus) dom.voiceStatus.textContent = 'Mic blocked';
      dom.unsupportedBanner?.classList.remove('hidden');

      window.setTimeout(() => {
        try {
          if (this.wantsListening && !this.sessionActive) this.recognition.start();
        } catch {
          if (this.consecutiveStartFailures >= 2 && dom.transcriptFinal) {
            dom.transcriptFinal.textContent =
              'Still blocked. Fix: open in Chrome/Edge on http://localhost, click the lock icon → Site settings → Microphone: Allow, then refresh.';
          }
        }
      }, 250);
    }
  },

  stop() {
    this.wantsListening = false;
    window.clearTimeout(this.restartTimer);
    try {
      if (this.recognition && this.sessionActive) {
        this.recognition.stop();
      }
    } catch {
      /* ignore */
    }
    setListeningUi(false);
  },

  toggle() {
    if (!this.isSupported()) return;
    if (this.wantsListening) {
      this.stop();
      speech.speak('Stopped listening.');
      if (dom.transcriptFinal) dom.transcriptFinal.textContent = 'Listening stopped.';
    } else {
      this.lastUserStartAt = Date.now();
      this.lastError = '';
      const blockReason = getMicPreflightBlockReason();
      if (blockReason) {
        this.wantsListening = false;
        setListeningUi(false);
        dom.unsupportedBanner?.classList.remove('hidden');
        if (dom.voiceStatus) dom.voiceStatus.textContent = 'Mic blocked';
        if (dom.transcriptFinal) {
          dom.transcriptFinal.textContent =
            blockReason === 'file-protocol'
              ? 'Open this project via http://localhost (not by double-clicking the HTML file). Mic is blocked on file:// pages.'
              : 'Microphone is blocked on insecure pages. Open on https:// or run it on http://localhost.';
        }
        return;
      }
      if (dom.transcriptInterim) dom.transcriptInterim.textContent = '';
      if (dom.transcriptFinal) dom.transcriptFinal.textContent = 'Listening… speak a command.';
      if (dom.voiceStatus) dom.voiceStatus.textContent = 'Starting…';
      speech.speak('Listening.');
      // Start recognition immediately within the click gesture (critical for Chrome reliability).
      this.start();
      // Warm-up mic permission prompt (non-blocking).
      warmUpMicPermission();
    }
  },
};

function setListeningUi(active) {
  dom.micBtn?.classList.toggle('mic-listening', active);
  dom.listeningIndicator?.classList.toggle('active', active);
  if (dom.micBtn) dom.micBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
  if (dom.micLabel) dom.micLabel.textContent = active ? 'Stop listening' : 'Start listening';
  if (dom.voiceStatus) {
    dom.voiceStatus.textContent = active ? 'Listening…' : 'Mic idle';
    dom.voiceStatus.classList.toggle('status-listening', active);
  }
}

// ---------------------------------------------------------------------------
// Projects (demos + user)
// ---------------------------------------------------------------------------

function getUserProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUserProjects(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function mergeProjectsForDisplay() {
  return [...DEMO_PROJECTS, ...getUserProjects()];
}

function renderProjects(query = '') {
  if (!dom.projectList) return;
  const q = query.trim().toLowerCase();
  const all = mergeProjectsForDisplay();
  const filtered = q
    ? all.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.desc && p.desc.toLowerCase().includes(q))
      )
    : all;

  dom.projectList.innerHTML = '';

  if (!filtered.length) {
    const empty = document.createElement('p');
    empty.className = 'placeholder';
    empty.textContent = 'No projects match your search.';
    dom.projectList.appendChild(empty);
    return;
  }

  filtered.forEach((p, index) => {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.style.animationDelay = `${Math.min(index * 0.06, 0.5)}s`;

    const img = document.createElement('img');
    img.className = 'project-image';
    img.src = p.image || '';
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => {
      img.remove();
      const ph = document.createElement('div');
      ph.className = 'project-image project-image--placeholder';
      ph.setAttribute('role', 'presentation');
      card.insertBefore(ph, card.firstChild);
    });

    const body = document.createElement('div');
    body.className = 'project-content';

    const h3 = document.createElement('h3');
    h3.textContent = p.title;

    const desc = document.createElement('p');
    desc.textContent = p.desc || '';

    const actions = document.createElement('div');
    actions.className = 'project-actions';

    const demo = document.createElement('a');
    demo.href = p.link || '#';
    demo.className = 'project-link demo-link';
    demo.target = '_blank';
    demo.rel = 'noopener noreferrer';
    demo.textContent = 'Live demo';

    actions.appendChild(demo);

    if (!p.isDemo) {
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'project-delete';
      del.textContent = 'Remove';
      del.addEventListener('click', () => removeUserProject(p.id));
      actions.appendChild(del);
    }

    body.appendChild(h3);
    body.appendChild(desc);
    body.appendChild(actions);

    card.appendChild(img);
    card.appendChild(body);
    dom.projectList.appendChild(card);
  });
}

function addUserProject(event) {
  event.preventDefault();
  const title = document.getElementById('project-title')?.value.trim();
  const desc = document.getElementById('project-description')?.value.trim();
  const image = document.getElementById('project-image')?.value.trim();
  const link = document.getElementById('project-link')?.value.trim();
  if (!title || !desc || !image || !link) return;

  const id = `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const next = getUserProjects().concat({ id, title, desc, image, link, isDemo: false });
  saveUserProjects(next);
  dom.projectForm?.reset();
  dom.adminPanel?.classList.add('hidden');
  renderProjects(dom.projectSearch?.value ?? '');
  speech.speak('Project added.');
}

function removeUserProject(id) {
  const next = getUserProjects().filter((p) => p.id !== id);
  saveUserProjects(next);
  renderProjects(dom.projectSearch?.value ?? '');
}

function clearUserProjects() {
  if (window.confirm('Remove all projects you added? Demo projects will stay.')) {
    saveUserProjects([]);
    renderProjects(dom.projectSearch?.value ?? '');
    speech.speak('Your custom projects were cleared.');
  }
}

// ---------------------------------------------------------------------------
// Mobile nav
// ---------------------------------------------------------------------------

function setupMobileNav() {
  dom.menuToggle?.addEventListener('click', () => {
    const nav = document.getElementById('nav-links');
    const open = nav?.classList.toggle('active');
    dom.menuToggle?.classList.toggle('active', open);
    dom.menuToggle?.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  dom.navLinks?.forEach((link) => {
    link.addEventListener('click', () => {
      document.getElementById('nav-links')?.classList.remove('active');
      dom.menuToggle?.classList.remove('active');
      dom.menuToggle?.setAttribute('aria-expanded', 'false');
    });
  });
}

// ---------------------------------------------------------------------------
// Hero typing effect (plain text — avoids breaking HTML tags mid-string)
// ---------------------------------------------------------------------------

const HERO_SUBTITLE =
  'Try: “Show my projects”, “Open about section”, “Show skills”, “Change theme”, “Scroll down”, “Go to top”.';

function initHeroTyping() {
  const el = document.getElementById('typed-hero');
  const wrap = document.getElementById('hero-subtitle');
  if (!el || !wrap) return;
  wrap.setAttribute('aria-label', HERO_SUBTITLE);

  let i = 0;
  const speed = 22;
  function tick() {
    if (i <= HERO_SUBTITLE.length) {
      el.textContent = HERO_SUBTITLE.slice(0, i);
      i += 1;
      window.setTimeout(tick, speed);
    }
  }
  window.setTimeout(tick, 500);
}

// ---------------------------------------------------------------------------
// Events & boot
// ---------------------------------------------------------------------------

function bindEvents() {
  dom.micBtn?.addEventListener('click', () => voice.toggle());

  dom.themeToggle?.addEventListener('click', () => toggleTheme());

  dom.adminBtn?.addEventListener('click', () => dom.adminPanel?.classList.toggle('hidden'));
  dom.closeAdmin?.addEventListener('click', () => dom.adminPanel?.classList.add('hidden'));
  dom.projectForm?.addEventListener('submit', addUserProject);
  dom.clearProjects?.addEventListener('click', clearUserProjects);

  dom.projectSearch?.addEventListener('input', (e) => renderProjects(e.target.value));

  dom.dismissBanner?.addEventListener('click', () => {
    dom.unsupportedBanner?.classList.add('hidden');
  });

  dom.navLinks?.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href?.startsWith('#')) {
        scrollToSection(href.slice(1));
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cacheDom();
  applyThemeFromStorage();
  bindEvents();
  setupMobileNav();
  voice.init();
  renderProjects();
  initHeroTyping();
});
