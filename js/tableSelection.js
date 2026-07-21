/**
 * JP College ERP - Centralized Multi-Select Table Selection & Bulk Actions Manager
 * Provides Select All, Multi-Select Checkboxes, Floating Action Bar, Bulk Delete, Bulk Export & Print
 */
class TableSelectionManager {
  constructor(options = {}) {
    this.tableId = options.tableId || null;
    this.resource = options.resource || 'students';
    this.onSelectionChange = options.onSelectionChange || null;
    this.onRefresh = options.onRefresh || null;
    this.getSelectedData = options.getSelectedData || null;

    this.selectedIds = new Set();
    this.toolbarEl = null;

    this.initToolbar();
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
        <span>0 Selected</span>
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
      </div>
      <button type="button" id="erpClearSelectionBtn" style="background:transparent; color:#9CA3AF; border:none; font-size:1.1rem; cursor:pointer; margin-left:0.5rem;" title="Clear Selection">&times;</button>
    `;

    document.body.appendChild(bar);
    this.toolbarEl = bar;

    document.getElementById('erpBulkDeleteBtn').addEventListener('click', () => this.handleBulkDelete());
    document.getElementById('erpBulkExportBtn').addEventListener('click', () => this.handleBulkExport());
    document.getElementById('erpBulkPrintBtn').addEventListener('click', () => this.handleBulkPrint());
    document.getElementById('erpClearSelectionBtn').addEventListener('click', () => this.clearSelection());
  }

  bindTable(tableOrId, resourceName, onRefreshCallback, getSelectedDataFn) {
    this.resource = resourceName || 'students';
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
          headerCheckbox.checked = Array.from(rowCheckboxes).every(c => c.checked);
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
      document.getElementById('erpSelectedCountText').querySelector('span').textContent = `${count} Record${count > 1 ? 's' : ''} Selected`;
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

  async handleBulkDelete() {
    const ids = Array.from(this.selectedIds);
    if (ids.length === 0) return alert('No records selected.');

    const confirmed = confirm(`Are you sure you want to delete the selected ${ids.length} records permanently from MongoDB Atlas?`);
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('jp_dms_token');
      const baseUrl = window.APP_CONFIG ? window.APP_CONFIG.getApiBaseUrl() : 'http://localhost:5000/api';

      const res = await fetch(`${baseUrl}/${this.resource}/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids })
      });

      const json = await res.json();
      if (json?.success) {
        alert(json.message || `Successfully deleted ${ids.length} records.`);
        this.clearSelection();
        if (typeof this.onRefresh === 'function') {
          await this.onRefresh();
        } else if (window.app && typeof window.app.loadAllData === 'function') {
          await window.app.loadAllData();
          if (typeof window.app.renderCurrentPage === 'function') window.app.renderCurrentPage();
        }
      } else {
        alert(`Delete Failed: ${json.message}`);
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
}

const tableSelection = new TableSelectionManager();
