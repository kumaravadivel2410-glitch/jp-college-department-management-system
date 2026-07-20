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
    const activeUrl = this.getActivePage();
    const user = this.getUser();
    const roleKey = user.role || 'super_admin';
    const roleTitle = (roleKey === 'super_admin' || roleKey === 'admin') ? 'Super Admin' : (roleKey === 'faculty' ? 'Faculty' : 'Student Portal');

    const visiblePages = this.pages.filter(p => p.roles.includes(roleKey) || (p.roles.includes('admin') && roleKey === 'super_admin'));

    const headerHtml = `
      <header class="top-navbar-wrapper">
        <!-- Brand Header (White Navbar) -->
        <div class="brand-header">
          <a href="dashboard.html" class="brand-info" style="text-decoration:none;">
            <div class="college-logo-badge">JPC</div>
            <div class="college-title">
              <h1>J.P. COLLEGE OF ENGINEERING</h1>
              <p>College ERP System (${roleTitle})</p>
            </div>
          </a>
          
          <!-- Global Search Bar -->
          <div class="global-search-container">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="globalSearchInput" class="global-search-input" placeholder="Search Reg No, Roll No, Student, Faculty...">
          </div>

          <div class="header-right-controls">
            <!-- Notifications Bell -->
            <button class="notification-bell-btn" id="notificationsBtn" title="Notifications">
              <i class="fa-solid fa-bell"></i>
              <span class="notification-badge-dot"></span>
            </button>

            <!-- Role & Profile Badge -->
            <div class="role-badge" title="${user.email}">
              <i class="fa-solid ${(roleKey === 'super_admin' || roleKey === 'admin') ? 'fa-user-shield' : (roleKey === 'faculty' ? 'fa-chalkboard-user' : 'fa-user-graduate')}"></i>
              <span>${user.name || roleTitle}</span>
            </div>

            <!-- Live Clock -->
            <div class="live-time-box" style="font-size:0.75rem; text-align:right; color:var(--text-secondary);">
              <div id="liveClockTime" style="font-weight:700; color:var(--primary);">00:00:00 AM</div>
              <div id="liveClockDate" style="font-size:0.65rem;">Loading...</div>
            </div>

            <!-- Logout Button -->
            <button class="btn-secondary" id="logoutBtn" style="padding:0.4rem 0.75rem; font-size:0.8rem; color:var(--error); border-color:#FECACA;" title="Logout">
              <i class="fa-solid fa-right-from-bracket"></i> Logout
            </button>
          </div>
        </div>

        <!-- Role Navigation Menu Bar -->
        <nav class="nav-menu-bar" id="navMenuBar">
          ${visiblePages.map(p => `
            <a href="${p.url}" class="nav-tab-btn ${p.url === activeUrl ? 'active' : ''}">
              <i class="fa-solid ${p.icon}"></i> ${p.name}
              ${p.badgeId ? `<span id="${p.badgeId}" class="badge badge-warning" style="display:none; margin-left:0.3rem; font-size:0.7rem;">0</span>` : ''}
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

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out of JP College ERP?')) {
        localStorage.removeItem('jp_dms_token');
        localStorage.removeItem('jp_dms_user');
        localStorage.removeItem('jp_dms_role');
        window.location.href = 'login.html';
      }
    });
  }

  async fetchPendingBadgeCount() {
    const user = this.getUser();
    if (user.role !== 'super_admin' && user.role !== 'admin') return;

    try {
      const baseUrl = window.APP_CONFIG.getApiBaseUrl();
      const token = localStorage.getItem('jp_dms_token');
      const res = await fetch(`${baseUrl}/auth/pending-categorized`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const json = await res.json();
      if (json.success && json.counts && json.counts.total > 0) {
        const badge = document.getElementById('navPendingCountBadge');
        if (badge) {
          badge.textContent = json.counts.total;
          badge.style.display = 'inline-block';
        }
      }
    } catch (e) {}
  }

  setupClock() {
    const update = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

      const timeEl = document.getElementById('liveClockTime');
      const dateEl = document.getElementById('liveClockDate');
      if (timeEl) timeEl.textContent = timeStr;
      if (dateEl) dateEl.textContent = dateStr;
    };
    update();
    setInterval(update, 1000);
  }

  setupGlobalSearch() {
    document.addEventListener('input', (e) => {
      if (e.target && e.target.id === 'globalSearchInput') {
        const query = e.target.value.toLowerCase().trim();
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(query) ? '' : 'none';
        });
      }
    });
  }

  setupNotifications() {
    document.addEventListener('click', async (e) => {
      if (e.target.closest('#notificationsBtn')) {
        try {
          const baseUrl = window.APP_CONFIG.getApiBaseUrl();
          const res = await fetch(`${baseUrl}/notifications`);
          const json = await res.json();
          const list = json.data || [];
          
          const notifText = list.length > 0 
            ? list.slice(0, 5).map(n => `• [${n.type.toUpperCase()}] ${n.title}: ${n.message}`).join('\n\n')
            : 'No new notifications.';

          alert(`🔔 JP College ERP Notifications:\n\n${notifText}`);
        } catch (err) {
          alert('No new notifications.');
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const nav = new NavbarComponent();
  nav.init();
});
