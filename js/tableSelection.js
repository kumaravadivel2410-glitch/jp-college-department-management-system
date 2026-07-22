/**
 * JP College ERP - Centralized Multi-Select Table Selection & Bulk Actions Manager
 * Provides Select All, Multi-Select Checkboxes, Floating Action Bar, Bulk Delete, Bulk Export & Print
 */
class TableSelectionManager {
  constructor(options = {}) {
    this.tableId = options.tableId || null;
    this.resource = options.resource || 'faculty';
    this.entityLabel = options.entityLabel || 'Faculty Members';
    this.onSelectionChange = options.onSelectionChange || null;
    this.onRefresh = options.onRefresh || null;
    this.getSelectedData = options.getSelectedData || null;

    this.selectedIds = new Set();
    this.toolbarEl = null;

    this.initToolbar();
    this.initConfirmationModal();
  }

  initToolbar() {
    let existing = document.getElementById('erpSelectionToolbar');
    if (existing) {
      this.toolbarEl = existing;
      return;
    }

    const bar = document.createElement('div');
    bar.id = 'erpSelectionToolbar';
    bar.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: #1E3A8A;
      color: #FFFFFF;
      padding: 0.85rem 1.5rem;
      border-radius: 50px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      display: none;
      align-items: center;
      gap: 1.25rem;
      z-index: 9999;
      font-size: 0.9rem;
      font-weight: 700;
    `;

    bar.innerHTML = `
      <div id="erpSelectedCountText" style="display:flex; align-items:center; gap:0.5rem;">
        <i class="fa-solid fa-check-double" style="color:#60A5FA;"></i>
        <span>Selected: 0</span>
      </div>
      <div style="height:20px; width:1px; background:rgba(255,255,255,0.3);"></div>
      <div style="display:flex; gap:0.5rem;">
        <button type="button" id="erpBulkDeleteBtn" style="background:#EF4444; color:#FFF; border:none; padding:0.4rem 0.85rem; border-radius:20px; font-weight:700; cursor:pointer; font-size:0.8rem; display:inline-flex; align-items:center; gap:0.4rem;">
          <i class="fa-solid fa-trash"></i> Delete Selected
        </button>
        <button type="button" id="erpBulkExportBtn" style="background:#10B981; color:#FFF; border:none; padding:0.4rem 0.85rem; border-radius:20px; font-weight:700; cursor:pointer; font-size:0.8rem; display:inline-flex; align-items:center; gap:0.4rem;">
          <i class="fa-solid fa-file-excel"></i> Export Selected
        </button>
        <button type="button" id="erpBulkPrintBtn" style="background:#3B82F6; color:#FFF; border:none; padding:0.4rem 0.85rem; border-radius:20px; font-weight:700; cursor:pointer; font-size:0.8rem; display:inline-flex; align-items:center; gap:0.4rem;">
          <i class="fa-solid fa-print"></i> Print Selected
        </button>
        <select id="erpBulkActionSelect" style="background:#2563EB; color:#FFF; border:none; padding:0.4rem 0.85rem; border-radius:20px; font-weight:700; cursor:pointer; font-size:0.8rem;">
          <option value="" disabled selected>⚡ Bulk Actions & Updates...</option>
          <option value="changeDepartment">Change Department</option>
          <option value="changeYear">Change Year</option>
          <option value="changeSemester">Change Semester</option>
          <option value="changeSection">Change Section</option>
          <option value="changeFaculty">Change Faculty</option>
          <option value="changeSubject">Change Subject</option>
          <option value="activate">Activate Selected</option>
          <option value="deactivate">Deactivate Selected</option>
        </select>
        <button type="button" id="erpCancelSelectionBtn" style="background:rgba(255,255,255,0.15); color:#FFF; border:1px solid rgba(255,255,255,0.3); padding:0.4rem 0.85rem; border-radius:20px; font-weight:700; cursor:pointer; font-size:0.8rem; display:inline-flex; align-items:center; gap:0.4rem;">
          Cancel Selection
        </button>
      </div>
    `;

    document.body.appendChild(bar);
    this.toolbarEl = bar;

    document.getElementById('erpBulkDeleteBtn').addEventListener('click', () => this.handleBulkDelete());
    document.getElementById('erpBulkExportBtn').addEventListener('click', () => this.handleBulkExport());
    document.getElementById('erpBulkPrintBtn').addEventListener('click', () => this.handleBulkPrint());
    document.getElementById('erpBulkActionSelect').addEventListener('change', (e) => {
      const val = e.target.value;
      if (val) {
        this.handleBulkUpdate(val);
        e.target.value = '';
      }
    });
    document.getElementById('erpCancelSelectionBtn').addEventListener('click', () => this.clearSelection());
  }

  initConfirmationModal() {
    let existingModal = document.getElementById('erpBulkDeleteModal');
    if (existingModal) return;

    const modalHtml = `
      <div class="modal-overlay" id="erpBulkDeleteModal" style="z-index: 10000;">
        <div class="modal-box" style="max-width: 440px; border-top: 4px solid #EF4444;">
          <div class="modal-header">
            <h3 style="color: #991B1B;"><i class="fa-solid fa-triangle-exclamation" style="color: #EF4444;"></i> <span id="erpModalTitle">Delete Records</span></h3>
            <button class="close-modal-btn" id="closeErpDeleteModalBtn">&times;</button>
          </div>
          <div style="padding: 1.25rem;">
            <p id="erpModalMessage" style="font-size: 0.95rem; color: #374151; font-weight: 500; margin-bottom: 0.5rem;">
              Are you sure you want to permanently delete the selected records?
            </p>
            <p style="font-size: 0.8rem; color: #EF4444; font-weight: 700; margin-bottom: 1.5rem;">
              This action cannot be undone.
            </p>
            <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
              <button type="button" class="btn-secondary" id="erpModalCancelBtn">Cancel</button>
              <button type="button" class="btn-danger" id="erpModalConfirmBtn" style="background: #EF4444;"><i class="fa-solid fa-trash"></i> Delete</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('closeErpDeleteModalBtn').addEventListener('click', () => {
      document.getElementById('erpBulkDeleteModal').classList.remove('active');
    });
    document.getElementById('erpModalCancelBtn').addEventListener('click', () => {
      document.getElementById('erpBulkDeleteModal').classList.remove('active');
    });
  }

  bindTable(tableOrId, resourceName, onRefreshCallback, getSelectedDataFn, entityLabel = 'Records') {
    this.resource = resourceName || 'faculty';
    this.entityLabel = entityLabel;
    this.onRefresh = onRefreshCallback || null;
    this.getSelectedData = getSelectedDataFn || null;

    const table = typeof tableOrId === 'string' ? document.getElementById(tableOrId) : tableOrId;
    if (!table) return;

    // Header Select All Checkbox
    const headerCheckbox = table.querySelector('thead input[type="checkbox"]');
    if (headerCheckbox) {
      headerCheckbox.checked = false;
      headerCheckbox.onchange = (e) => {
        const isChecked = e.target.checked;
        const rowCheckboxes = table.querySelectorAll('tbody input[type="checkbox"]');
        rowCheckboxes.forEach(cb => {
          cb.checked = isChecked;
          if (isChecked) this.selectedIds.add(cb.value);
          else this.selectedIds.delete(cb.value);
        });
        this.updateToolbarState();
      };
    }

    // Body Row Checkboxes
    const rowCheckboxes = table.querySelectorAll('tbody input[type="checkbox"]');
    rowCheckboxes.forEach(cb => {
      cb.onchange = (e) => {
        if (e.target.checked) this.selectedIds.add(e.target.value);
        else this.selectedIds.delete(e.target.value);

        if (headerCheckbox) {
          headerCheckbox.checked = Array.from(rowCheckboxes).length > 0 && Array.from(rowCheckboxes).every(c => c.checked);
        }
        this.updateToolbarState();
      };
    });

    this.selectedIds.clear();
    this.updateToolbarState();
  }

  updateToolbarState() {
    const count = this.selectedIds.size;
    if (count > 0) {
      this.toolbarEl.style.display = 'flex';
      document.getElementById('erpSelectedCountText').querySelector('span').textContent = `Selected: ${count} ${this.entityLabel}`;
    } else {
      this.toolbarEl.style.display = 'none';
    }

    if (typeof this.onSelectionChange === 'function') {
      this.onSelectionChange(Array.from(this.selectedIds));
    }
  }

  clearSelection() {
    this.selectedIds.clear();
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    this.updateToolbarState();
  }

  handleBulkDelete() {
    const ids = Array.from(this.selectedIds);
    if (ids.length === 0) return alert('No records selected.');

    const entityCapitalized = this.resource.charAt(0).toUpperCase() + this.resource.slice(1);
    const modalTitle = document.getElementById('erpModalTitle');
    const modalMessage = document.getElementById('erpModalMessage');
    const confirmBtn = document.getElementById('erpModalConfirmBtn');
    const deleteModal = document.getElementById('erpBulkDeleteModal');

    if (modalTitle) modalTitle.textContent = `Delete ${entityCapitalized} Records`;
    if (modalMessage) modalMessage.textContent = `Are you sure you want to permanently delete the selected ${this.resource} records?`;

    deleteModal.classList.add('active');

    // Remove old listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.addEventListener('click', async () => {
      deleteModal.classList.remove('active');
      await this.executeBulkDelete(ids);
    });
  }

  async executeBulkDelete(ids) {
    try {
      const token = localStorage.getItem('jp_dms_token');
      const baseUrl = window.APP_CONFIG ? window.APP_CONFIG.getApiBaseUrl() : 'http://localhost:5000/api';

      // Send DELETE request to /api/:resource/bulk-delete
      const res = await fetch(`${baseUrl}/${this.resource}/bulk-delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids })
      });

      let json = await res.json();
      // Fallback to POST if DELETE endpoint is not mapped
      if (!res.ok && res.status === 404) {
        const postRes = await fetch(`${baseUrl}/${this.resource}/bulk-delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ids })
        });
        json = await postRes.json();
      }

      if (json?.success) {
        const deletedCount = json.deleted !== undefined ? json.deleted : (json.deletedCount || ids.length);
        alert(json.message || `Successfully deleted ${deletedCount} ${this.resource} records.`);
        this.clearSelection();
        if (typeof this.onRefresh === 'function') {
          await this.onRefresh();
        } else if (window.app && typeof window.app.loadAllData === 'function') {
          await window.app.loadAllData();
          if (typeof window.app.renderCurrentPage === 'function') window.app.renderCurrentPage();
        }
      } else {
        const errorMsg = json?.message || json?.error || 'Deletion failed.';
        alert(`Delete Failed: ${errorMsg}`);
      }
    } catch (err) {
      alert(`Network Error: ${err.message}`);
    }
  }

  handleBulkExport() {
    const ids = Array.from(this.selectedIds);
    if (ids.length === 0) return alert('No records selected.');

    let dataToExport = [];
    if (typeof this.getSelectedData === 'function') {
      dataToExport = this.getSelectedData(ids);
    }

    if (!Array.isArray(dataToExport) || dataToExport.length === 0) {
      return alert('Selected record details not found to export.');
    }

    if (window.exporter && typeof window.exporter.exportToExcel === 'function') {
      window.exporter.exportToExcel(`JP_College_Selected_${this.resource}`, dataToExport);
    } else {
      alert('Exporter module ready. Exporting selected records...');
    }
  }

  handleBulkPrint() {
    const ids = Array.from(this.selectedIds);
    if (ids.length === 0) return alert('No records selected.');

    let dataToPrint = [];
    if (typeof this.getSelectedData === 'function') {
      dataToPrint = this.getSelectedData(ids);
    }

    const printWin = window.open('', '_blank');
    const headers = dataToPrint.length > 0 ? Object.keys(dataToPrint[0]).slice(0, 8) : [];

    printWin.document.write(`
      <html>
        <head>
          <title>Selected ${this.resource} Report - JP College ERP</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h2 { color: #1E3A8A; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #DDD; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #1E3A8A; color: #FFF; }
          </style>
        </head>
        <body>
          <h2>JP College ERP - Selected ${this.resource.toUpperCase()} Report</h2>
          <p>Generated on ${new Date().toLocaleString()} | Total Selected: ${ids.length}</p>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${dataToPrint.map(row => `<tr>${headers.map(h => `<td>${row[h] !== undefined ? row[h] : ''}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); printWin.close(); }, 500);
  }

  async handleBulkUpdate(actionType) {
    const selectedIds = Array.from(this.selectedIds);
    if (selectedIds.length === 0) return alert('No records selected.');

    let updateData = {};

    if (actionType === 'activate') {
      updateData = { status: 'Active', approvalStatus: 'approved' };
    } else if (actionType === 'deactivate') {
      updateData = { status: 'Inactive', approvalStatus: 'rejected' };
    } else if (actionType === 'changeDepartment') {
      const dept = prompt('Enter target Department:\n(AI & DS, CSE, IT, ECE, EEE, Mechanical, Civil, MBA, English, Mathematics, Physics, Chemistry)');
      if (!dept) return;
      updateData = { department: dept.trim() };
    } else if (actionType === 'changeYear') {
      const yr = prompt('Enter target Academic Year:\n(I Year, II Year, III Year, IV Year)');
      if (!yr) return;
      updateData = { year: yr.trim() };
    } else if (actionType === 'changeSemester') {
      const sem = prompt('Enter target Semester:\n(Semester I, Semester II, ..., Semester VIII)');
      if (!sem) return;
      updateData = { semester: sem.trim() };
    } else if (actionType === 'changeSection') {
      const sec = prompt('Enter target Section:\n(A, B, C, D, E)');
      if (!sec) return;
      updateData = { section: sec.trim() };
    } else if (actionType === 'changeFaculty') {
      const fac = prompt('Enter Faculty Name or Faculty ID:');
      if (!fac) return;
      updateData = { facultyName: fac.trim(), assignedFaculty: fac.trim() };
    } else if (actionType === 'changeSubject') {
      const subj = prompt('Enter Subject Name or Subject Code:');
      if (!subj) return;
      updateData = { subjectName: subj.trim(), subject: subj.trim() };
    }

    if (Object.keys(updateData).length === 0) return;

    try {
      const baseUrl = window.APP_CONFIG ? window.APP_CONFIG.getApiBaseUrl() : 'http://localhost:5000/api';
      const token = localStorage.getItem('jp_dms_token');
      const res = await fetch(`${baseUrl}/${this.resource}/bulk-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds, updateData })
      });
      const json = await res.json();
      if (json.success) {
        alert(`✅ ${json.message}`);
        this.clearSelection();
        if (typeof this.onDeleteCallback === 'function') this.onDeleteCallback();
        else window.location.reload();
      } else {
        alert(`❌ Bulk update failed: ${json.message}`);
      }
    } catch(err) {
      alert(`❌ Error performing bulk update: ${err.message}`);
    }
  }
}

const tableSelection = new TableSelectionManager();
