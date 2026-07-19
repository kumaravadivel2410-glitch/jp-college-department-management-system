/**
 * JP College of Engineering - Department Management System
 * Multi-Page Application Controller
 */
class Application {
  constructor() {
    this.currentPage = this.detectCurrentPage();
    this.data = {
      students: [],
      faculty: [],
      departments: [],
      subjects: [],
      classes: [],
      attendance: [],
      semesterMarks: [],
      internalMarks: [],
      history: []
    };
    this.editingId = null;
    this.editingModule = null;
    this.viewingStudentId = null;
  }

  detectCurrentPage() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('students')) return 'students';
    if (path.includes('faculty')) return 'faculty';
    if (path.includes('departments')) return 'departments';
    if (path.includes('subjects')) return 'subjects';
    if (path.includes('classes')) return 'classes';
    if (path.includes('attendance')) return 'attendance';
    if (path.includes('semester-marks')) return 'semester-marks';
    if (path.includes('internal-marks')) return 'internal-marks';
    if (path.includes('reports')) return 'reports';
    if (path.includes('downloads')) return 'downloads';
    if (path.includes('history')) return 'history';
    if (path.includes('settings')) return 'settings';
    if (path.includes('about')) return 'about';
    return 'dashboard';
  }

  async init() {
    this.setupEventListeners();
    await this.loadAllData();
    this.renderPage();
  }

  async loadAllData() {
    try {
      this.data.departments = await api.request('departments');
      this.data.faculty = await api.request('faculty');
      this.data.students = await api.request('students');
      this.data.subjects = await api.request('subjects');
      this.data.classes = await api.request('classes');
      this.data.attendance = await api.request('attendance');
      this.data.semesterMarks = await api.request('semester-marks');
      this.data.internalMarks = await api.request('internal-marks');
      this.data.history = await api.request('history');

      this.populateDeptDropdowns();
    } catch (err) {
      console.error('Failed to load data from MongoDB API:', err.message);
      this.showToast(`MongoDB Connection Error: ${err.message}`, 'error');
    }
  }

  getDepartmentOptions(includeAll = false) {
    const defaultDepts = [
      { code: 'AI & DS', name: 'Artificial Intelligence & Data Science' },
      { code: 'CSE', name: 'Computer Science & Engineering' },
      { code: 'ECE', name: 'Electronics & Communication Engineering' },
      { code: 'EEE', name: 'Electrical & Electronics Engineering' },
      { code: 'Mechanical', name: 'Mechanical Engineering' },
      { code: 'Civil', name: 'Civil Engineering' }
    ];

    const map = new Map();
    defaultDepts.forEach(d => map.set(d.code, d));

    (this.data.departments || []).forEach(d => {
      if (d && d.code) {
        map.set(d.code, { code: d.code, name: d.name || d.code });
      }
    });

    const list = Array.from(map.values());
    const optionsHtml = list.map(d => `<option value="${d.code}">${d.code} - ${d.name}</option>`).join('');

    if (includeAll) {
      return `<option value="">All Departments</option>` + optionsHtml;
    }
    return optionsHtml;
  }

  populateDeptDropdowns() {
    const deptOptions = this.getDepartmentOptions(true);

    ['studentDeptFilter', 'facultyDeptFilter', 'attendanceDeptFilter', 'reportDeptSelect'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = deptOptions;
    });
  }

  setupEventListeners() {
    // Search & Filters
    document.getElementById('studentSearchInput')?.addEventListener('input', () => this.renderStudentsTable());
    document.getElementById('studentDeptFilter')?.addEventListener('change', () => this.renderStudentsTable());
    document.getElementById('studentYearFilter')?.addEventListener('change', () => this.renderStudentsTable());

    document.getElementById('facultySearchInput')?.addEventListener('input', () => this.renderFacultyTable());
    document.getElementById('facultyDeptFilter')?.addEventListener('change', () => this.renderFacultyTable());

    document.getElementById('attendanceSearchInput')?.addEventListener('input', () => this.renderAttendanceTable());
    document.getElementById('attendanceStatusFilter')?.addEventListener('change', () => this.renderAttendanceTable());

    document.getElementById('reportModuleSelect')?.addEventListener('change', () => this.renderReportPreview());
    document.getElementById('reportDeptSelect')?.addEventListener('change', () => this.renderReportPreview());

    document.getElementById('btnGeneratePDFReport')?.addEventListener('click', () => this.downloadReportPDF());
    document.getElementById('btnGenerateExcelReport')?.addEventListener('click', () => this.downloadReportExcel());
    document.getElementById('btnPrintReport')?.addEventListener('click', () => this.printReport());

    document.getElementById('settingRoleSelect')?.addEventListener('change', (e) => {
      localStorage.setItem('jp_dms_role', e.target.value);
      const roleText = document.getElementById('roleLabelText');
      if (roleText) roleText.textContent = e.target.value;
      this.showToast(`Permission Mode: ${e.target.value}`, 'success');
    });

    document.getElementById('universalModalForm')?.addEventListener('submit', (e) => this.handleModalSubmit(e));
  }

  renderPage() {
    switch (this.currentPage) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'students':
        this.renderStudentsTable();
        break;
      case 'faculty':
        this.renderFacultyTable();
        break;
      case 'departments':
        this.renderDepartmentsTable();
        break;
      case 'subjects':
        this.renderSubjectsTable();
        break;
      case 'classes':
        this.renderClassesTable();
        break;
      case 'attendance':
        this.renderAttendanceTable();
        break;
      case 'semester-marks':
        this.renderSemesterMarksTable();
        break;
      case 'internal-marks':
        this.renderInternalMarksTable();
        break;
      case 'reports':
        this.renderReportPreview();
        break;
      case 'history':
        this.renderHistoryTable();
        break;
    }
  }

  renderDashboard() {
    const sEl = document.getElementById('statTotalStudents');
    if (sEl) sEl.textContent = this.data.students.length;
    const fEl = document.getElementById('statTotalFaculty');
    if (fEl) fEl.textContent = this.data.faculty.length;
    const dEl = document.getElementById('statTotalDepts');
    if (dEl) dEl.textContent = this.data.departments.length;
    const subEl = document.getElementById('statTotalSubjects');
    if (subEl) subEl.textContent = this.data.subjects.length;
    const cEl = document.getElementById('statTotalClasses');
    if (cEl) cEl.textContent = this.data.classes.length;

    if (typeof charts !== 'undefined') {
      charts.initDashboardCharts(this.data.students, this.data.attendance, this.data.semesterMarks);
    }

    const tbody = document.getElementById('dashboardActivityTbody');
    if (tbody) {
      const recent = this.data.history.slice(0, 5);
      tbody.innerHTML = recent.map(h => `
        <tr>
          <td>${h.date} ${h.time}</td>
          <td><strong style="color:var(--gold-primary);">${h.action}</strong></td>
          <td>${h.user}</td>
          <td><span class="status-badge badge-od">${h.department}</span></td>
          <td>${h.details || '-'}</td>
        </tr>
      `).join('');
    }
  }

  renderStudentsTable() {
    const search = (document.getElementById('studentSearchInput')?.value || '').toLowerCase();
    const deptFilter = document.getElementById('studentDeptFilter')?.value || '';
    const yearFilter = document.getElementById('studentYearFilter')?.value || '';

    const filtered = this.data.students.filter(s => {
      const matchesSearch = (s.studentName || '').toLowerCase().includes(search) ||
                            (s.registerNo || '').toLowerCase().includes(search) ||
                            (s.rollNumber || '').toLowerCase().includes(search);
      const matchesDept = !deptFilter || s.department === deptFilter;
      const matchesYear = !yearFilter || s.year === yearFilter;
      return matchesSearch && matchesDept && matchesYear;
    });

    const tbody = document.getElementById('studentsTbody');
    if (tbody) {
      if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;">No students found matching criteria.</td></tr>`;
        return;
      }
      tbody.innerHTML = filtered.map(s => `
        <tr>
          <td>
            <img src="${s.photo || 'https://via.placeholder.com/40'}" class="student-img-thumb" alt="photo" onerror="this.src='https://via.placeholder.com/40'">
          </td>
          <td><strong>${s.registerNo || '-'}</strong></td>
          <td><a href="javascript:void(0)" onclick="app.viewStudentProfile('${s._id}')" style="color:var(--gold-primary); text-decoration:none; font-weight:600;">${s.studentName || '-'}</a></td>
          <td>${s.rollNumber || '-'}</td>
          <td><span class="status-badge badge-od">${s.department || '-'}</span></td>
          <td>${s.year || '-'} (${s.semester || '-'})</td>
          <td>${s.phone || '-'}</td>
          <td>
            <button class="btn-icon btn-icon-edit" onclick="app.viewStudentProfile('${s._id}')" title="View Profile"><i class="fa-solid fa-eye"></i></button>
            <button class="btn-icon btn-icon-edit" onclick="app.editStudent('${s._id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-icon btn-icon-delete" onclick="app.deleteStudent('${s._id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }
  }

  viewStudentProfile(id) {
    const s = this.data.students.find(item => item._id === id);
    if (!s) return;
    this.viewingStudentId = id;

    const modal = document.getElementById('studentProfileModal');
    const content = document.getElementById('studentProfileContent');

    if (content) {
      content.innerHTML = `
        <div style="display:flex; gap:20px; align-items:center; margin-bottom:20px; border-bottom:1px solid var(--border-subtle); padding-bottom:16px;">
          <img src="${s.photo || 'https://via.placeholder.com/100'}" style="width:100px; height:100px; border-radius:50%; border:2px solid var(--gold-primary); object-fit:cover;" onerror="this.src='https://via.placeholder.com/100'">
          <div>
            <h2 style="color:var(--gold-primary); margin-bottom:4px;">${s.studentName || 'N/A'}</h2>
            <p style="color:var(--text-secondary); font-size:0.9rem;">Register No: <strong>${s.registerNo || 'N/A'}</strong> | Roll No: ${s.rollNumber || 'N/A'}</p>
            <span class="status-badge badge-od" style="margin-top:6px;">${s.department || 'N/A'} - ${s.year || ''}</span>
          </div>
        </div>
        <div class="form-grid" style="grid-template-columns:1fr 1fr; gap:12px; font-size:0.88rem;">
          <div><strong>Semester:</strong> ${s.semester || 'N/A'}</div>
          <div><strong>Section:</strong> ${s.section || 'A'}</div>
          <div><strong>Phone:</strong> ${s.phone || 'N/A'}</div>
          <div><strong>Email:</strong> ${s.email || 'N/A'}</div>
          <div><strong>Parent Name:</strong> ${s.parentName || 'N/A'}</div>
          <div><strong>Parent Phone:</strong> ${s.parentPhone || 'N/A'}</div>
          <div><strong>Blood Group:</strong> ${s.bloodGroup || 'N/A'}</div>
          <div><strong>Date of Birth:</strong> ${s.dateOfBirth || 'N/A'}</div>
          <div style="grid-column:1 / -1;"><strong>Address:</strong> ${s.address || 'N/A'}</div>
        </div>
      `;
    }
    modal?.classList.add('active');
  }

  closeProfileModal() {
    document.getElementById('studentProfileModal')?.classList.remove('active');
  }

  printSingleStudentProfile() {
    const contentHtml = document.getElementById('studentProfileContent')?.innerHTML;
    exporter.printView('Student Profile Card', contentHtml);
  }

  renderFacultyTable() {
    const search = (document.getElementById('facultySearchInput')?.value || '').toLowerCase();
    const deptFilter = document.getElementById('facultyDeptFilter')?.value || '';

    const filtered = this.data.faculty.filter(f => {
      const matchesSearch = (f.facultyName || '').toLowerCase().includes(search) ||
                            (f.facultyId || '').toLowerCase().includes(search) ||
                            (f.qualification || '').toLowerCase().includes(search);
      const matchesDept = !deptFilter || f.department === deptFilter;
      return matchesSearch && matchesDept;
    });

    const tbody = document.getElementById('facultyTbody');
    if (tbody) {
      tbody.innerHTML = filtered.map(f => `
        <tr>
          <td><strong>${f.facultyId || '-'}</strong></td>
          <td>${f.facultyName || '-'}</td>
          <td>${f.designation || 'Assistant Professor'}</td>
          <td><span class="status-badge badge-od">${f.department || '-'}</span></td>
          <td>${f.subject || '-'}</td>
          <td>${f.qualification || '-'}</td>
          <td>${f.experience || '-'}</td>
          <td>${f.phone || '-'}<br><small style="color:var(--text-muted);">${f.email || ''}</small></td>
          <td>
            <button class="btn-icon btn-icon-edit" onclick="app.editFaculty('${f._id}')"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-icon btn-icon-delete" onclick="app.deleteFaculty('${f._id}')"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }
  }

  renderDepartmentsTable() {
    const tbody = document.getElementById('departmentsTbody');
    if (tbody) {
      tbody.innerHTML = this.data.departments.map(d => `
        <tr>
          <td><strong style="color:var(--gold-primary);">${d.code}</strong></td>
          <td>${d.name}</td>
          <td>${d.hodName || '-'}</td>
          <td>${d.establishedYear || '2010'}</td>
          <td>${d.description || '-'}</td>
          <td>
            <button class="btn-icon btn-icon-edit" onclick="app.editDepartment('${d._id}')"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-icon btn-icon-delete" onclick="app.deleteDepartment('${d._id}')"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }
  }

  renderSubjectsTable() {
    const tbody = document.getElementById('subjectsTbody');
    if (tbody) {
      tbody.innerHTML = this.data.subjects.map(s => `
        <tr>
          <td><strong>${s.subjectCode}</strong></td>
          <td>${s.subjectName}</td>
          <td><span class="status-badge badge-od">${s.department}</span></td>
          <td>${s.semester}</td>
          <td><strong style="color:var(--gold-primary);">${s.credits} Credits</strong></td>
          <td>${s.facultyName || '-'}</td>
          <td>
            <button class="btn-icon btn-icon-edit" onclick="app.editSubject('${s._id}')"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-icon btn-icon-delete" onclick="app.deleteSubject('${s._id}')"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }
  }

  renderClassesTable() {
    const tbody = document.getElementById('classesTbody');
    if (tbody) {
      tbody.innerHTML = this.data.classes.map(c => `
        <tr>
          <td><strong style="color:var(--gold-primary);">${c.className}</strong></td>
          <td>${c.department}</td>
          <td>${c.year}</td>
          <td>${c.semester}</td>
          <td>Sec ${c.section}</td>
          <td>${c.classAdvisor || '-'}</td>
          <td>
            <button class="btn-icon btn-icon-edit" onclick="app.editClass('${c._id}')"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-icon btn-icon-delete" onclick="app.deleteClass('${c._id}')"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }
  }

  renderAttendanceTable() {
    const datePicker = document.getElementById('attendanceDatePicker');
    if (datePicker && !datePicker.value) {
      datePicker.value = new Date().toISOString().split('T')[0];
    }
    const selectedDate = datePicker?.value || new Date().toISOString().split('T')[0];

    const search = (document.getElementById('attendanceSearchInput')?.value || '').toLowerCase();
    const deptFilter = document.getElementById('attendanceDeptFilter')?.value || '';
    const statusFilter = document.getElementById('attendanceStatusFilter')?.value || '';

    // Store temporary attendance states
    if (!this.tempAttendance) this.tempAttendance = {};

    const filteredStudents = this.data.students.filter(s => {
      const matchesSearch = (s.studentName || '').toLowerCase().includes(search) ||
                            (s.registerNo || '').toLowerCase().includes(search);
      const matchesDept = !deptFilter || s.department === deptFilter;
      return matchesSearch && matchesDept;
    });

    const tbody = document.getElementById('attendanceTbody');
    if (tbody) {
      if (!filteredStudents.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">No students found for selected criteria.</td></tr>`;
        return;
      }

      tbody.innerHTML = filteredStudents.map(s => {
        // Find existing record or fallback to temp or 'Present'
        const existingRecord = this.data.attendance.find(a => a.studentRegisterNo === s.registerNo && a.date === selectedDate);
        const currentStatus = this.tempAttendance[s.registerNo] || existingRecord?.status || 'Present';
        const currentPct = existingRecord?.percentage || 95;

        return `
          <tr>
            <td><strong>${s.registerNo || '-'}</strong></td>
            <td>${s.studentName || '-'}</td>
            <td><span class="status-badge badge-od">${s.department || '-'}</span></td>
            <td>
              <div class="att-toggle-group">
                <button type="button" onclick="app.setQuickStatus('${s.registerNo}', 'Present')" class="btn-att-pill ${currentStatus === 'Present' ? 'active-present' : ''}">
                  <i class="fa-solid fa-check"></i> Present
                </button>
                <button type="button" onclick="app.setQuickStatus('${s.registerNo}', 'Absent')" class="btn-att-pill ${currentStatus === 'Absent' ? 'active-absent' : ''}">
                  <i class="fa-solid fa-xmark"></i> Absent
                </button>
                <button type="button" onclick="app.setQuickStatus('${s.registerNo}', 'OD')" class="btn-att-pill ${currentStatus === 'OD' ? 'active-od' : ''}">
                  <i class="fa-solid fa-file-contract"></i> OD
                </button>
                <button type="button" onclick="app.setQuickStatus('${s.registerNo}', 'Leave')" class="btn-att-pill ${currentStatus === 'Leave' ? 'active-leave' : ''}">
                  <i class="fa-solid fa-user-clock"></i> Leave
                </button>
              </div>
            </td>
            <td><strong>${currentPct}%</strong></td>
            <td>${existingRecord?.remarks || 'Daily Entry'}</td>
            <td>
              <button class="btn-icon btn-icon-edit" onclick="app.editAttendance('${existingRecord?._id || ''}')" title="Edit Remarks"><i class="fa-solid fa-pen"></i></button>
              ${existingRecord ? `<button class="btn-icon btn-icon-delete" onclick="app.deleteAttendance('${existingRecord._id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>` : ''}
            </td>
          </tr>
        `;
      }).join('');
    }

    // Attach listener to date picker if present
    datePicker?.removeEventListener('change', () => this.renderAttendanceTable());
    datePicker?.addEventListener('change', () => this.renderAttendanceTable());
    document.getElementById('attendanceDeptFilter')?.addEventListener('change', () => this.renderAttendanceTable());
  }

  setQuickStatus(regNo, status) {
    if (!this.tempAttendance) this.tempAttendance = {};
    this.tempAttendance[regNo] = status;
    this.renderAttendanceTable();
  }

  markAllAttendancePresent() {
    if (!this.tempAttendance) this.tempAttendance = {};
    this.data.students.forEach(s => {
      this.tempAttendance[s.registerNo] = 'Present';
    });
    this.renderAttendanceTable();
    this.showToast('All displayed students marked as Present!', 'info');
  }

  async saveBatchAttendance() {
    const selectedDate = document.getElementById('attendanceDatePicker')?.value || new Date().toISOString().split('T')[0];

    let savedCount = 0;
    if (this.tempAttendance) {
      for (const regNo of Object.keys(this.tempAttendance)) {
        const status = this.tempAttendance[regNo];
        const student = this.data.students.find(s => s.registerNo === regNo);
        if (!student) continue;

        const existingRecord = this.data.attendance.find(a => a.studentRegisterNo === regNo && a.date === selectedDate);
        const body = {
          date: selectedDate,
          studentRegisterNo: regNo,
          studentName: student.studentName,
          department: student.department,
          semester: student.semester || 'Semester V',
          status,
          percentage: status === 'Present' || status === 'OD' ? 95 : 85,
          remarks: `Fast Marked: ${status}`
        };

        if (existingRecord) {
          await api.request(`attendance/${existingRecord._id}`, 'PUT', body);
        } else {
          await api.request('attendance', 'POST', body);
        }
        savedCount++;
      }
    }

    await this.loadAllData();
    this.renderAttendanceTable();
    this.showToast(`Saved attendance for ${savedCount || this.data.students.length} students successfully!`, 'success');
  }

  renderSemesterMarksTable() {
    const tbody = document.getElementById('semesterMarksTbody');
    if (tbody) {
      tbody.innerHTML = this.data.semesterMarks.map(m => `
        <tr>
          <td><strong>${m.studentRegisterNo}</strong></td>
          <td>${m.studentName}</td>
          <td>${m.department}</td>
          <td>${m.subjectCode} - ${m.subjectName || ''}</td>
          <td><strong style="color:var(--gold-primary);">${m.grade}</strong></td>
          <td>${m.cgpa}</td>
          <td>${m.arrears}</td>
          <td><span class="status-badge ${m.result === 'PASS' ? 'badge-pass' : 'badge-fail'}">${m.result}</span></td>
          <td>
            <button class="btn-icon btn-icon-edit" onclick="app.editSemesterMark('${m._id}')"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-icon btn-icon-delete" onclick="app.deleteSemesterMark('${m._id}')"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }
  }

  renderInternalMarksTable() {
    const tbody = document.getElementById('internalMarksTbody');
    if (tbody) {
      tbody.innerHTML = this.data.internalMarks.map(i => `
        <tr>
          <td><strong>${i.studentRegisterNo}</strong></td>
          <td>${i.studentName}</td>
          <td>${i.department}</td>
          <td>${i.subjectCode}</td>
          <td>${i.internal1}</td>
          <td>${i.internal2}</td>
          <td>${i.modelExam}</td>
          <td><strong style="color:var(--gold-primary);">${i.totalInternal} / 100</strong></td>
          <td>
            <button class="btn-icon btn-icon-edit" onclick="app.editInternalMark('${i._id}')"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-icon btn-icon-delete" onclick="app.deleteInternalMark('${i._id}')"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }
  }

  renderHistoryTable() {
    const tbody = document.getElementById('historyTbody');
    if (tbody) {
      tbody.innerHTML = this.data.history.map(h => `
        <tr>
          <td>${h.date}</td>
          <td>${h.time}</td>
          <td><strong style="color:var(--gold-primary);">${h.action}</strong></td>
          <td>${h.user}</td>
          <td><span class="status-badge badge-od">${h.department}</span></td>
          <td>${h.details || '-'}</td>
        </tr>
      `).join('');
    }
  }

  renderReportPreview() {
    const moduleSelect = document.getElementById('reportModuleSelect')?.value || 'students';
    const deptSelect = document.getElementById('reportDeptSelect')?.value || '';

    const thead = document.getElementById('reportPreviewThead');
    const tbody = document.getElementById('reportPreviewTbody');

    if (!thead || !tbody) return;

    if (moduleSelect === 'students') {
      thead.innerHTML = `<tr><th>Register No</th><th>Name</th><th>Dept</th><th>Year</th><th>Semester</th><th>Phone</th></tr>`;
      const filtered = this.data.students.filter(s => !deptSelect || s.department === deptSelect);
      tbody.innerHTML = filtered.map(s => `<tr><td>${s.registerNo}</td><td>${s.studentName}</td><td>${s.department}</td><td>${s.year}</td><td>${s.semester}</td><td>${s.phone}</td></tr>`).join('');
    } else if (moduleSelect === 'faculty') {
      thead.innerHTML = `<tr><th>Faculty ID</th><th>Name</th><th>Designation</th><th>Dept</th><th>Subject</th><th>Phone</th></tr>`;
      const filtered = this.data.faculty.filter(f => !deptSelect || f.department === deptSelect);
      tbody.innerHTML = filtered.map(f => `<tr><td>${f.facultyId}</td><td>${f.facultyName}</td><td>${f.designation}</td><td>${f.department}</td><td>${f.subject}</td><td>${f.phone}</td></tr>`).join('');
    } else if (moduleSelect === 'attendance') {
      thead.innerHTML = `<tr><th>Date</th><th>Register No</th><th>Name</th><th>Dept</th><th>Status</th><th>%</th></tr>`;
      const filtered = this.data.attendance.filter(a => !deptSelect || a.department === deptSelect);
      tbody.innerHTML = filtered.map(a => `<tr><td>${a.date}</td><td>${a.studentRegisterNo}</td><td>${a.studentName}</td><td>${a.department}</td><td>${a.status}</td><td>${a.percentage}%</td></tr>`).join('');
    } else if (moduleSelect === 'semesterMarks') {
      thead.innerHTML = `<tr><th>Register No</th><th>Name</th><th>Dept</th><th>Grade</th><th>CGPA</th><th>Result</th></tr>`;
      const filtered = this.data.semesterMarks.filter(m => !deptSelect || m.department === deptSelect);
      tbody.innerHTML = filtered.map(m => `<tr><td>${m.studentRegisterNo}</td><td>${m.studentName}</td><td>${m.department}</td><td>${m.grade}</td><td>${m.cgpa}</td><td>${m.result}</td></tr>`).join('');
    } else if (moduleSelect === 'internalMarks') {
      thead.innerHTML = `<tr><th>Register No</th><th>Name</th><th>Dept</th><th>Internal 1</th><th>Internal 2</th><th>Total</th></tr>`;
      const filtered = this.data.internalMarks.filter(i => !deptSelect || i.department === deptSelect);
      tbody.innerHTML = filtered.map(i => `<tr><td>${i.studentRegisterNo}</td><td>${i.studentName}</td><td>${i.department}</td><td>${i.internal1}</td><td>${i.internal2}</td><td>${i.totalInternal}</td></tr>`).join('');
    } else if (moduleSelect === 'departments') {
      thead.innerHTML = `<tr><th>Code</th><th>Name</th><th>HOD Name</th><th>Established</th></tr>`;
      tbody.innerHTML = this.data.departments.map(d => `<tr><td>${d.code}</td><td>${d.name}</td><td>${d.hodName}</td><td>${d.establishedYear}</td></tr>`).join('');
    } else if (moduleSelect === 'subjects') {
      thead.innerHTML = `<tr><th>Code</th><th>Name</th><th>Dept</th><th>Credits</th><th>Faculty</th></tr>`;
      const filtered = this.data.subjects.filter(s => !deptSelect || s.department === deptSelect);
      tbody.innerHTML = filtered.map(s => `<tr><td>${s.subjectCode}</td><td>${s.subjectName}</td><td>${s.department}</td><td>${s.credits}</td><td>${s.facultyName}</td></tr>`).join('');
    } else if (moduleSelect === 'classes') {
      thead.innerHTML = `<tr><th>Class Name</th><th>Dept</th><th>Year</th><th>Sem</th><th>Advisor</th></tr>`;
      const filtered = this.data.classes.filter(c => !deptSelect || c.department === deptSelect);
      tbody.innerHTML = filtered.map(c => `<tr><td>${c.className}</td><td>${c.department}</td><td>${c.year}</td><td>${c.semester}</td><td>${c.classAdvisor}</td></tr>`).join('');
    }
  }

  downloadReportPDF() {
    const module = document.getElementById('reportModuleSelect')?.value || 'students';
    if (module === 'students') this.downloadStudentsPDF();
    else if (module === 'attendance') this.downloadAttendancePDF();
    else if (module === 'semesterMarks') this.downloadMarksPDF();
    else this.downloadFacultyPDF();
  }

  downloadReportExcel() {
    const module = document.getElementById('reportModuleSelect')?.value || 'students';
    exporter.exportToExcel(`${module}_Report`, this.data[module] || []);
  }

  printReport() {
    const tableHtml = document.getElementById('reportPreviewTable')?.outerHTML;
    exporter.printView('Department Management Report', tableHtml);
  }

  downloadStudentsPDF() {
    const cols = [
      { header: 'Register No', dataKey: 'registerNo' },
      { header: 'Student Name', dataKey: 'studentName' },
      { header: 'Department', dataKey: 'department' },
      { header: 'Year', dataKey: 'year' },
      { header: 'Phone', dataKey: 'phone' }
    ];
    exporter.exportToPDF('Student Master Directory', 'Student_Directory_JPCOE', cols, this.data.students);
  }

  downloadFacultyPDF() {
    const cols = [
      { header: 'Faculty ID', dataKey: 'facultyId' },
      { header: 'Faculty Name', dataKey: 'facultyName' },
      { header: 'Department', dataKey: 'department' },
      { header: 'Subject', dataKey: 'subject' },
      { header: 'Phone', dataKey: 'phone' }
    ];
    exporter.exportToPDF('Faculty Directory', 'Faculty_Directory_JPCOE', cols, this.data.faculty);
  }

  downloadAttendancePDF() {
    const cols = [
      { header: 'Date', dataKey: 'date' },
      { header: 'Register No', dataKey: 'studentRegisterNo' },
      { header: 'Student Name', dataKey: 'studentName' },
      { header: 'Department', dataKey: 'department' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Attendance %', dataKey: 'percentage' }
    ];
    exporter.exportToPDF('Attendance Register Report', 'Attendance_Report_JPCOE', cols, this.data.attendance);
  }

  downloadMarksPDF() {
    const cols = [
      { header: 'Register No', dataKey: 'studentRegisterNo' },
      { header: 'Student Name', dataKey: 'studentName' },
      { header: 'Department', dataKey: 'department' },
      { header: 'Grade', dataKey: 'grade' },
      { header: 'CGPA', dataKey: 'cgpa' },
      { header: 'Result', dataKey: 'result' }
    ];
    exporter.exportToPDF('Semester Marks & Result', 'Semester_Marks_JPCOE', cols, this.data.semesterMarks);
  }

  downloadHistoryPDF() {
    const cols = [
      { header: 'Date', dataKey: 'date' },
      { header: 'Time', dataKey: 'time' },
      { header: 'Action', dataKey: 'action' },
      { header: 'User', dataKey: 'user' },
      { header: 'Department', dataKey: 'department' }
    ];
    exporter.exportToPDF('Audit History Timeline', 'Audit_History_JPCOE', cols, this.data.history);
  }

  downloadBackupJSON() {
    const data = api.exportBackupJSON();
    const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", str);
    downloadAnchor.setAttribute("download", `JPCOE_DMS_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    this.showToast('Database Backup exported successfully!', 'success');
  }

  restoreBackupJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        api.restoreBackupJSON(parsed);
        this.loadAllData().then(() => {
          this.renderPage();
          this.showToast('Database Restored successfully!', 'success');
        });
      } catch (err) {
        alert('Invalid JSON Backup file format!');
      }
    };
    reader.readAsText(file);
  }

  // Modals & Actions
  openAddStudentModal() {
    this.editingId = null;
    this.editingModule = 'students';
    document.getElementById('modalTitleText').innerHTML = `<i class="fa-solid fa-user-plus"></i> Add Student`;
    
    document.getElementById('modalFormGrid').innerHTML = `
      <div class="form-group"><label>Register Number *</label><input type="text" name="registerNo" class="form-control" required placeholder="e.g. 953621104001"></div>
      <div class="form-group"><label>Student Name *</label><input type="text" name="studentName" class="form-control" required placeholder="Full Name"></div>
      <div class="form-group"><label>Roll Number *</label><input type="text" name="rollNumber" class="form-control" required placeholder="e.g. 21AD01"></div>
      <div class="form-group">
        <label>Department *</label>
        <select name="department" class="form-control" required>
          ${this.getDepartmentOptions()}
        </select>
      </div>
      <div class="form-group">
        <label>Year *</label>
        <select name="year" class="form-control" required>
          <option value="I Year">I Year</option>
          <option value="II Year">II Year</option>
          <option value="III Year">III Year</option>
          <option value="IV Year">IV Year</option>
        </select>
      </div>
      <div class="form-group"><label>Semester *</label><input type="text" name="semester" class="form-control" required placeholder="e.g. Semester V"></div>
      <div class="form-group"><label>Section *</label><input type="text" name="section" class="form-control" required value="A"></div>
      <div class="form-group"><label>Phone *</label><input type="text" name="phone" class="form-control" required placeholder="10 digit mobile"></div>
      <div class="form-group"><label>Email *</label><input type="email" name="email" class="form-control" required placeholder="student@jpcoe.ac.in"></div>
      <div class="form-group"><label>Parent Name *</label><input type="text" name="parentName" class="form-control" required placeholder="Parent / Guardian Name"></div>
      <div class="form-group"><label>Parent Phone *</label><input type="text" name="parentPhone" class="form-control" required placeholder="Parent Mobile Number"></div>
      <div class="form-group"><label>Blood Group *</label><input type="text" name="bloodGroup" class="form-control" required placeholder="e.g. O+"></div>
      <div class="form-group"><label>Date of Birth *</label><input type="date" name="dateOfBirth" class="form-control" required></div>
      <div class="form-group"><label>Photo URL (Optional)</label><input type="text" name="photo" class="form-control" placeholder="https://..."></div>
    `;

    document.getElementById('universalModalOverlay')?.classList.add('active');
  }

  editStudent(id) {
    const s = this.data.students.find(item => item._id === id);
    if (!s) return;
    this.editingId = id;
    this.editingModule = 'students';
    this.openAddStudentModal();
    document.getElementById('modalTitleText').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Student`;

    const form = document.getElementById('universalModalForm');
    Object.keys(s).forEach(key => { if (form.elements[key]) form.elements[key].value = s[key]; });
  }

  async deleteStudent(id) {
    if (confirm('Delete student record?')) {
      await api.request(`students/${id}`, 'DELETE');
      await this.loadAllData();
      this.renderPage();
      this.showToast('Student deleted', 'error');
    }
  }

  openAddFacultyModal() {
    this.editingId = null;
    this.editingModule = 'faculty';
    document.getElementById('modalTitleText').innerHTML = `<i class="fa-solid fa-user-tie"></i> Add Faculty`;

    document.getElementById('modalFormGrid').innerHTML = `
      <div class="form-group"><label>Faculty ID</label><input type="text" name="facultyId" class="form-control"></div>
      <div class="form-group"><label>Faculty Name</label><input type="text" name="facultyName" class="form-control"></div>
      <div class="form-group"><label>Designation</label><input type="text" name="designation" class="form-control" value="Assistant Professor"></div>
      <div class="form-group">
        <label>Department</label>
        <select name="department" class="form-control">
          ${this.getDepartmentOptions()}
        </select>
      </div>
      <div class="form-group"><label>Subject</label><input type="text" name="subject" class="form-control"></div>
      <div class="form-group"><label>Qualification</label><input type="text" name="qualification" class="form-control"></div>
      <div class="form-group"><label>Experience</label><input type="text" name="experience" class="form-control"></div>
      <div class="form-group"><label>Phone</label><input type="text" name="phone" class="form-control"></div>
      <div class="form-group"><label>Email</label><input type="email" name="email" class="form-control"></div>
    `;

    document.getElementById('universalModalOverlay')?.classList.add('active');
  }

  editFaculty(id) {
    const f = this.data.faculty.find(item => item._id === id);
    if (!f) return;
    this.editingId = id;
    this.editingModule = 'faculty';
    this.openAddFacultyModal();
    const form = document.getElementById('universalModalForm');
    Object.keys(f).forEach(key => { if (form.elements[key]) form.elements[key].value = f[key]; });
  }

  async deleteFaculty(id) {
    if (confirm('Delete faculty record?')) {
      await api.request(`faculty/${id}`, 'DELETE');
      await this.loadAllData();
      this.renderPage();
    }
  }

  openAddDepartmentModal() {
    this.editingId = null;
    this.editingModule = 'departments';
    document.getElementById('modalTitleText').innerHTML = `<i class="fa-solid fa-building-columns"></i> Add Department`;

    document.getElementById('modalFormGrid').innerHTML = `
      <div class="form-group"><label>Department Code</label><input type="text" name="code" class="form-control" placeholder="e.g. AI&DS"></div>
      <div class="form-group"><label>Department Name</label><input type="text" name="name" class="form-control"></div>
      <div class="form-group"><label>HOD Name</label><input type="text" name="hodName" class="form-control"></div>
      <div class="form-group"><label>Established Year</label><input type="text" name="establishedYear" class="form-control" value="2021"></div>
      <div class="form-group"><label>Description</label><input type="text" name="description" class="form-control"></div>
    `;

    document.getElementById('universalModalOverlay')?.classList.add('active');
  }

  editDepartment(id) {
    const d = this.data.departments.find(item => item._id === id);
    if (!d) return;
    this.editingId = id;
    this.editingModule = 'departments';
    this.openAddDepartmentModal();
    const form = document.getElementById('universalModalForm');
    Object.keys(d).forEach(key => { if (form.elements[key]) form.elements[key].value = d[key]; });
  }

  async deleteDepartment(id) {
    if (confirm('Delete department?')) {
      await api.request(`departments/${id}`, 'DELETE');
      await this.loadAllData();
      this.renderPage();
    }
  }

  openAddSubjectModal() {
    this.editingId = null;
    this.editingModule = 'subjects';
    document.getElementById('modalTitleText').innerHTML = `<i class="fa-solid fa-book-open"></i> Add Subject`;

    document.getElementById('modalFormGrid').innerHTML = `
      <div class="form-group"><label>Subject Code</label><input type="text" name="subjectCode" class="form-control"></div>
      <div class="form-group"><label>Subject Name</label><input type="text" name="subjectName" class="form-control"></div>
      <div class="form-group"><label>Credits</label><input type="number" name="credits" class="form-control" value="3"></div>
      <div class="form-group">
        <label>Department</label>
        <select name="department" class="form-control">
          ${this.getDepartmentOptions()}
        </select>
      </div>
      <div class="form-group"><label>Semester</label><input type="text" name="semester" class="form-control" value="Semester V"></div>
      <div class="form-group"><label>Faculty Name</label><input type="text" name="facultyName" class="form-control"></div>
    `;

    document.getElementById('universalModalOverlay')?.classList.add('active');
  }

  editSubject(id) {
    const s = this.data.subjects.find(item => item._id === id);
    if (!s) return;
    this.editingId = id;
    this.editingModule = 'subjects';
    this.openAddSubjectModal();
    const form = document.getElementById('universalModalForm');
    Object.keys(s).forEach(key => { if (form.elements[key]) form.elements[key].value = s[key]; });
  }

  async deleteSubject(id) {
    if (confirm('Delete subject?')) {
      await api.request(`subjects/${id}`, 'DELETE');
      await this.loadAllData();
      this.renderPage();
    }
  }

  openAddClassModal() {
    this.editingId = null;
    this.editingModule = 'classes';
    document.getElementById('modalTitleText').innerHTML = `<i class="fa-solid fa-door-open"></i> Add Class`;

    document.getElementById('modalFormGrid').innerHTML = `
      <div class="form-group"><label>Class Name</label><input type="text" name="className" class="form-control" placeholder="e.g. III AI&DS A"></div>
      <div class="form-group">
        <label>Department</label>
        <select name="department" class="form-control">
          ${this.getDepartmentOptions()}
        </select>
      </div>
      <div class="form-group"><label>Year</label><input type="text" name="year" class="form-control" value="III Year"></div>
      <div class="form-group"><label>Semester</label><input type="text" name="semester" class="form-control" value="Semester V"></div>
      <div class="form-group"><label>Section</label><input type="text" name="section" class="form-control" value="A"></div>
      <div class="form-group"><label>Class Advisor</label><input type="text" name="classAdvisor" class="form-control"></div>
    `;

    document.getElementById('universalModalOverlay')?.classList.add('active');
  }

  editClass(id) {
    const c = this.data.classes.find(item => item._id === id);
    if (!c) return;
    this.editingId = id;
    this.editingModule = 'classes';
    this.openAddClassModal();
    const form = document.getElementById('universalModalForm');
    Object.keys(c).forEach(key => { if (form.elements[key]) form.elements[key].value = c[key]; });
  }

  async deleteClass(id) {
    if (confirm('Delete class?')) {
      await api.request(`classes/${id}`, 'DELETE');
      await this.loadAllData();
      this.renderPage();
    }
  }

  openAddAttendanceModal() {
    this.editingId = null;
    this.editingModule = 'attendance';
    document.getElementById('modalTitleText').innerHTML = `<i class="fa-solid fa-calendar-check"></i> Mark Attendance`;

    document.getElementById('modalFormGrid').innerHTML = `
      <div class="form-group"><label>Date</label><input type="date" name="date" class="form-control" value="${new Date().toISOString().split('T')[0]}"></div>
      <div class="form-group"><label>Student Register No</label><input type="text" name="studentRegisterNo" class="form-control"></div>
      <div class="form-group"><label>Student Name</label><input type="text" name="studentName" class="form-control"></div>
      <div class="form-group">
        <label>Department</label>
        <select name="department" class="form-control">
          ${this.getDepartmentOptions()}
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select name="status" class="form-control">
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Leave">Leave</option>
          <option value="Medical Leave">Medical Leave</option>
          <option value="OD">On Duty (OD)</option>
          <option value="Late Entry">Late Entry</option>
        </select>
      </div>
      <div class="form-group"><label>Overall Attendance %</label><input type="number" name="percentage" class="form-control" value="95"></div>
      <div class="form-group"><label>Remarks</label><input type="text" name="remarks" class="form-control"></div>
    `;

    document.getElementById('universalModalOverlay')?.classList.add('active');
  }

  editAttendance(id) {
    const a = this.data.attendance.find(item => item._id === id);
    if (!a) return;
    this.editingId = id;
    this.editingModule = 'attendance';
    this.openAddAttendanceModal();
    const form = document.getElementById('universalModalForm');
    Object.keys(a).forEach(key => { if (form.elements[key]) form.elements[key].value = a[key]; });
  }

  async deleteAttendance(id) {
    if (confirm('Delete attendance record?')) {
      await api.request(`attendance/${id}`, 'DELETE');
      await this.loadAllData();
      this.renderPage();
    }
  }

  openAddSemesterMarkModal() {
    this.editingId = null;
    this.editingModule = 'semester-marks';
    document.getElementById('modalTitleText').innerHTML = `<i class="fa-solid fa-graduation-cap"></i> Add Semester Mark`;

    document.getElementById('modalFormGrid').innerHTML = `
      <div class="form-group"><label>Student Register No</label><input type="text" name="studentRegisterNo" class="form-control"></div>
      <div class="form-group"><label>Student Name</label><input type="text" name="studentName" class="form-control"></div>
      <div class="form-group">
        <label>Department</label>
        <select name="department" class="form-control">
          ${this.getDepartmentOptions()}
        </select>
      </div>
      <div class="form-group"><label>Subject Code</label><input type="text" name="subjectCode" class="form-control"></div>
      <div class="form-group"><label>Grade</label><input type="text" name="grade" class="form-control" value="A+"></div>
      <div class="form-group"><label>CGPA</label><input type="number" step="0.1" name="cgpa" class="form-control" value="8.5"></div>
      <div class="form-group"><label>Arrear Count</label><input type="number" name="arrears" class="form-control" value="0"></div>
      <div class="form-group">
        <label>Result Status</label>
        <select name="result" class="form-control">
          <option value="PASS">PASS</option>
          <option value="FAIL">FAIL</option>
        </select>
      </div>
    `;

    document.getElementById('universalModalOverlay')?.classList.add('active');
  }

  editSemesterMark(id) {
    const m = this.data.semesterMarks.find(item => item._id === id);
    if (!m) return;
    this.editingId = id;
    this.editingModule = 'semester-marks';
    this.openAddSemesterMarkModal();
    const form = document.getElementById('universalModalForm');
    Object.keys(m).forEach(key => { if (form.elements[key]) form.elements[key].value = m[key]; });
  }

  async deleteSemesterMark(id) {
    if (confirm('Delete mark?')) {
      await api.request(`semester-marks/${id}`, 'DELETE');
      await this.loadAllData();
      this.renderPage();
    }
  }

  openAddInternalMarkModal() {
    this.editingId = null;
    this.editingModule = 'internal-marks';
    document.getElementById('modalTitleText').innerHTML = `<i class="fa-solid fa-file-signature"></i> Add Internal Mark`;

    document.getElementById('modalFormGrid').innerHTML = `
      <div class="form-group"><label>Student Register No</label><input type="text" name="studentRegisterNo" class="form-control"></div>
      <div class="form-group"><label>Student Name</label><input type="text" name="studentName" class="form-control"></div>
      <div class="form-group">
        <label>Department</label>
        <select name="department" class="form-control">
          ${this.getDepartmentOptions()}
        </select>
      </div>
      <div class="form-group"><label>Subject Code</label><input type="text" name="subjectCode" class="form-control"></div>
      <div class="form-group"><label>Internal 1 (50)</label><input type="number" name="internal1" class="form-control" value="45"></div>
      <div class="form-group"><label>Internal 2 (50)</label><input type="number" name="internal2" class="form-control" value="46"></div>
      <div class="form-group"><label>Model Exam (100)</label><input type="number" name="modelExam" class="form-control" value="90"></div>
    `;

    document.getElementById('universalModalOverlay')?.classList.add('active');
  }

  editInternalMark(id) {
    const i = this.data.internalMarks.find(item => item._id === id);
    if (!i) return;
    this.editingId = id;
    this.editingModule = 'internal-marks';
    this.openAddInternalMarkModal();
    const form = document.getElementById('universalModalForm');
    Object.keys(i).forEach(key => { if (form.elements[key]) form.elements[key].value = i[key]; });
  }

  async deleteInternalMark(id) {
    if (confirm('Delete internal mark?')) {
      await api.request(`internal-marks/${id}`, 'DELETE');
      await this.loadAllData();
      this.renderPage();
    }
  }

  async handleModalSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = {};
    formData.forEach((val, key) => body[key] = val);

    if (this.editingModule === 'internal-marks') {
      const i1 = Number(body.internal1 || 0);
      const i2 = Number(body.internal2 || 0);
      body.totalInternal = Math.round(i1 + i2);
    }

    try {
      if (this.editingId) {
        await api.request(`${this.editingModule}/${this.editingId}`, 'PUT', body);
        this.showToast('Record updated in MongoDB successfully!', 'success');
      } else {
        await api.request(this.editingModule, 'POST', body);
        this.showToast('Record saved to MongoDB successfully!', 'success');
      }

      this.closeModal();
      await this.loadAllData();
      this.renderPage();
    } catch (err) {
      console.error('Save to MongoDB Error:', err.message);
      this.showToast(`MongoDB Save Error: ${err.message}`, 'error');
    }
  }

  closeModal() {
    document.getElementById('universalModalOverlay')?.classList.remove('active');
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

const app = new Application();
document.addEventListener('DOMContentLoaded', () => app.init());
