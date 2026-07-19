/**
 * JP College of Engineering - Shared Navigation Header & Live Clock Component
 * Automatically injected across all 14 dedicated pages
 */
class NavbarComponent {
  constructor() {
    this.pages = [
      { name: 'Dashboard', url: 'dashboard.html', path: '/dashboard', icon: 'fa-chart-pie' },
      { name: 'Students', url: 'students.html', path: '/students', icon: 'fa-user-graduate' },
      { name: 'Faculty', url: 'faculty.html', path: '/faculty', icon: 'fa-chalkboard-user' },
      { name: 'Departments', url: 'departments.html', path: '/departments', icon: 'fa-building-columns' },
      { name: 'Subjects', url: 'subjects.html', path: '/subjects', icon: 'fa-book-open' },
      { name: 'Classes', url: 'classes.html', path: '/classes', icon: 'fa-door-open' },
      { name: 'Attendance', url: 'attendance.html', path: '/attendance', icon: 'fa-calendar-check' },
      { name: 'Semester Marks', url: 'semester-marks.html', path: '/semester-marks', icon: 'fa-graduation-cap' },
      { name: 'Internal Marks', url: 'internal-marks.html', path: '/internal-marks', icon: 'fa-file-signature' },
      { name: 'Reports', url: 'reports.html', path: '/reports', icon: 'fa-chart-line' },
      { name: 'Downloads', url: 'downloads.html', path: '/downloads', icon: 'fa-download' },
      { name: 'History', url: 'history.html', path: '/history', icon: 'fa-clock-rotate-left' },
      { name: 'Settings', url: 'settings.html', path: '/settings', icon: 'fa-gear' },
      { name: 'About', url: 'about.html', path: '/about', icon: 'fa-circle-info' }
    ];
  }

  init() {
    this.renderHeaderNav();
    this.setupClock();
    this.setupTheme();
    this.setupHamburger();
  }

  // Detect active page name
  getActivePage() {
    const currentPath = window.location.pathname.toLowerCase();
    const match = this.pages.find(p => currentPath.endsWith(p.url) || currentPath.endsWith(p.path) || (currentPath === '/' && p.url === 'dashboard.html'));
    return match ? match.url : 'dashboard.html';
  }

  renderHeaderNav() {
    const activeUrl = this.getActivePage();
    const currentRole = localStorage.getItem('jp_dms_role') || 'Faculty/Admin';

    const headerHtml = `
      <header class="top-navbar-wrapper">
        <!-- Brand Header -->
        <div class="brand-header">
          <a href="dashboard.html" class="brand-info" style="text-decoration:none;">
            <div class="college-logo-badge">JPC</div>
            <div class="college-title">
              <h1>J.P. COLLEGE OF ENGINEERING</h1>
              <p>Department Management System</p>
            </div>
          </a>
          
          <div class="header-right-controls">
            <div class="role-badge" id="roleBadgeDisplay">
              <i class="fa-solid fa-user-shield"></i>
              <span id="roleLabelText">${currentRole}</span>
            </div>

            <div class="live-time-box">
              <div class="live-clock-time" id="liveClockTime">00:00:00 AM</div>
              <div class="live-clock-date" id="liveClockDate">Loading date...</div>
            </div>

            <button class="btn-outline-gold" id="toggleThemeBtn" title="Toggle Theme">
              <i class="fa-solid fa-moon"></i>
            </button>

            <button class="hamburger-btn" id="mobileHamburgerBtn" title="Menu">
              <i class="fa-solid fa-bars"></i>
            </button>
          </div>
        </div>

        <!-- Sticky Navigation Menu -->
        <nav class="nav-menu-bar" id="navMenuBar">
          ${this.pages.map(p => `
            <a href="${p.url}" class="nav-tab-btn ${p.url === activeUrl ? 'active' : ''}">
              <i class="fa-solid ${p.icon}"></i> ${p.name}
            </a>
          `).join('')}
        </nav>
      </header>
    `;

    const container = document.getElementById('navbar-container');
    if (container) {
      container.innerHTML = headerHtml;
    } else {
      document.body.insertAdjacentHTML('afterbegin', headerHtml);
    }
  }

  setupHamburger() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#mobileHamburgerBtn');
      if (btn) {
        const menu = document.getElementById('navMenuBar');
        if (menu) menu.classList.toggle('open');
      }
    });
  }

  setupClock() {
    const timeEl = document.getElementById('liveClockTime');
    const dateEl = document.getElementById('liveClockDate');

    const updateTime = () => {
      const now = new Date();
      if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-US', { hour12: true });
      if (dateEl) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        dateEl.textContent = `${now.toLocaleDateString('en-US', options)} | AY: 2025-2026`;
      }
    };

    updateTime();
    setInterval(updateTime, 1000);
  }

  setupTheme() {
    const savedTheme = localStorage.getItem('jp_dms_theme') || 'dark-theme';
    document.documentElement.setAttribute('data-theme', savedTheme);

    document.addEventListener('click', (e) => {
      if (e.target.closest('#toggleThemeBtn')) {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'golden-theme' ? 'dark-theme' : 'golden-theme';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('jp_dms_theme', newTheme);
      }
    });
  }
}

const navbar = new NavbarComponent();
document.addEventListener('DOMContentLoaded', () => navbar.init());
