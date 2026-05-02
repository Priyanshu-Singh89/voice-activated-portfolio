// ============ VOICE SETUP ============
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;

// DOM elements - will be set after DOM loads
let micBtn, status, output, adminBtn, adminPanel, closeBtn, form, list, search, clearBtn, themeToggle, navLinks;

function setupDOM() {
  micBtn = document.getElementById('mic-toggle');
  status = document.getElementById('voice-status');
  output = document.getElementById('transcript');
  adminBtn = document.getElementById('toggle-admin');
  adminPanel = document.getElementById('admin-panel');
  closeBtn = document.getElementById('close-admin');
  form = document.getElementById('project-form');
  list = document.getElementById('project-list');
  search = document.getElementById('project-search');
  clearBtn = document.getElementById('clear-projects');
  themeToggle = document.getElementById('toggle-theme');
  navLinks = document.querySelectorAll('.nav-link');
}

// Initialize voice
function initVoice() {
  if (!SpeechRecognition) {
    if (status) status.textContent = '❌ Not supported';
    if (micBtn) micBtn.disabled = true;
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    if (status) {
      status.textContent = '🎤 Listening...';
      status.style.color = '#4CAF50';
    }
    if (micBtn) micBtn.innerHTML = '<span class="mic-icon">⏹️</span> Stop Listening';
  };

  recognition.onresult = (e) => {
    let text = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) {
        text += e.results[i][0].transcript.toLowerCase().trim();
      }
    }
    if (text) {
      if (output) output.textContent = `Heard: "${text}"`;
      handleCommand(text);
    }
  };

  recognition.onerror = (e) => {
    if (e.error !== 'no-speech' && output) {
      output.textContent = `Error: ${e.error}`;
    }
  };

  recognition.onend = () => {
    if (isListening) {
      try {
        recognition.start();
      } catch (e) {
        console.log('Auto-restart...');
      }
    }
  };
}

function toggleMic() {
  if (!recognition) return;

  if (isListening) {
    isListening = false;
    recognition.stop();
    if (status) {
      status.textContent = '⏸️ Inactive';
      status.style.color = '#a6c0ff';
    }
    if (micBtn) micBtn.innerHTML = '<span class="mic-icon">🎤</span> Start Listening';
    if (output) output.textContent = 'Click mic to start...';
  } else {
    isListening = true;
    recognition.start();
  }
}

function handleCommand(text) {
  if (text.includes('about')) document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  if (text.includes('project')) document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  if (text.includes('skill')) document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
  if (text.includes('contact')) document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  if (text.includes('home')) document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
  if (text.includes('admin') && adminPanel) adminPanel.classList.remove('hidden');
}

// ============ PROJECT STORAGE ============
function saveData(projects) {
  localStorage.setItem('voiceProjects', JSON.stringify(projects));
}

function getData() {
  const saved = localStorage.getItem('voiceProjects');
  return saved ? JSON.parse(saved) : [];
}

function renderList(query = '') {
  if (!list) return;
  
  const data = getData();
  const filtered = query ? data.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.desc.toLowerCase().includes(query.toLowerCase())
  ) : data;

  list.innerHTML = '';
  if (!filtered.length) {
    list.innerHTML = '<p style="text-align:center;opacity:0.5;">No projects</p>';
    return;
  }

  filtered.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <a href="${p.link}" target="_blank" style="color:#667eea;">View Project →</a>
      <button onclick="deleteItem(${i})" style="margin-left:10px;background:0;border:0;cursor:pointer;color:#f68084;">Delete</button>
    `;
    list.appendChild(card);
  });
}

function addItem(e) {
  e.preventDefault();
  const title = document.getElementById('project-title').value.trim();
  const desc = document.getElementById('project-description').value.trim();
  const link = document.getElementById('project-link').value.trim();

  if (!title || !desc || !link) return;

  const data = getData();
  data.push({ title, desc, link });
  saveData(data);
  renderList();
  form.reset();
  if (adminPanel) adminPanel.classList.add('hidden');
}

function deleteItem(i) {
  const data = getData();
  data.splice(i, 1);
  saveData(data);
  renderList();
}

function clearAll() {
  if (confirm('Delete all projects?')) {
    localStorage.removeItem('voiceProjects');
    renderList();
  }
}

// ============ THEME ============
function toggleTheme() {
  document.body.classList.toggle('light-theme');
  if (themeToggle) {
    const icon = themeToggle.querySelector('.theme-icon');
    if (icon) icon.textContent = document.body.classList.contains('light-theme') ? '☀️' : '🌙';
  }
  localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
}

// ============ EVENTS - Set up after DOM loads ============
function setupEvents() {
  if (micBtn) micBtn.addEventListener('click', toggleMic);
  if (adminBtn) adminBtn.addEventListener('click', () => adminPanel?.classList.toggle('hidden'));
  if (closeBtn) closeBtn.addEventListener('click', () => adminPanel?.classList.add('hidden'));
  if (form) form.addEventListener('submit', addItem);
  if (clearBtn) clearBtn.addEventListener('click', clearAll);
  if (search) search.addEventListener('input', (e) => renderList(e.target.value));
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  if (navLinks) {
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  setupDOM();
  setupEvents();
  initVoice();
  renderList();
  
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light' && themeToggle) {
    document.body.classList.add('light-theme');
    const icon = themeToggle.querySelector('.theme-icon');
    if (icon) icon.textContent = '☀️';
  }
});

