/**
 * JP College ERP - Modern White & Blue Navigation Header & Dark Blue Sidebar Component
 */
class NavbarComponent {
  constructor() {
    this.pages = [
      { name: 'Dashboard', url: 'dashboard.html', path: '/dashboard', icon: 'fa-chart-pie', roles: ['super_admin', 'admin', 'faculty', 'student'] },
      { name: 'Approvals', url: 'approvals.html', path: '/approvals', icon: 'fa-user-check', roles: ['super_admin', 'admin'], badgeId: 'navPendingCountBadge' },
      { name: 'Students', url: 'students.html', path: '/students', icon: 'fa-user-graduate', roles: ['super_admin', 'admin', 'faculty'] },
      { name: 'Faculty', url: 'faculty.html', path: '/faculty', icon: 'fa-chalkboard-user', roles: ['super_admin', 'admin', 'faculty'] },
      { name: 'Departments', url: 'departments.html', path: '/departments', icon: 'fa-building-columns', roles: ['super_admin', 'admin'] },
      { name: 'Subjects', url: 'subjects.html', path: '/subjects', icon: 'fa-book-open', roles: ['super_admin', 'admin', 'faculty'] },
      { name: 'Classes', url: 'classes.html', path: '/classes', icon: 'fa-door-open', roles: ['super_admin', 'admin', 'faculty'] },
      { name: 'Attendance', url: 'attendance.html', path: '/attendance', icon: 'fa-calendar-check', roles: ['super_admin', 'admin', 'faculty', 'student'] },
      { name: 'Internal Marks', url: 'internal-marks.html', path: '/internal-marks', icon: 'fa-file-signature', roles: ['super_admin', 'admin', 'faculty', 'student'] },
      { name: 'Semester Marks', url: 'semester-marks.html', path: '/semester-marks', icon: 'fa-graduation-cap', roles: ['super_admin', 'admin', 'faculty', 'student'] },
      { name: 'Subject Notes', url: 'subject-notes.html', path: '/subject-notes', icon: 'fa-file-pdf', roles: ['super_admin', 'admin', 'faculty', 'student'] },
      { name: 'Assignments', url: 'assignments.html', path: '/assignments', icon: 'fa-tasks', roles: ['super_admin', 'admin', 'faculty', 'student'] },
      { name: 'Timetable', url: 'timetable.html', path: '/timetable', icon: 'fa-calendar-days', roles: ['super_admin', 'admin', 'faculty', 'student'] },
      { name: 'Import & Export', url: 'import-export.html', path: '/import-export', icon: 'fa-file-import', roles: ['super_admin', 'admin', 'faculty'] },
      { name: 'Reports', url: 'reports.html', path: '/reports', icon: 'fa-chart-line', roles: ['super_admin', 'admin', 'faculty'] },
      { name: 'Downloads', url: 'downloads.html', path: '/downloads', icon: 'fa-download', roles: ['super_admin', 'admin', 'faculty', 'student'] },
      { name: 'History', url: 'history.html', path: '/history', icon: 'fa-clock-rotate-left', roles: ['super_admin', 'admin'] },
      { name: 'Settings', url: 'settings.html', path: '/settings', icon: 'fa-gear', roles: ['super_admin', 'admin'] },
      { name: 'About', url: 'about.html', path: '/about', icon: 'fa-circle-info', roles: ['super_admin', 'admin', 'faculty', 'student'] }
    ];
  }

  init() {
    this.checkAuth();
    this.renderHeaderNav();
    this.setupClock();
    this.setupGlobalSearch();
    this.setupNotifications();
    this.fetchPendingBadgeCount();
  }

  checkAuth() {
    const token = localStorage.getItem('jp_dms_token');
    const userStr = localStorage.getItem('jp_dms_user');
    const currentPath = window.location.pathname.toLowerCase();

    if ((!token || !userStr) && !currentPath.endsWith('login.html') && !currentPath.endsWith('register.html') && !currentPath.endsWith('index.html')) {
      window.location.href = 'login.html';
    }
  }

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('jp_dms_user')) || { role: 'super_admin', name: 'Super Admin', email: 'Adminjpcoe@gmail.com' };
    } catch (e) {
      return { role: 'super_admin', name: 'Super Admin', email: 'Adminjpcoe@gmail.com' };
    }
  }

  getActivePage() {
    const currentPath = window.location.pathname.toLowerCase();
    const match = this.pages.find(p => currentPath.endsWith(p.url) || currentPath.endsWith(p.path) || (currentPath === '/' && p.url === 'dashboard.html'));
    return match ? match.url : 'dashboard.html';
  }

  renderHeaderNav() {
    const user = this.getUser();
    const userRole = user.role || 'student';
    const activeUrl = this.getActivePage();

    const allowedPages = this.pages.filter(p => p.roles.includes(userRole));
    const activePageObj = this.pages.find(p => p.url === activeUrl) || { name: 'ERP System', icon: 'fa-graduation-cap' };

    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) return;

    const navLinksHtml = allowedPages.map(page => `
      <a href="${page.url}" class="sidebar-link ${activeUrl === page.url ? 'active' : ''}">
        <i class="fa-solid ${page.icon}"></i>
        <span>${page.name}</span>
        ${page.badgeId ? `<span class="sidebar-badge" id="${page.badgeId}" style="display:none;">0</span>` : ''}
      </a>
    `).join('');

    navbarContainer.innerHTML = `
      <header class="app-header">
        <div class="header-left">
          <button class="sidebar-toggle-btn" id="sidebarToggleBtn" title="Toggle Navigation Menu">
            <i class="fa-solid fa-bars"></i>
          </button>
          <div class="header-brand">
            <div class="badge-blue-icon">JPC</div>
            <div class="brand-title-group">
              <span class="brand-name">J.P. COLLEGE OF ENGINEERING</span>
              <span class="brand-subtext">Department Management ERP</span>
            </div>
          </div>
        </div>

        <div class="header-right">
          <div class="global-search-wrapper">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input type="text" id="globalSearchInput" class="global-search-input" placeholder="Search student reg no, faculty ID, dept...">
          </div>

          <div class="header-clock" id="headerLiveClock">00:00:00 AM</div>

          <div class="notification-dropdown-wrapper">
            <button class="icon-btn" id="notifBellBtn" title="Notifications">
              <i class="fa-solid fa-bell"></i>
              <span class="icon-badge" id="notifBadgeCount" style="display:none;">0</span>
            </button>
            <div class="dropdown-menu notif-dropdown" id="notifDropdown">
              <div class="dropdown-header">
                <strong>System Notifications</strong>
                <a href="#" id="clearNotifsBtn" style="font-size:0.75rem; color:var(--primary);">Mark all read</a>
              </div>
              <div class="notif-list" id="notifListContainer">
                <div class="notif-empty">No unread notifications</div>
              </div>
            </div>
          </div>

          <div class="user-profile-menu">
            <img src="${user.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}" alt="${user.name}" class="avatar-img">
            <div class="user-info-text">
              <span class="user-name">${user.name || 'User'}</span>
              <span class="user-role-badge">${userRole.toUpperCase()}</span>
            </div>
            <button class="icon-btn" id="logoutHeaderBtn" title="Logout Account">
              <i class="fa-solid fa-right-from-bracket" style="color:var(--error);"></i>
            </button>
          </div>
        </div>
      </header>

      <aside class="app-sidebar" id="appSidebar">
        <div class="sidebar-header">
          <div style="font-size: 0.85rem; font-weight: 700; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.5px;">
            <i class="fa-solid ${activePageObj.icon}" style="margin-right: 0.5rem; color: #60A5FA;"></i> ERP Navigation
          </div>
        </div>

        <nav class="sidebar-nav">
          ${navLinksHtml}
        </nav>

        <div class="sidebar-footer">
          <div style="font-size: 0.75rem; color: #93C5FD; text-align: center;">
            JP College ERP v2.4 (White & Blue)
          </div>
        </div>
      </aside>
      <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
    `;

    document.getElementById('sidebarToggleBtn')?.addEventListener('click', () => {
      document.getElementById('appSidebar')?.classList.toggle('open');
      document.getElementById('sidebarBackdrop')?.classList.toggle('active');
    });

    document.getElementById('sidebarBackdrop')?.addEventListener('click', () => {
      document.getElementById('appSidebar')?.classList.remove('open');
      document.getElementById('sidebarBackdrop')?.classList.remove('active');
    });

    document.getElementById('logoutHeaderBtn')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out of JP College ERP?')) {
        localStorage.removeItem('jp_dms_token');
        localStorage.removeItem('jp_dms_user');
        localStorage.removeItem('jp_dms_role');
        window.location.href = 'login.html';
      }
    });
  }

  setupClock() {
    const clockEl = document.getElementById('headerLiveClock');
    if (!clockEl) return;
    const update = () => {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    update();
    setInterval(update, 1000);
  }

  setupGlobalSearch() {
    const input = document.getElementById('globalSearchInput');
    if (!input) return;
    input.addEventListener('keyup', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const rows = document.querySelectorAll('tbody tr');
      rows.forEach(r => {
        const text = r.textContent.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  setupNotifications() {
    const btn = document.getElementById('notifBellBtn');
    const menu = document.getElementById('notifDropdown');
    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove('active');
      }
    });
  }

  async fetchPendingBadgeCount() {
    const user = this.getUser();
    if (user.role !== 'admin' && user.role !== 'super_admin') return;

    try {
      const baseUrl = window.APP_CONFIG ? window.APP_CONFIG.getApiBaseUrl() : 'http://localhost:5000/api';
      const token = localStorage.getItem('jp_dms_token');
      const res = await fetch(`${baseUrl}/auth/pending-categorized`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && json.counts && json.counts.total > 0) {
        const badge = document.getElementById('navPendingCountBadge');
        if (badge) {
          badge.style.display = 'inline-flex';
          badge.textContent = json.counts.total;
        }
      }
    } catch (e) {}
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const nav = new NavbarComponent();
  nav.init();
});
